'use client';

import React from 'react';
import { Printer, X, Award, ShieldCheck, Lock } from 'lucide-react';

interface PrintGradeSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeData: any;
  institutionName: string;
  institutionAddress: string;
}

export default function PrintGradeSlipModal({
  isOpen,
  onClose,
  gradeData,
  institutionName,
  institutionAddress,
}: PrintGradeSlipModalProps) {
  if (!isOpen || !gradeData) return null;

  const { student, enrollment, currentTerm, clearance, grades } = gradeData;
  const isWithheld = clearance?.isWithheld;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '820px',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Modal Action Header (Hidden during actual print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Official Certificate of Grades · Report Card
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              disabled={isWithheld}
              className="btn-saas btn-saas-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <Printer size={14} />
              Print Report Card
            </button>
            <button
              onClick={onClose}
              className="btn-saas"
              style={{ padding: '0.35rem', fontSize: '0.8rem' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-grade-slip"
          style={{
            padding: '2.5rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: '#ffffff',
            color: '#0f172a',
            position: 'relative',
          }}
        >
          {/* Institutional Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', fontWeight: 600 }}>
              Republic of the Philippines
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {institutionName}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '0.1rem' }}>
              {institutionAddress}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '0.1rem' }}>
              Office of the University Registrar · Student Grades Portal (SGP)
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '0.75rem',
                padding: '0.2rem 1rem',
                border: '1px solid #0f172a',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Official Certificate of Grades
            </div>
          </div>

          {/* Student & Academic Info Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '0.75rem',
              padding: '0.85rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              fontSize: '11px',
            }}
          >
            <div>
              <div style={{ display: 'flex', marginBottom: '0.35rem' }}>
                <span style={{ width: '110px', color: '#64748b', fontWeight: 600 }}>Student No:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{student?.studentNo}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '0.35rem' }}>
                <span style={{ width: '110px', color: '#64748b', fontWeight: 600 }}>Student Name:</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{student?.name}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '110px', color: '#64748b', fontWeight: 600 }}>Department:</span>
                <span>{student?.department?.name}</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', marginBottom: '0.35rem' }}>
                <span style={{ width: '100px', color: '#64748b', fontWeight: 600 }}>Program:</span>
                <span style={{ fontWeight: 700 }}>{student?.program?.code} - {student?.program?.name}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '0.35rem' }}>
                <span style={{ width: '100px', color: '#64748b', fontWeight: 600 }}>Year Level:</span>
                <span>Year {student?.yearLevel}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', color: '#64748b', fontWeight: 600 }}>Academic Term:</span>
                <span style={{ fontWeight: 600 }}>{currentTerm?.name}</span>
              </div>
            </div>
          </div>

          {/* If Financial Hold Active, Display Official Withholding Stamp */}
          {isWithheld ? (
            <div
              style={{
                padding: '2.5rem',
                border: '2px dashed #e11d48',
                borderRadius: '6px',
                textAlign: 'center',
                background: '#fff1f2',
                margin: '2rem 0',
              }}
            >
              <Lock size={36} style={{ color: '#e11d48', margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Report Card Withheld — Financial Hold
              </div>
              <div style={{ fontSize: '11px', color: '#be123c', maxWidth: '480px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                Under university regulation, this Certificate of Grades cannot be issued due to an outstanding balance of <strong>₱{clearance.balance?.toLocaleString()}</strong> in SIAS Accounting.
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1rem' }}>
                Please visit the Accounting & Cashiering Office to settle your balance and release your official records.
              </div>
            </div>
          ) : (
            <>
              {/* Official Grades Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '1.25rem',
                  fontSize: '11px',
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc', borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700 }}>Course Code</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700 }}>Descriptive Title</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center', fontWeight: 700 }}>Sec</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center', fontWeight: 700 }}>Units</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center', fontWeight: 700 }}>Final Grade</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center', fontWeight: 700 }}>Remarks</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700 }}>Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {grades?.subjects?.map((sub: any, idx: number) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                      }}
                    >
                      <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'monospace', fontWeight: 600 }}>{sub.code}</td>
                      <td style={{ padding: '0.45rem 0.65rem', fontWeight: 500 }}>{sub.title}</td>
                      <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>{sub.section}</td>
                      <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 600 }}>{sub.totalUnits}</td>
                      <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                        {sub.grade || '--'}
                      </td>
                      <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 600, fontSize: '10px' }}>
                        {sub.remarks}
                      </td>
                      <td style={{ padding: '0.45rem 0.65rem', color: '#475569', fontSize: '10px' }}>{sub.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Statistics Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  marginBottom: '2rem',
                  fontSize: '11px',
                }}
              >
                <div>
                  Total Units Enrolled: <strong>{grades?.totalUnits}</strong> · Passed: <strong>{grades?.passedUnits}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    General Weighted Average (GWA): <strong style={{ fontSize: '13px', fontFamily: 'monospace' }}>{grades?.gwa || 'N/A'}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>
                    {grades?.gwa && parseFloat(grades.gwa) <= 1.25
                      ? "★ President's Lister"
                      : grades?.gwa && parseFloat(grades.gwa) <= 1.75
                      ? "★ Dean's Lister"
                      : '✓ Regular Academic Standing'}
                  </div>
                </div>
              </div>

              {/* Official Signatures Matrix */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '3rem',
                  marginTop: '2.5rem',
                  paddingTop: '1rem',
                  fontSize: '10px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '36px' }} />
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.35rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    College Dean
                  </div>
                  <div style={{ color: '#64748b' }}>Dean, {student?.department?.name}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '36px' }} />
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.35rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Maria Elena Veloso
                  </div>
                  <div style={{ color: '#64748b' }}>University Registrar</div>
                </div>
              </div>

              {/* Authentication Footnote */}
              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '9px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                This Certificate of Grades is an official computerized document generated via the Samar State University Student Grades Portal (SGP) and certified through SIAS student records. Valid only with the official university seal.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
