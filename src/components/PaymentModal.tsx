'use client';

import React, { useState } from 'react';

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
      setError('VALID NUMERIC VALUE GREATER THAN ZERO REQUIRED.');
      return;
    }

    if (numAmount > balance) {
      setError(`VALUE CANNOT EXCEED OUTSTANDING BALANCE: ₱${balance.toFixed(2)}.`);
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
      <div className="modal-content-tactical" style={{ maxWidth: '640px' }}>
        {/* Header Bar */}
        <div className="instrument-header-bar" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[FORM::PAY_03]</span>
            <span style={{ fontWeight: 800 }}>
              EXECUTE_PAYMENT_TRANSACTION // {student?.studentNo} // {student?.lastName}, {student?.firstName}
            </span>
          </div>
          <button onClick={onClose} className="btn-mechanical btn-sm" style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}>
            [ESC]
          </button>
        </div>

        {/* Telemetry Metric Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border-hairline)',
            borderBottom: '1px solid var(--border-hairline)',
            textAlign: 'center',
          }}
        >
          <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.75rem' }}>
            <div className="telemetry-label" style={{ fontSize: '0.62rem' }}>NET_ASSESSMENT</div>
            <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              ₱{Number(assessment.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.75rem' }}>
            <div className="telemetry-label" style={{ fontSize: '0.62rem', color: 'var(--signal-green)' }}>POSTED_CREDITS</div>
            <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--signal-green)' }}>
              ₱{Number(assessment.totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.75rem' }}>
            <div className="telemetry-label" style={{ fontSize: '0.62rem', color: 'var(--signal-red)' }}>BALANCE_DUE</div>
            <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--signal-red)' }}>
              ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div
              style={{
                padding: '0.55rem 0.75rem',
                border: '1px solid var(--signal-red)',
                background: 'var(--signal-red-dim)',
                color: 'var(--signal-red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              [FAULT_DETECTED] {error}
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
              QUICK_PRESET_INJECTIONS
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreset(balance)}
                className="btn-mechanical btn-sm"
              >
                [PAY_FULL: ₱{balance.toFixed(2)}]
              </button>
              {remainingDownpayment > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(remainingDownpayment)}
                  className="btn-mechanical btn-sm"
                  style={{ color: 'var(--signal-green)' }}
                >
                  [PAY_DOWN: ₱{remainingDownpayment.toFixed(2)}]
                </button>
              )}
              {Number(assessment.prelimDue) > 0 && Number(assessment.prelimDue) <= balance && (
                <button
                  type="button"
                  onClick={() => handlePreset(Number(assessment.prelimDue))}
                  className="btn-mechanical btn-sm"
                >
                  [PAY_TERM: ₱{Number(assessment.prelimDue).toFixed(2)}]
                </button>
              )}
            </div>
          </div>

          {/* Amount & Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.65rem' }}>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                PAYMENT_VALUE (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balance}
                required
                className="input-instrument"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                PAYMENT_CHANNEL *
              </label>
              <select
                className="input-instrument"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">[CASH] OVER_THE_COUNTER</option>
                <option value="GCASH">[ELECTRONIC] GCASH</option>
                <option value="PAYMAYA">[ELECTRONIC] MAYA</option>
                <option value="BANK_TRANSFER">[BANK] DIRECT_CLEARING</option>
                <option value="CHECK">[INSTRUMENT] MANAGERS_CHECK</option>
              </select>
            </div>
          </div>

          {/* Reference & Payor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                REFERENCE_ID / TRANSACTION_TRACE
              </label>
              <input
                type="text"
                className="input-instrument"
                placeholder="OPTIONAL REF/CHECK NUMBER"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>

            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                PAYOR_REMITTER_NAME
              </label>
              <input
                type="text"
                className="input-instrument"
                placeholder={student ? `${student.firstName} ${student.lastName}` : 'PAYOR IDENTITY'}
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
              AUDIT_REMARKS // TRANSACTION_MEMO
            </label>
            <input
              type="text"
              className="input-instrument"
              placeholder="e.g. DOWNPAYMENT FOR MAJOR EXAM PERMIT CLEARANCE"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Notice */}
          <div
            style={{
              padding: '0.55rem 0.75rem',
              background: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-hairline)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-dim)',
            }}
          >
            SYS_RULE: TRANSACTION WILL AUTOMATICALLY COMMIT NEXT SEQUENTIAL OR NUMBER AND RECALCULATE EXAM CLEARANCE STATUS.
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
            <button type="button" onClick={onClose} className="btn-mechanical btn-sm">
              [DISCARD]
            </button>
            <button type="submit" disabled={loading} className="btn-mechanical btn-signal-amber btn-sm">
              {loading ? '[EXECUTING...]' : '[EXECUTE_PAYMENT & PRINT_OR]'} <span className="hotkey-tag">↵</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
