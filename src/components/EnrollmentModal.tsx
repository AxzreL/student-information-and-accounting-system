'use client';

import React, { useState, useEffect } from 'react';

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
      setError('SELECT AT LEAST ONE SUBJECT CODE BEFORE COMMITTING.');
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
          schedule: s.labUnits > 0 ? 'TTH 13:00 - 16:00' : 'MWF 08:00 - 09:30',
          room: s.labUnits > 0 ? 'COMP_LAB_02' : 'ROOM_304',
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
        throw new Error(data.error || 'Enrollment transaction aborted');
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
      <div className="modal-content-tactical" style={{ maxWidth: '940px' }}>
        {/* Header Bar */}
        <div className="instrument-header-bar" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[FORM::ENR_02]</span>
            <span style={{ fontWeight: 800 }}>
              LOAD_ALLOCATION_MATRIX // {student.studentNo} // {student.lastName}, {student.firstName}
            </span>
          </div>
          <button onClick={onClose} className="btn-mechanical btn-sm" style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}>
            [ESC]
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: '0.75rem 1rem 0',
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

        <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
            {/* Left: Subject Checklist */}
            <div className="instrument-panel" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="telemetry-label">
                  AVAILABLE_CURRICULAR_SUBJECTS ({selectedSubjectIds.length}_SELECTED)
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button type="button" onClick={selectAll} className="btn-mechanical btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                    [ALL]
                  </button>
                  <button type="button" onClick={clearAll} className="btn-mechanical btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                    [CLR]
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--border-hairline)' }}>
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
                        padding: '0.55rem 0.75rem',
                        borderBottom: '1px solid var(--border-hairline)',
                        background: isChecked ? 'var(--signal-amber-dim)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 800, color: isChecked ? 'var(--signal-amber)' : 'var(--text-dim)' }}>
                          {isChecked ? '[X]' : '[ ]'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, color: isChecked ? 'var(--signal-amber)' : 'var(--text-primary)' }}>
                            {sub.code}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-sans)' }}>
                            {sub.title}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700 }}>{sub.totalUnits}_U</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                          L:{sub.lecUnits} | B:{sub.labUnits}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Telemetry Fee Readout */}
            <div className="instrument-panel" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="instrument-header-bar" style={{ margin: '-0.85rem -0.85rem 0.75rem', padding: '0.45rem 0.85rem' }}>
                  <span>TELEMETRY // COMPUTED_TARIFF</span>
                  <span style={{ color: 'var(--signal-amber)' }}>[LIVE_SYNC]</span>
                </div>

                {/* Unit Readout Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1px',
                    background: 'var(--border-hairline)',
                    border: '1px solid var(--border-hairline)',
                    textAlign: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.5rem' }}>
                    <div className="telemetry-label" style={{ fontSize: '0.6rem' }}>LEC_U</div>
                    <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1rem' }}>{totalLecUnits}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.5rem' }}>
                    <div className="telemetry-label" style={{ fontSize: '0.6rem' }}>LAB_U</div>
                    <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1rem' }}>{totalLabUnits}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-sunken)', padding: '0.5rem' }}>
                    <div className="telemetry-label" style={{ fontSize: '0.6rem', color: 'var(--signal-amber)' }}>SUM_U</div>
                    <div className="telemetry-value" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--signal-amber)' }}>
                      {totalUnits}
                    </div>
                  </div>
                </div>

                {/* Tariff List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>TUITION ({totalUnits}U × ₱250):</span>
                    <span>₱{tuitionTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>MISC_FEES (MANDATORY):</span>
                    <span>₱{miscTotal.toFixed(2)}</span>
                  </div>
                  {labTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>LAB_EQUIP_FEE:</span>
                      <span>₱{labTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>SECURITY_RFID_PASS:</span>
                    <span>₱{otherTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>GROSS_SUBTOTAL:</span>
                    <span>₱{grossTotal.toFixed(2)}</span>
                  </div>

                  {/* Subsidy Selection */}
                  <div style={{ marginTop: '0.35rem' }}>
                    <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.2rem' }}>
                      SCHOLARSHIP_SUBSIDY_PROGRAM
                    </label>
                    <select
                      className="input-instrument"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem' }}
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="None">[NONE] REGULAR_ASSESSMENT</option>
                      <option value="UniFAST Government Subsidy (RA 10931)">[UNIFAST] FREE_HIGHER_ED_100%</option>
                      <option value="Academic Scholar (Full Tuition 100%)">[ACAD_FULL] 100%_TUITION_GRANT</option>
                      <option value="Academic Scholar (Partial Tuition 50%)">[ACAD_PART] 50%_TUITION_GRANT</option>
                      <option value="Employee Dependent (25% Discount)">[DEPENDENT] 25%_TUITION_DISCOUNT</option>
                      <option value="Custom">[CUSTOM] ENTER_DISCOUNT_VAL</option>
                    </select>

                    {discountType === 'Custom' && (
                      <input
                        type="number"
                        className="input-instrument"
                        style={{ marginTop: '0.3rem', padding: '0.3rem 0.5rem' }}
                        placeholder="ENTER AMOUNT (₱)"
                        value={customDiscount}
                        onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--signal-green)', fontWeight: 700 }}>
                      <span>DEDUCTED_SUBSIDY:</span>
                      <span>-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid var(--border-hairline-bright)',
                      marginTop: '0.4rem',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>NET_TOTAL_DUE:</span>
                    <span className="telemetry-value" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--signal-amber)' }}>
                      ₱{netTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {netTotal > 0 && (
                    <div style={{ padding: '0.4rem 0.55rem', background: 'var(--bg-surface-sunken)', border: '1px solid var(--border-hairline)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                      MIN_DOWNPAYMENT: <strong>₱{downpayment.toFixed(2)}</strong> // INST: 3×₱{termSplit.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} className="btn-mechanical btn-sm" style={{ flex: 1 }}>
                  [DISCARD]
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedSubjectIds.length === 0}
                  className="btn-mechanical btn-signal-amber btn-sm"
                  style={{ flex: 1.5 }}
                >
                  {loading ? '[COMMITTING...]' : '[COMMIT_ASSESSMENT]'} <span className="hotkey-tag">↵</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
