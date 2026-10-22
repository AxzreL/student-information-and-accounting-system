import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const termId = searchParams.get('termId');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (termId) where.termId = termId;

    const enrollments = await prisma.enrollment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: { program: true },
        },
        academicTerm: true,
        subjects: {
          include: { subject: true },
        },
        assessment: {
          include: {
            items: true,
            payments: {
              orderBy: { paymentDate: 'desc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, enrollments });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      termId: requestedTermId,
      yearLevel,
      subjects: selectedSubjects, // array of { subjectId, section, schedule, room }
      discountType,
      customDiscountAmount = 0,
      enrollerName = 'Registrar Staff',
    } = body;

    if (!studentId || !selectedSubjects || selectedSubjects.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student and at least one subject are required for enrollment.' },
        { status: 400 }
      );
    }

    // Determine Active Term if not provided
    let termId = requestedTermId;
    if (!termId) {
      const currentTerm = await prisma.academicTerm.findFirst({
        where: { isCurrent: true },
      });
      if (!currentTerm) {
        return NextResponse.json(
          { success: false, error: 'No active academic term configured.' },
          { status: 400 }
        );
      }
      termId = currentTerm.id;
    }

    // Fetch subjects from database
    const subjectIds = selectedSubjects.map((s: any) => s.subjectId);
    const dbSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
    });

    const subjectMap = new Map(dbSubjects.map((s) => [s.id, s]));

    // Calculate Units
    let totalLecUnits = 0;
    let totalLabUnits = 0;
    let totalUnits = 0;

    for (const sub of selectedSubjects) {
      const dbSub = subjectMap.get(sub.subjectId);
      if (dbSub) {
        totalLecUnits += dbSub.lecUnits;
        totalLabUnits += dbSub.labUnits;
        totalUnits += dbSub.totalUnits;
      }
    }

    // Fetch Rates & Fee Templates
    const [settings, feeTemplates] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.feeTemplate.findMany({ where: { isDefault: true } }),
    ]);

    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    const tuitionRate = parseFloat(settingsObj['tuition_rate_per_unit'] || '250.00');

    // Calculate Fees
    const tuitionTotal = totalUnits * tuitionRate;

    let miscTotal = 0;
    const miscItems: { category: any; feeName: string; amount: number }[] = [];

    feeTemplates
      .filter((f) => f.category === 'MISCELLANEOUS')
      .forEach((f) => {
        const amt = Number(f.amount);
        miscTotal += amt;
        miscItems.push({
          category: 'MISCELLANEOUS',
          feeName: f.name,
          amount: amt,
        });
      });

    let labTotal = 0;
    if (totalLabUnits > 0) {
      const labTemplate = feeTemplates.find((f) => f.category === 'LABORATORY');
      labTotal = labTemplate ? Number(labTemplate.amount) : 1200.0;
      miscItems.push({
        category: 'LABORATORY',
        feeName: labTemplate ? labTemplate.name : 'Computer Laboratory Fee',
        amount: labTotal,
      });
    }

    let otherTotal = 0;
    const otherTemplate = feeTemplates.find((f) => f.category === 'OTHER');
    if (otherTemplate) {
      otherTotal = Number(otherTemplate.amount);
      miscItems.push({
        category: 'OTHER',
        feeName: otherTemplate.name,
        amount: otherTotal,
      });
    }

    const grossTotal = tuitionTotal + miscTotal + labTotal + otherTotal;

    // Calculate Discount / Scholarship
    let discountAmount = 0;
    if (discountType === 'UniFAST Government Subsidy (RA 10931)') {
      discountAmount = grossTotal; // 100% Free Higher Education
    } else if (discountType === 'Academic Scholar (Full Tuition 100%)') {
      discountAmount = tuitionTotal;
    } else if (discountType === 'Academic Scholar (Partial Tuition 50%)') {
      discountAmount = tuitionTotal * 0.5;
    } else if (discountType === 'Employee Dependent (25% Discount)') {
      discountAmount = tuitionTotal * 0.25;
    } else if (customDiscountAmount > 0) {
      discountAmount = Math.min(customDiscountAmount, grossTotal);
    }

    const netTotal = Math.max(0, grossTotal - discountAmount);
    const balance = netTotal;

    // Installment milestones
    let downpaymentDue = 0;
    let prelimDue = 0;
    let midtermDue = 0;
    let finalDue = 0;

    if (netTotal > 0) {
      downpaymentDue = Math.round(netTotal * 0.3 * 100) / 100;
      const remaining = netTotal - downpaymentDue;
      const termSlice = Math.round((remaining / 3) * 100) / 100;
      prelimDue = termSlice;
      midtermDue = termSlice;
      finalDue = Math.round((remaining - termSlice * 2) * 100) / 100;
    }

    const examPermitStatus = netTotal === 0 ? 'CLEARED' : 'HOLD';
    const paymentStatus = netTotal === 0 ? 'PAID' : 'UNPAID';
    const enrollmentStatus = netTotal === 0 ? 'OFFICIALLY_ENROLLED' : 'ASSESSED';

    // Execute Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete previous draft/assessment for this term if any
      const existing = await tx.enrollment.findUnique({
        where: {
          studentId_termId: {
            studentId,
            termId,
          },
        },
      });

      if (existing) {
        await tx.enrollment.delete({
          where: { id: existing.id },
        });
      }

      // 2. Create Enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          termId,
          yearLevel: parseInt(yearLevel, 10) || 1,
          status: enrollmentStatus,
          totalLecUnits,
          totalLabUnits,
          totalUnits,
        },
      });

      // 3. Create Enrolled Subjects
      for (const sub of selectedSubjects) {
        await tx.enrolledSubject.create({
          data: {
            enrollmentId: enrollment.id,
            subjectId: sub.subjectId,
            section: sub.section || 'A',
            schedule: sub.schedule || 'TBA',
            room: sub.room || 'TBA',
          },
        });
      }

      // 4. Create Assessment & Items
      const assessment = await tx.assessment.create({
        data: {
          enrollmentId: enrollment.id,
          tuitionFee: tuitionTotal,
          miscTotal,
          labTotal,
          otherTotal,
          grossTotal,
          discountType: discountType || null,
          discountAmount,
          netTotal,
          totalPaid: 0.0,
          balance,
          downpaymentDue,
          prelimDue,
          midtermDue,
          finalDue,
          examPermitStatus,
          status: paymentStatus,
          items: {
            create: [
              {
                category: 'TUITION',
                feeName: `Tuition Fee (${totalUnits} units @ ₱${tuitionRate.toFixed(2)})`,
                amount: tuitionTotal,
              },
              ...miscItems,
            ],
          },
        },
        include: {
          items: true,
        },
      });

      // 5. Audit Log
      const student = await tx.student.findUnique({
        where: { id: studentId },
        include: { program: true },
      });

      await tx.auditLog.create({
        data: {
          userName: enrollerName,
          role: 'REGISTRAR',
          action: 'ENROLL_STUDENT',
          entity: 'Enrollment',
          details: `Enrolled ${student?.firstName} ${student?.lastName} (${student?.studentNo}) - ${totalUnits} units, Assessment: ₱${netTotal.toFixed(2)}`,
        },
      });

      return { enrollment, assessment, student };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in enrollment processing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
