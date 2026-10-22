import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    const [
      totalStudents,
      totalEnrolled,
      totalAssessments,
      recentPayments,
      recentEnrollments,
    ] = await Promise.all([
      prisma.student.count(),
      currentTerm
        ? prisma.enrollment.count({
            where: { termId: currentTerm.id },
          })
        : prisma.enrollment.count(),
      prisma.assessment.findMany({
        select: {
          netTotal: true,
          totalPaid: true,
          balance: true,
          examPermitStatus: true,
        },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { paymentDate: 'desc' },
        include: {
          assessment: {
            include: {
              enrollment: {
                include: {
                  student: {
                    include: { program: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: { program: true },
          },
          academicTerm: true,
          assessment: true,
        },
      }),
    ]);

    // Financial calculations
    let totalAssessed = 0;
    let totalCollected = 0;
    let totalReceivables = 0;
    let examClearedCount = 0;
    let examHoldCount = 0;

    totalAssessments.forEach((a) => {
      totalAssessed += Number(a.netTotal);
      totalCollected += Number(a.totalPaid);
      totalReceivables += Number(a.balance);
      if (a.examPermitStatus === 'CLEARED') {
        examClearedCount++;
      } else {
        examHoldCount++;
      }
    });

    // Today's collections
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayPayments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startOfToday,
        },
      },
      select: { amount: true },
    });

    const todayCollectionTotal = todayPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalEnrolled,
        totalAssessed,
        totalCollected,
        totalReceivables,
        todayCollectionTotal,
        examClearedCount,
        examHoldCount,
      },
      recentPayments,
      recentEnrollments,
      currentTerm,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
