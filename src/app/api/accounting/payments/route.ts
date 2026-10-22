import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const method = searchParams.get('method');

    const where: any = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.paymentDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (method && method !== 'ALL') {
      where.paymentMethod = method;
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        assessment: {
          include: {
            enrollment: {
              include: {
                student: {
                  include: { program: true },
                },
                academicTerm: true,
              },
            },
          },
        },
      },
    });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      success: true,
      payments,
      totalCollected,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      assessmentId,
      amount,
      paymentMethod = 'CASH',
      referenceNo,
      paidBy,
      cashierName = 'Roberto Fernandez, CPA',
      remarks,
    } = body;

    const paymentAmount = parseFloat(amount);
    if (!assessmentId || isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid assessment ID and payment amount greater than 0 are required.' },
        { status: 400 }
      );
    }

    // Run in transaction to guarantee consistency & atomic OR increment
    const result = await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          enrollment: {
            include: {
              student: { include: { program: true } },
              academicTerm: true,
            },
          },
        },
      });

      if (!assessment) {
        throw new Error('Assessment record not found.');
      }

      const currentBalance = Number(assessment.balance);
      if (currentBalance <= 0) {
        throw new Error('This assessment account is already fully paid.');
      }

      // Generate Next Official Receipt (OR) Number
      const year = new Date().getFullYear();
      const latestPayment = await tx.payment.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      let nextOrSeq = 1;
      if (latestPayment && latestPayment.orNumber.includes(`OR-${year}-`)) {
        const parts = latestPayment.orNumber.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
          nextOrSeq = lastNum + 1;
        }
      } else {
        const totalPayments = await tx.payment.count();
        nextOrSeq = totalPayments + 1;
      }

      const orNumber = `OR-${year}-${String(nextOrSeq).padStart(5, '0')}`;

      // Create Payment
      const payment = await tx.payment.create({
        data: {
          assessmentId,
          orNumber,
          amount: paymentAmount,
          paymentMethod,
          referenceNo: referenceNo || null,
          paidBy: paidBy || `${assessment.enrollment.student.firstName} ${assessment.enrollment.student.lastName}`,
          cashierName,
          remarks: remarks || null,
        },
      });

      // Update Assessment Balances
      const newTotalPaid = Number(assessment.totalPaid) + paymentAmount;
      const newBalance = Math.max(0, Number(assessment.netTotal) - newTotalPaid);

      let newStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'PARTIAL';
      if (newBalance <= 0) {
        newStatus = 'PAID';
      } else if (newTotalPaid === 0) {
        newStatus = 'UNPAID';
      }

      // Exam Permit Clearance check:
      // Cleared if fully paid OR if paid amount meets or exceeds downpayment due
      const isCleared =
        newStatus === 'PAID' ||
        newTotalPaid >= Number(assessment.downpaymentDue);

      const examPermitStatus = isCleared ? 'CLEARED' : 'HOLD';

      const updatedAssessment = await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          totalPaid: newTotalPaid,
          balance: newBalance,
          status: newStatus,
          examPermitStatus,
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // Update Enrollment to OFFICIALLY_ENROLLED if downpayment or full paid
      if (isCleared && assessment.enrollment.status !== 'OFFICIALLY_ENROLLED') {
        await tx.enrollment.update({
          where: { id: assessment.enrollmentId },
          data: { status: 'OFFICIALLY_ENROLLED' },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userName: cashierName,
          role: 'CASHIER',
          action: 'RECEIVE_PAYMENT',
          entity: 'Payment',
          details: `Processed payment of ₱${paymentAmount.toFixed(2)} (${paymentMethod}) with receipt ${orNumber} for student ${assessment.enrollment.student.firstName} ${assessment.enrollment.student.lastName} (${assessment.enrollment.student.studentNo}). Remaining balance: ₱${newBalance.toFixed(2)}`,
        },
      });

      return {
        payment,
        assessment: updatedAssessment,
        student: assessment.enrollment.student,
        term: assessment.enrollment.academicTerm,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
