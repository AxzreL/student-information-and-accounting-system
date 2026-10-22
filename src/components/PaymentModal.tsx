'use client';

import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, Info, Check } from 'lucide-react';

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
      setError(`Amount cannot exceed outstanding balance of ₱${balance.toFixed(2)}.`);
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
        throw new Error(data.error || 'Payment execution failed');
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
      <div className="modal-dialog" style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="card-header">
          <div>
            <div className="card-title">Process Payment</div>
            <div className="card-description">
              {student?.firstName} {student?.lastName}{' '}
              <span className="font-mono-numbers" style={{ color: 'var(--text-muted)' }}>
                • {student?.studentNo}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-saas"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Balance Overview Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border-default)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div style={{ background: 'var(--bg-surface-subdued)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Assessment
            </div>
            <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              ₱{Number(assessment.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-subdued)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Paid
            </div>
            <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#10b981', marginTop: '0.25rem' }}>
              ₱{Number(assessment.totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-subdued)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Balance Due
            </div>
            <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.15rem', color: balance > 0 ? '#f43f5e' : '#10b981', marginTop: '0.25rem' }}>
              ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-red-bg)',
                border: '1px solid var(--badge-red-border)',
                color: 'var(--badge-red-text)',
                fontSize: '0.82rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Amount Presets */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreset(balance)}
                className="btn-saas btn-saas-sm"
              >
                Pay Full: <span className="font-mono-numbers" style={{ marginLeft: '0.25rem', fontWeight: 600 }}>₱{balance.toFixed(2)}</span>
              </button>
              {remainingDownpayment > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(remainingDownpayment)}
                  className="btn-saas btn-saas-sm"
                  style={{ borderColor: 'var(--badge-green-border)', color: 'var(--badge-green-text)' }}
                >
                  Pay Downpayment: <span className="font-mono-numbers" style={{ marginLeft: '0.25rem', fontWeight: 600 }}>₱{remainingDownpayment.toFixed(2)}</span>
                </button>
              )}
              {Number(assessment.prelimDue) > 0 && Number(assessment.prelimDue) <= balance && (
                <button
                  type="button"
                  onClick={() => handlePreset(Number(assessment.prelimDue))}
                  className="btn-saas btn-saas-sm"
                >
                  Pay Term: <span className="font-mono-numbers" style={{ marginLeft: '0.25rem', fontWeight: 600 }}>₱{Number(assessment.prelimDue).toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>

          {/* Amount & Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Payment Amount (₱) *
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={balance}
                  required
                  className="saas-input font-mono-numbers"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ paddingLeft: '1.85rem', fontSize: '0.95rem', fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Payment Channel *
              </label>
              <select
                className="saas-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Cash (Over the Counter)</option>
                <option value="GCASH">GCash</option>
                <option value="PAYMAYA">Maya</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHECK">Manager's Check</option>
              </select>
            </div>
          </div>

          {/* Reference & Payor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Reference / Check No.
              </label>
              <input
                type="text"
                className="saas-input font-mono-numbers"
                placeholder="Optional ref or check no."
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Payor / Remitter Name
              </label>
              <input
                type="text"
                className="saas-input"
                placeholder={student ? `${student.firstName} ${student.lastName}` : 'Student or guardian name'}
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Transaction Notes
            </label>
            <input
              type="text"
              className="saas-input"
              placeholder="e.g. Downpayment for major exam permit clearance"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Information Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subdued)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <Info size={15} style={{ flexShrink: 0, marginTop: '0.1rem', color: 'var(--text-muted)' }} />
            <span>
              An Official Receipt (OR) number will be sequentially generated and the student's exam permit clearance will update automatically upon confirmation.
            </span>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.65rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button type="button" onClick={onClose} className="btn-saas">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-saas btn-saas-primary">
              <CreditCard size={15} />
              <span>{loading ? 'Processing...' : 'Record Payment & Print OR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
