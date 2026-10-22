import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        programs: {
          include: {
            programSubjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const subjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    });

    const terms = await prisma.academicTerm.findMany({
      orderBy: { code: 'desc' },
    });

    return NextResponse.json({
      success: true,
      departments,
      subjects,
      terms,
    });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
