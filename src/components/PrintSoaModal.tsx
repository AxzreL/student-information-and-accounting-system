'use client';

import React from 'react';
import { Printer, X, Receipt, CheckCircle, AlertTriangle } from 'lucide-react';

interface PrintSoaModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentData: any;
  institutionName: string;
  institutionAddress: string;
}

export default function PrintSoaModal({
  isOpen,
  onClose,
  assessmentData,
  institutionName,
  institutionAddress,
}: PrintSoaModalProps) {
  if (!isOpen || !assessmentData) return null;

  const { enrollment, payments = [], items = [] } = assessmentData;
  const student = enrollment?.student;
  const term = enrollment?.academicTerm;

  const handlePrint = () => {
    window.print();
  };

  const isCleared = assessmentData.examPermitStatus === 'CLEARED';

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
        }}
      >
        {/* Action Header (Hidden during print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Student Statement of Account (SOA) & Ledger
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm print-allow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Printer size={15} /> Print Statement
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>

        {/* Paper Statement of Account Body */}
        <div
          className="printable-document"
          style={{
            padding: '2.5rem',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineHeight: 1.4,
            backgroundColor: '#ffffff',
          }}
        >
          {/* Official Institution Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
              Republic of the Philippines
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>
              {institutionName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{institutionAddress}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '0.5rem', letterSpacing: '0.05em', color: '#0369a1' }}>
              OFFICIAL STATEMENT OF ACCOUNT & STUDENT LEDGER
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>
              {term?.name || 'Academic Year 2024-2025'}
            </div>
          </div>

          {/* Student Info & Exam Permit Clearance Stamp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Student Info */}
            <div
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>STUDENT ID:</span>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0369a1' }}>{student?.studentNo}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>DEGREE PROGRAM:</span>
                  <div style={{ fontWeight: 'bold' }}>{student?.program?.code} - Year {student?.yearLevel}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>STUDENT NAME:</span>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {student?.lastName}, {student?.firstName} {student?.middleName || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Clearance Stamp Box */}
            <div
              style={{
                border: isCleared ? '2px solid #059669' : '2px solid #dc2626',
                borderRadius: '6px',
                padding: '0.75rem',
                background: isCleared ? '#f0fdf4' : '#fef2f2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em', color: isCleared ? '#059669' : '#dc2626' }}>
                EXAMINATION PERMIT STATUS
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: '900',
                  letterSpacing: '0.05em',
                  color: isCleared ? '#059669' : '#dc2626',
                  marginTop: '0.25rem',
                }}
              >
                {isCleared ? '✓ PERMITTED FOR EXAMS' : '✕ HOLD - SETTLE DUES'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '0.25rem' }}>
                {isCleared
                  ? 'Eligible for Prelims / Midterms Examination'
                  : 'Minimum Downpayment must be paid at Cashier'}
              </div>
            </div>
          </div>

          {/* Account Ledger (Debit / Credit Transactions) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '0.4rem', color: '#1e293b' }}>
              TRANSACTION HISTORY & LEDGER
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderTop: '1px solid #94a3b8', borderBottom: '1px solid #94a3b8' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>DATE</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>REFERENCE / OR #</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>DESCRIPTION</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>DEBIT (FEES)</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>CREDIT (PAID)</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {/* Initial Assessment Charge */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px' }}>{new Date(assessmentData.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>ASSESS-{enrollment?.id?.slice(0, 8)}</td>
                  <td style={{ padding: '6px' }}>
                    Gross Enrollment Assessment ({enrollment?.totalUnits || 0} Units)
                    {Number(assessmentData.discountAmount) > 0 && (
                      <div style={{ fontSize: '10px', color: '#047857' }}>
                        Less: {assessmentData.discountType || 'Scholarship'} (-₱{Number(assessmentData.discountAmount).toFixed(2)})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600' }}>
                    ₱{Number(assessmentData.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>-</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                    ₱{Number(assessmentData.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Payments */}
                {payments.map((p: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: '#f0fdf4' }}>
                    <td style={{ padding: '6px' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#047857' }}>{p.orNumber}</td>
                    <td style={{ padding: '6px' }}>
                      Payment Received ({p.paymentMethod}) {p.referenceNo ? `Ref: ${p.referenceNo}` : ''}
                      {p.remarks && <div style={{ fontSize: '10px', color: '#64748b' }}>Remarks: {p.remarks}</div>}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#047857' }}>
                      ₱{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#64748b' }}>-</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 'bold', background: '#f8fafc', fontSize: '12px' }}>
                  <td colSpan={3} style={{ padding: '8px 6px', textAlign: 'right' }}>TOTALS:</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                    ₱{Number(assessmentData.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#047857' }}>
                    ₱{Number(assessmentData.totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: Number(assessmentData.balance) > 0 ? '#b91c1c' : '#047857' }}>
                    ₱{Number(assessmentData.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Installment Terms Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '2rem',
              background: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>DOWNPAYMENT</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                ₱{Number(assessmentData.downpaymentDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>PRELIM PERIOD</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                ₱{Number(assessmentData.prelimDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>MIDTERM PERIOD</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                ₱{Number(assessmentData.midtermDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>FINAL EXAM PERIOD</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                ₱{Number(assessmentData.finalDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px dotted #94a3b8' }}>
            <div style={{ textAlign: 'center', width: '40%' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                {student?.firstName} {student?.lastName}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Student Conformé</div>
            </div>
            <div style={{ textAlign: 'center', width: '40%' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                Roberto Fernandez, CPA
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Accounting In-Charge</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '1.5rem' }}>
            This statement reflects payments and assessments recorded in the SIAS Database as of {new Date().toLocaleDateString()}.
          </div>
        </div>
      </div>
    </div>
  );
}
