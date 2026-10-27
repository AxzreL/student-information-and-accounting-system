import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/sgp/student-grades?studentId=... or ?studentNo=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentNo = searchParams.get('studentNo') || searchParams.get('studentNumber');

    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      return NextResponse.json({ success: false, error: 'No active academic term found' }, { status: 404 });
    }

    // Get list of all enrolled students for the portal dropdown
    const allEnrolledStudents = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            termId: currentTerm.id,
          },
        },
      },
      include: {
        program: true,
        enrollments: {
          where: { termId: currentTerm.id },
          include: {
            assessment: {
              select: {
                balance: true,
                examPermitStatus: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    const studentRoster = allEnrolledStudents.map((s) => {
      const en = s.enrollments[0];
      const bal = Number(en?.assessment?.balance || 0);
      const isCleared = bal === 0 || en?.assessment?.examPermitStatus === 'CLEARED';
      return {
        id: s.id,
        studentNo: s.studentNo,
        name: `${s.lastName}, ${s.firstName}`,
        programCode: s.program.code,
        yearLevel: s.yearLevel,
        balance: bal,
        examPermitStatus: en?.assessment?.examPermitStatus || 'HOLD',
        isCleared,
      };
    });

    // Determine target student
    let targetStudentId = studentId;
    if (!targetStudentId && studentNo) {
      const found = allEnrolledStudents.find((s) => s.studentNo === studentNo);
      if (found) targetStudentId = found.id;
    }
    if (!targetStudentId && studentRoster.length > 0) {
      targetStudentId = studentRoster[0].id;
    }

    if (!targetStudentId) {
      return NextResponse.json({ success: false, error: 'No enrolled students found', students: [] });
    }

    const studentRecord = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: {
        program: {
          include: { department: true },
        },
        enrollments: {
          where: { termId: currentTerm.id },
          include: {
            academicTerm: true,
            assessment: {
              include: {
                payments: {
                  orderBy: { paymentDate: 'desc' },
                },
              },
            },
            subjects: {
              include: {
                subject: true,
              },
              orderBy: {
                subject: { code: 'asc' },
              },
            },
          },
        },
      },
    });

    if (!studentRecord || studentRecord.enrollments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Student has no active enrollment for the current term',
        students: studentRoster,
      });
    }

    const enrollment = studentRecord.enrollments[0];
    const assessment = enrollment.assessment;
    const balance = Number(assessment?.balance || 0);
    const examPermitStatus = assessment?.examPermitStatus || 'HOLD';
    const totalPaid = Number(assessment?.totalPaid || 0);
    const netTotal = Number(assessment?.netTotal || 0);

    // INTEGRATION RULE: "Balance clearance: the portal checks the student’s balance in SIAS before releasing grades or report cards"
    // Student is cleared if balance is 0 or Cashier has granted CLEARED permit status
    const isCleared = balance === 0 || examPermitStatus === 'CLEARED';
    const isWithheld = !isCleared;

    let totalEarnedGradePoints = 0;
    let totalGradedUnits = 0;
    let passedUnits = 0;
    let failedUnits = 0;
    let incompleteUnits = 0;

    const subjectsData = enrollment.subjects.map((es) => {
      const numRating = parseFloat(es.grade || '0');
      const units = es.subject.totalUnits;

      if (!isNaN(numRating) && numRating > 0 && es.remarks === 'PASSED') {
        passedUnits += units;
        totalEarnedGradePoints += numRating * units;
        totalGradedUnits += units;
      } else if (!isNaN(numRating) && numRating > 0 && es.remarks === 'FAILED') {
        failedUnits += units;
        totalEarnedGradePoints += numRating * units;
        totalGradedUnits += units;
      } else if (es.remarks === 'INCOMPLETE') {
        incompleteUnits += units;
      }

      return {
        id: es.id,
        code: es.subject.code,
        title: es.subject.title,
        lecUnits: es.subject.lecUnits,
        labUnits: es.subject.labUnits,
        totalUnits: units,
        section: es.section,
        schedule: es.schedule,
        room: es.room,
        instructor: es.instructor || 'Prof. Maria Santos, MSIT',
        // If grades are withheld due to financial hold, mask the numerical grades
        prelimGrade: isWithheld ? null : es.prelimGrade ? Number(es.prelimGrade) : null,
        midtermGrade: isWithheld ? null : es.midtermGrade ? Number(es.midtermGrade) : null,
        finalsGrade: isWithheld ? null : es.finalsGrade ? Number(es.finalsGrade) : null,
        grade: isWithheld ? 'WITHHELD' : es.grade || 'UNGRADED',
        remarks: isWithheld ? 'WITHHELD (FINANCIAL HOLD)' : es.remarks || 'UNGRADED',
        isSubmitted: es.isSubmitted,
      };
    });

    const gwa = totalGradedUnits > 0 ? (totalEarnedGradePoints / totalGradedUnits).toFixed(2) : null;

    return NextResponse.json({
      success: true,
      students: studentRoster,
      currentTerm,
      student: {
        id: studentRecord.id,
        studentNo: studentRecord.studentNo,
        firstName: studentRecord.firstName,
        middleName: studentRecord.middleName,
        lastName: studentRecord.lastName,
        name: `${studentRecord.lastName}, ${studentRecord.firstName} ${studentRecord.middleName || ''}`,
        gender: studentRecord.gender,
        yearLevel: studentRecord.yearLevel,
        status: studentRecord.status,
        program: studentRecord.program,
        department: studentRecord.program.department,
      },
      enrollment: {
        id: enrollment.id,
        yearLevel: enrollment.yearLevel,
        status: enrollment.status,
        dateEnrolled: enrollment.dateEnrolled,
        totalUnits: enrollment.totalUnits,
      },
      // Balance Clearance Status directly linked from SIAS Accounting
      clearance: {
        isCleared,
        isWithheld,
        balance,
        examPermitStatus,
        totalPaid,
        netTotal,
        paymentStatus: assessment?.status || 'UNPAID',
        reason: isWithheld
          ? `SSU Financial Clearance Policy: Outstanding balance of ₱${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please settle at Cashier or obtain cashier clearance permit to release official grades and report cards.`
          : 'Student is fully cleared with Accounting. Official grades and Report Card are accessible.',
      },
      grades: {
        subjects: subjectsData,
        totalUnits: enrollment.totalUnits,
        passedUnits: isWithheld ? null : passedUnits,
        failedUnits: isWithheld ? null : failedUnits,
        incompleteUnits: isWithheld ? null : incompleteUnits,
        gwa: isWithheld ? null : gwa,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
