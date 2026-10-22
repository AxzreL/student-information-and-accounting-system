import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const permitStatus = searchParams.get('permitStatus') || '';

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (permitStatus && permitStatus !== 'ALL') {
      where.examPermitStatus = permitStatus;
    }

    if (search) {
      where.enrollment = {
        student: {
          OR: [
            { studentNo: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      };
    }

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        enrollment: {
          include: {
            student: {
              include: { program: true },
            },
            academicTerm: true,
            subjects: {
              include: { subject: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
