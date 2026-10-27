import { jsonWithCors, handleOptions } from '@/lib/cors';
import prisma from '@/lib/prisma';

export async function OPTIONS() {
  return handleOptions();
}

// POST /api/auth/student-login - Handles student portal login for SGP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentNo, password } = body;

    if (!studentNo || !password) {
      return jsonWithCors(
        { success: false, error: 'Student Number and password are required' },
        { status: 400 }
      );
    }

    const cleanStudentNo = studentNo.trim();

    // Look up student in SIAS
    const student = await prisma.student.findUnique({
      where: { studentNo: cleanStudentNo },
      include: {
        program: {
          include: { department: true },
        },
      },
    });

    if (!student) {
      return jsonWithCors(
        {
          success: false,
          error: `No student record found with Student Number "${cleanStudentNo}". Please verify or contact the Registrar.`,
        },
        { status: 401 }
      );
    }

    // Verify password (default "student123")
    const storedPassword = student.passwordHash || 'student123';
    if (storedPassword !== password.trim()) {
      return jsonWithCors(
        { success: false, error: 'Incorrect student password. Default is "student123".' },
        { status: 401 }
      );
    }

    // Check active term & balance clearance
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    let clearanceInfo: any = {
      isCleared: true,
      balance: 0,
      examPermitStatus: 'CLEARED',
    };

    if (currentTerm) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_termId: {
            studentId: student.id,
            termId: currentTerm.id,
          },
        },
        include: {
          assessment: true,
        },
      });

      if (enrollment?.assessment) {
        const bal = Number(enrollment.assessment.balance || 0);
        const permit = enrollment.assessment.examPermitStatus || 'HOLD';
        const isCleared = bal === 0 || permit === 'CLEARED';
        clearanceInfo = {
          isCleared,
          balance: bal,
          examPermitStatus: permit,
          paymentStatus: enrollment.assessment.status,
        };
      }
    }

    return jsonWithCors({
      success: true,
      role: 'STUDENT',
      student: {
        id: student.id,
        studentNo: student.studentNo,
        name: `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.trim(),
        firstName: student.firstName,
        lastName: student.lastName,
        programCode: student.program.code,
        programName: student.program.name,
        departmentName: student.program.department.name,
        yearLevel: student.yearLevel,
        status: student.status,
      },
      clearance: clearanceInfo,
      message: `Welcome, ${student.firstName}!`,
    });
  } catch (error: any) {
    console.error('Error during student login:', error);
    return jsonWithCors({ success: false, error: error.message }, { status: 500 });
  }
}
