'use client';

import React, { useState } from 'react';
import { X, CreditCard, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: any;
  onPaymentSuccess: (result: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  assessment,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen || !assessment) return null;

  const student = assessment.enrollment?.student;
  const balance = Number(assessment.balance || 0);
  const downpaymentDue = Number(assessment.downpaymentDue || 0);
  const totalPaid = Number(assessment.totalPaid || 0);
  const remainingDownpayment = Math.max(0, downpaymentDue - totalPaid);

  const handlePreset = (val: number) => {
    setAmount(val.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (numAmount > balance) {
      setError(`Payment cannot exceed the remaining balance of ₱${balance.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/accounting/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          amount: numAmount,
          paymentMethod,
          referenceNo: referenceNo.trim() || null,
          paidBy: paidBy.trim() || `${student?.firstName} ${student?.lastName}`,
          remarks: remarks.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      onPaymentSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cashier Payment Processing</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {student?.firstName} {student?.lastName} ({student?.studentNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Balance Status Banner */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>NET ASSESSMENT</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }} className="tabular-numbers">
              ₱{Number(assessment.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>TOTAL PAID</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }} className="tabular-numbers">
              ₱{Number(assessment.totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>REMAINING BALANCE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb7185' }} className="tabular-numbers">
              ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              QUICK PAYMENT SHORTCUTS
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreset(balance)}
                className="btn btn-secondary btn-sm"
              >
                Pay Full Balance (₱{balance.toFixed(2)})
              </button>
              {remainingDownpayment > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(remainingDownpayment)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--accent-emerald)' }}
                >
                  Pay Downpayment (₱{remainingDownpayment.toFixed(2)})
                </button>
              )}
              {Number(assessment.prelimDue) > 0 && Number(assessment.prelimDue) <= balance && (
                <button
                  type="button"
                  onClick={() => handlePreset(Number(assessment.prelimDue))}
                  className="btn btn-secondary btn-sm"
                >
                  Pay Installment (₱{Number(assessment.prelimDue).toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Payment Amount & Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                AMOUNT TO PAY (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balance}
                required
                className="input-field"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                PAYMENT METHOD *
              </label>
              <select
                className="input-field"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Cash Over-the-Counter</option>
                <option value="GCASH">GCash</option>
                <option value="PAYMAYA">Maya (PayMaya)</option>
                <option value="BANK_TRANSFER">Bank Direct Deposit / Transfer</option>
                <option value="CHECK">Manager / Company Check</option>
              </select>
            </div>
          </div>

          {/* Reference No & Paid By */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                REFERENCE / TRANSACTION NO.
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Optional (e.g. Ref # for GCash/Bank)"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                RECEIVED FROM (PAYOR NAME)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={student ? `${student.firstName} ${student.lastName}` : 'Student or Parent'}
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              PAYMENT REMARKS / NOTES
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Downpayment for Prelims clearance"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Exam Clearance Notice */}
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={15} />
            <span>
              Processing this payment will auto-generate an Official Receipt (OR) and automatically update Exam Permit Clearance.
            </span>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Processing Receipt...' : 'Collect Payment & Print Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
