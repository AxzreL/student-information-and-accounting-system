import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Compute Philippine collegiate grade point and remarks
export function computeFinalRating(prelim: number | null, midterm: number | null, finals: number | null, manualGrade?: string | null) {
  if (manualGrade && ['INC', 'DRP', 'UW'].includes(manualGrade.toUpperCase())) {
    return {
      computed: null,
      rating: manualGrade.toUpperCase(),
      remarks: manualGrade.toUpperCase() === 'INC' ? 'INCOMPLETE' : 'DROPPED',
    };
  }

  if (prelim === null && midterm === null && finals === null) {
    return { computed: null, rating: null, remarks: 'UNGRADED' };
  }

  // If partial, calculate weighted average with available components
  const p = prelim !== null ? Number(prelim) : 0;
  const m = midterm !== null ? Number(midterm) : 0;
  const f = finals !== null ? Number(finals) : 0;

  // Standard 30% Prelim, 30% Midterm, 40% Finals
  const rawScore = Number((p * 0.3 + m * 0.3 + f * 0.4).toFixed(2));

  let rating = '5.00';
  let remarks = 'FAILED';

  if (rawScore >= 97) rating = '1.00';
  else if (rawScore >= 94) rating = '1.25';
  else if (rawScore >= 91) rating = '1.50';
  else if (rawScore >= 88) rating = '1.75';
  else if (rawScore >= 85) rating = '2.00';
  else if (rawScore >= 82) rating = '2.25';
  else if (rawScore >= 79) rating = '2.50';
  else if (rawScore >= 76) rating = '2.75';
  else if (rawScore >= 75) rating = '3.00';
  else rating = '5.00';

  remarks = Number(rating) <= 3.0 ? 'PASSED' : 'FAILED';

  return { computed: rawScore, rating, remarks };
}

// GET /api/sgp/grades?subjectId=...&section=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const section = searchParams.get('section');

    if (!subjectId || !section) {
      return NextResponse.json({ success: false, error: 'subjectId and section are required' }, { status: 400 });
    }

    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    const enrolledSubjects = await prisma.enrolledSubject.findMany({
      where: {
        subjectId,
        section,
        enrollment: {
          termId: currentTerm?.id,
        },
      },
      include: {
        subject: true,
        enrollment: {
          include: {
            student: {
              include: {
                program: true,
              },
            },
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
      orderBy: {
        enrollment: {
          student: {
            lastName: 'asc',
          },
        },
      },
    });

    const subjectInfo = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    const studentList = enrolledSubjects.map((es) => {
      const student = es.enrollment.student;
      const assessment = es.enrollment.assessment;
      const balance = Number(assessment?.balance || 0);
      const isCleared = balance === 0 || assessment?.examPermitStatus === 'CLEARED';

      return {
        enrolledSubjectId: es.id,
        studentId: student.id,
        studentNo: student.studentNo,
        name: `${student.lastName}, ${student.firstName} ${student.middleName ? student.middleName[0] + '.' : ''}`,
        programCode: student.program.code,
        yearLevel: student.yearLevel,
        prelimGrade: es.prelimGrade ? Number(es.prelimGrade) : null,
        midtermGrade: es.midtermGrade ? Number(es.midtermGrade) : null,
        finalsGrade: es.finalsGrade ? Number(es.finalsGrade) : null,
        computedGrade: es.computedGrade ? Number(es.computedGrade) : null,
        finalRating: es.grade || null,
        remarks: es.remarks || 'UNGRADED',
        isSubmitted: es.isSubmitted,
        submittedAt: es.submittedAt,
        // Balance clearance info from SIAS
        balance,
        examPermitStatus: assessment?.examPermitStatus || 'HOLD',
        isCleared,
      };
    });

    return NextResponse.json({
      success: true,
      subject: subjectInfo,
      section,
      students: studentList,
    });
  } catch (error: any) {
    console.error('Error fetching SGP class grades:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sgp/grades - Save or submit encoded grades for students in a class
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grades, isSubmitting, instructorName } = body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ success: false, error: 'grades array is required' }, { status: 400 });
    }

    const updated = [];

    for (const item of grades) {
      const { enrolledSubjectId, prelimGrade, midtermGrade, finalsGrade, manualGrade } = item;

      const p = prelimGrade !== null && prelimGrade !== undefined && prelimGrade !== '' ? Number(prelimGrade) : null;
      const m = midtermGrade !== null && midtermGrade !== undefined && midtermGrade !== '' ? Number(midtermGrade) : null;
      const f = finalsGrade !== null && finalsGrade !== undefined && finalsGrade !== '' ? Number(finalsGrade) : null;

      const calculation = computeFinalRating(p, m, f, manualGrade);

      const record = await prisma.enrolledSubject.update({
        where: { id: enrolledSubjectId },
        data: {
          prelimGrade: p,
          midtermGrade: m,
          finalsGrade: f,
          computedGrade: calculation.computed,
          grade: calculation.rating,
          remarks: calculation.remarks,
          isSubmitted: Boolean(isSubmitting),
          submittedAt: isSubmitting ? new Date() : undefined,
          instructor: instructorName || 'Prof. Maria Santos, MSIT',
        },
        include: {
          subject: true,
          enrollment: {
            include: {
              student: true,
            },
          },
        },
      });

      updated.push(record);
    }

    // Add an audit log entry in SIAS for accountability
    const sampleRecord = updated[0];
    if (sampleRecord) {
      await prisma.auditLog.create({
        data: {
          userName: instructorName || 'Faculty Instructor',
          role: 'FACULTY',
          action: isSubmitting ? 'SUBMIT_GRADES_OFFICIAL' : 'SAVE_GRADE_DRAFT',
          entity: 'EnrolledSubject',
          details: `${isSubmitting ? 'Officially submitted' : 'Saved draft'} grades for ${updated.length} students in ${sampleRecord.subject.code} - Sec ${sampleRecord.section}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: updated.length,
      isSubmitted: Boolean(isSubmitting),
      message: isSubmitting
        ? `Successfully submitted official grades for ${updated.length} students.`
        : `Successfully saved grade drafts for ${updated.length} students.`,
    });
  } catch (error: any) {
    console.error('Error saving SGP grades:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
