'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  allSubjects: any[];
  currentTerm: any;
  feeTemplates: any[];
  onEnrollmentSuccess: (result: any) => void;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  student,
  allSubjects,
  currentTerm,
  feeTemplates,
  onEnrollmentSuccess,
}: EnrollmentModalProps) {
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState('None');
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student && allSubjects.length > 0) {
      const defaultIds = allSubjects.slice(0, 7).map((s) => s.id);
      setSelectedSubjectIds(defaultIds);
    }
  }, [student, allSubjects]);

  if (!isOpen || !student) return null;

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((item) => item !== id));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedSubjectIds(allSubjects.map((s) => s.id));
  };

  const clearAll = () => {
    setSelectedSubjectIds([]);
  };

  const selectedSubjects = allSubjects.filter((s) => selectedSubjectIds.includes(s.id));
  const totalLecUnits = selectedSubjects.reduce((acc, s) => acc + s.lecUnits, 0);
  const totalLabUnits = selectedSubjects.reduce((acc, s) => acc + s.labUnits, 0);
  const totalUnits = totalLecUnits + totalLabUnits;

  const tuitionRate = 250.0;
  const tuitionTotal = totalUnits * tuitionRate;

  let miscTotal = 0;
  feeTemplates
    .filter((f) => f.category === 'MISCELLANEOUS')
    .forEach((f) => {
      miscTotal += Number(f.amount);
    });

  const labTotal = totalLabUnits > 0 ? 1200.0 : 0.0;
  const otherTotal = 150.0;
  const grossTotal = tuitionTotal + miscTotal + labTotal + otherTotal;

  let discountAmount = 0;
  if (discountType === 'UniFAST Government Subsidy (RA 10931)') {
    discountAmount = grossTotal;
  } else if (discountType === 'Academic Scholar (Full Tuition 100%)') {
    discountAmount = tuitionTotal;
  } else if (discountType === 'Academic Scholar (Partial Tuition 50%)') {
    discountAmount = tuitionTotal * 0.5;
  } else if (discountType === 'Employee Dependent (25% Discount)') {
    discountAmount = tuitionTotal * 0.25;
  } else if (discountType === 'Custom') {
    discountAmount = Math.min(customDiscount || 0, grossTotal);
  }

  const netTotal = Math.max(0, grossTotal - discountAmount);
  const downpayment = netTotal > 0 ? Math.round(netTotal * 0.3 * 100) / 100 : 0;
  const termSplit = netTotal > 0 ? Math.round(((netTotal - downpayment) / 3) * 100) / 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) {
      setError('Please select at least one subject to enroll.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        studentId: student.id,
        termId: currentTerm?.id,
        yearLevel: student.yearLevel,
        subjects: selectedSubjects.map((s) => ({
          subjectId: s.id,
          section: `${student.program?.code || 'GEN'}-${student.yearLevel}A`,
          schedule: s.labUnits > 0 ? 'TTH 1:00 PM - 4:00 PM' : 'MWF 8:00 AM - 9:30 AM',
          room: s.labUnits > 0 ? 'Computer Lab 2' : 'Room 304',
        })),
        discountType: discountType === 'None' ? null : discountType,
        customDiscountAmount: discountType === 'Custom' ? customDiscount : 0,
      };

      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Enrollment transaction failed');
      }

      onEnrollmentSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="card-header">
          <div>
            <div className="card-title">Subject Enrollment & Fee Assessment</div>
            <div className="card-description">
              {student.firstName} {student.lastName} ({student.studentNo}) · {student.program?.name} (Year {student.yearLevel})
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-saas"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: '1rem 1.25rem 0',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--badge-red-border)',
              background: 'var(--badge-red-bg)',
              color: 'var(--badge-red-text)',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.25rem' }}>
            {/* Left: Subject Picker */}
            <div className="saas-card" style={{ padding: '0.85rem', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Select Subjects ({selectedSubjectIds.length} selected)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={selectAll}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                }}
              >
                {allSubjects.map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isChecked ? 'var(--bg-surface-elevated)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background var(--trans-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            border: isChecked ? '1px solid var(--text-primary)' : '1px solid var(--border-strong)',
                            background: isChecked ? 'var(--text-primary)' : 'transparent',
                            color: 'var(--text-inverse)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                            {sub.code}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {sub.title}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {sub.totalUnits} units
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Lec: {sub.lecUnits} · Lab: {sub.labUnits}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Fee Calculation */}
            <div className="saas-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Fee Assessment Breakdown
                </div>

                {/* Unit Readout Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lec Units</div>
                    <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {totalLecUnits}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lab Units</div>
                    <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {totalLabUnits}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Units</div>
                    <div className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {totalUnits}
                    </div>
                  </div>
                </div>

                {/* Tariff List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tuition ({totalUnits} units × ₱250):</span>
                    <span className="font-mono-numbers">₱{tuitionTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Miscellaneous Fees:</span>
                    <span className="font-mono-numbers">₱{miscTotal.toFixed(2)}</span>
                  </div>
                  {labTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Computer Laboratory Fee:</span>
                      <span className="font-mono-numbers">₱{labTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>RFID Student ID Card:</span>
                    <span className="font-mono-numbers">₱{otherTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Gross Assessment:</span>
                    <span className="font-mono-numbers">₱{grossTotal.toFixed(2)}</span>
                  </div>

                  {/* Scholarship Selection */}
                  <div style={{ marginTop: '0.35rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Scholarship / Discount
                    </label>
                    <select
                      className="saas-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="None">None (Standard Tuition)</option>
                      <option value="UniFAST Government Subsidy (RA 10931)">UniFAST Free Higher Ed (100% Free)</option>
                      <option value="Academic Scholar (Full Tuition 100%)">Academic Scholar (100% Tuition)</option>
                      <option value="Academic Scholar (Partial Tuition 50%)">Academic Scholar (50% Tuition)</option>
                      <option value="Employee Dependent (25% Discount)">Employee Dependent (25% Tuition)</option>
                      <option value="Custom">Custom Discount (₱)</option>
                    </select>

                    {discountType === 'Custom' && (
                      <input
                        type="number"
                        className="saas-input"
                        style={{ marginTop: '0.35rem', padding: '0.35rem 0.6rem' }}
                        placeholder="Enter discount in ₱"
                        value={customDiscount}
                        onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 500 }}>
                      <span>Applied Subsidy:</span>
                      <span className="font-mono-numbers">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Net Due */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-default)',
                      marginTop: '0.45rem',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Net Assessment Due:</span>
                    <span className="font-mono-numbers" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      ₱{netTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {netTotal > 0 && (
                    <div style={{ padding: '0.45rem 0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      Downpayment due: <strong>₱{downpayment.toFixed(2)}</strong> · Installments: 3 × ₱{termSplit.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={onClose} className="btn-saas" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedSubjectIds.length === 0}
                  className="btn-saas btn-saas-primary"
                  style={{ flex: 1.5 }}
                >
                  {loading ? 'Confirming...' : 'Confirm & Assess'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
