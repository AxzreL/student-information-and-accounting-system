import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const programId = searchParams.get('programId') || '';
    const yearLevel = searchParams.get('yearLevel') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { studentNo: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    if (programId) {
      where.programId = programId;
    }

    if (yearLevel) {
      where.yearLevel = parseInt(yearLevel, 10);
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { studentNo: 'asc' },
      include: {
        program: {
          include: { department: true },
        },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            academicTerm: true,
            assessment: {
              include: {
                payments: true,
              },
            },
            subjects: {
              include: { subject: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentNo,
      firstName,
      middleName,
      lastName,
      extensionName,
      gender,
      birthDate,
      email,
      phone,
      address,
      yearLevel,
      status,
      programId,
      creatorName = 'Registrar Staff',
    } = body;

    if (!firstName || !lastName || !programId) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and degree program are required.' },
        { status: 400 }
      );
    }

    // Auto-generate student number if empty
    let finalStudentNo = studentNo?.trim();
    if (!finalStudentNo) {
      const year = new Date().getFullYear();
      const count = await prisma.student.count();
      finalStudentNo = `${year}-${String(count + 1).padStart(5, '0')}`;
    }

    const existing = await prisma.student.findUnique({
      where: { studentNo: finalStudentNo },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Student Number ${finalStudentNo} is already registered.` },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentNo: finalStudentNo,
        firstName,
        middleName: middleName || null,
        lastName,
        extensionName: extensionName || null,
        gender: gender || 'Not Specified',
        birthDate: birthDate ? new Date(birthDate) : null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        yearLevel: parseInt(yearLevel, 10) || 1,
        status: status || 'REGULAR',
        programId,
      },
      include: {
        program: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: creatorName,
        role: 'REGISTRAR',
        action: 'CREATE_STUDENT',
        entity: 'Student',
        details: `Admitted new student ${student.firstName} ${student.lastName} (${student.studentNo}) in ${student.program.code}`,
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
