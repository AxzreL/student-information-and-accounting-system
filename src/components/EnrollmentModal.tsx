'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calculator, CheckSquare, Square, AlertCircle, ArrowRight } from 'lucide-react';

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

  // Default select subjects matching student's program and year level
  useEffect(() => {
    if (student && allSubjects.length > 0) {
      // Pick first 6 or 7 relevant subjects by default
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

  // Real-time calculations
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
  const otherTotal = 150.0; // ID fee
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
        throw new Error(data.error || 'Enrollment failed');
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
      <div className="modal-content" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Subject-Level Enrollment & Assessment</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {student.firstName} {student.lastName} ({student.studentNo}) • {student.program?.name} (Year {student.yearLevel})
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

        {error && (
          <div
            style={{
              margin: '1rem 1.75rem 0',
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
            {/* Left: Subject Catalog Selector */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  SELECT SUBJECTS TO ENROLL ({selectedSubjectIds.length} Selected)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={selectAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-emerald)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--border-subtle)' }}>|</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Subjects Scrollable Container */}
              <div
                style={{
                  maxHeight: '360px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
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
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isChecked ? (
                          <CheckSquare size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                        ) : (
                          <Square size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sub.code}</span>
                            {sub.labUnits > 0 && (
                              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                                Has Lab
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.title}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }} className="tabular-numbers">
                          {sub.totalUnits} Units
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          Lec: {sub.lecUnits} | Lab: {sub.labUnits}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Assessment Fee Preview */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Calculator size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Real-time Fee Calculation</h4>
                </div>

                {/* Units Tally */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LEC UNITS</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{totalLecUnits}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LAB UNITS</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{totalLabUnits}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>TOTAL CREDITS</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>
                      {totalUnits}
                    </div>
                  </div>
                </div>

                {/* Breakdown List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tuition ({totalUnits} units × ₱250):</span>
                    <span className="tabular-numbers">₱{tuitionTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Miscellaneous Fees:</span>
                    <span className="tabular-numbers">₱{miscTotal.toFixed(2)}</span>
                  </div>
                  {labTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Computer Lab Fee:</span>
                      <span className="tabular-numbers">₱{labTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Student RFID ID & Pass:</span>
                    <span className="tabular-numbers">₱{otherTotal.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 600,
                    }}
                  >
                    <span>Gross Assessment:</span>
                    <span className="tabular-numbers">₱{grossTotal.toFixed(2)}</span>
                  </div>

                  {/* Scholarship / Discount Selection */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                      DISCOUNT / SCHOLARSHIP
                    </label>
                    <select
                      className="input-field"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="None">None / Regular Tuition</option>
                      <option value="UniFAST Government Subsidy (RA 10931)">UniFAST Free Higher Ed (100% Free)</option>
                      <option value="Academic Scholar (Full Tuition 100%)">Academic Scholar (100% Tuition)</option>
                      <option value="Academic Scholar (Partial Tuition 50%)">Academic Scholar (50% Tuition)</option>
                      <option value="Employee Dependent (25% Discount)">Employee Dependent (25% Tuition)</option>
                      <option value="Custom">Custom Amount (₱)</option>
                    </select>

                    {discountType === 'Custom' && (
                      <input
                        type="number"
                        className="input-field"
                        style={{ marginTop: '0.35rem', padding: '0.4rem' }}
                        placeholder="Enter discount in ₱"
                        value={customDiscount}
                        onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      <span>Grant / Discount:</span>
                      <span className="tabular-numbers">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Net Total Due */}
                  <div
                    style={{
                      marginTop: '0.5rem',
                      borderTop: '2px solid var(--border-strong)',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Net Assessment:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-emerald)' }} className="tabular-numbers">
                      ₱{netTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Installment Guide */}
                  {netTotal > 0 && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.72rem',
                        color: 'var(--text-dim)',
                        background: 'var(--bg-secondary)',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div>
                        Downpayment due: <strong>₱{downpayment.toFixed(2)}</strong>
                      </div>
                      <div>
                        Installments: 3 × ₱{termSplit.toFixed(2)} (Prelims, Midterms, Finals)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedSubjectIds.length === 0}
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  {loading ? 'Processing...' : 'Confirm & Assess'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
