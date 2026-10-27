import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/academic-clearance - Pulls student grade status from SGP to support SIAS clearance & graduation checks
export async function GET() {
  try {
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      return NextResponse.json({ success: false, error: 'No active academic term found' }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      include: {
        program: {
          include: { department: true },
        },
        enrollments: {
          where: { termId: currentTerm.id },
          include: {
            assessment: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { studentNo: 'asc' },
    });

    const reportRows = students.map((st) => {
      const en = st.enrollments[0];
      const assessment = en?.assessment;
      const subjects = en?.subjects || [];

      const balance = Number(assessment?.balance || 0);
      const isFinanciallyCleared = balance === 0 || assessment?.examPermitStatus === 'CLEARED';

      let totalUnits = 0;
      let passedUnits = 0;
      let failedUnits = 0;
      let incUnits = 0;
      let totalEarnedPoints = 0;
      let gradedUnits = 0;

      let hasUngraded = false;

      for (const es of subjects) {
        const u = es.subject.totalUnits;
        totalUnits += u;

        if (es.remarks === 'PASSED') {
          passedUnits += u;
          const rating = parseFloat(es.grade || '0');
          if (rating > 0) {
            totalEarnedPoints += rating * u;
            gradedUnits += u;
          }
        } else if (es.remarks === 'FAILED') {
          failedUnits += u;
          const rating = parseFloat(es.grade || '0');
          if (rating > 0) {
            totalEarnedPoints += rating * u;
            gradedUnits += u;
          }
        } else if (es.remarks === 'INCOMPLETE') {
          incUnits += u;
        } else {
          hasUngraded = true;
        }
      }

      const gwa = gradedUnits > 0 ? (totalEarnedPoints / gradedUnits).toFixed(2) : null;

      // Academic Standing Determination
      let academicStanding = 'IN_PROGRESS';
      if (!hasUngraded && subjects.length > 0) {
        if (failedUnits === 0 && incUnits === 0) {
          academicStanding = 'GOOD_STANDING';
        } else if (failedUnits >= 6) {
          academicStanding = 'ACADEMIC_PROBATION';
        } else if (failedUnits > 0) {
          academicStanding = 'ACADEMIC_WARNING';
        } else if (incUnits > 0) {
          academicStanding = 'INCOMPLETE_RECORD';
        }
      }

      // Academic Clearance: All enrolled subjects passed with no INC
      const isAcademicallyCleared = subjects.length > 0 && failedUnits === 0 && incUnits === 0 && !hasUngraded;

      // Overall Clearance: Both Academic and Financial Clearance are satisfied
      const isOverallCleared = isFinanciallyCleared && isAcademicallyCleared;

      return {
        studentId: st.id,
        studentNo: st.studentNo,
        fullName: `${st.lastName}, ${st.firstName} ${st.middleName ? st.middleName[0] + '.' : ''}`,
        programCode: st.program.code,
        yearLevel: st.yearLevel,
        isEnrolled: !!en,
        enrollmentStatus: en?.status || 'NOT_ENROLLED',
        totalSubjects: subjects.length,
        totalUnits,
        passedUnits,
        failedUnits,
        incUnits,
        gwa,
        academicStanding,
        // SIAS Accounting link
        balance,
        examPermitStatus: assessment?.examPermitStatus || 'HOLD',
        isFinanciallyCleared,
        // Clearance integration decision
        isAcademicallyCleared,
        isOverallCleared,
      };
    });

    return NextResponse.json({
      success: true,
      currentTerm,
      totalCount: reportRows.length,
      report: reportRows,
    });
  } catch (error: any) {
    console.error('Error fetching academic clearance report:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
