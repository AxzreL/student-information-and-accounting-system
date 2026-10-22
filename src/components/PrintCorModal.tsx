'use client';

import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface PrintCorModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentData: any;
  institutionName: string;
  institutionAddress: string;
}

export default function PrintCorModal({
  isOpen,
  onClose,
  enrollmentData,
  institutionName,
  institutionAddress,
}: PrintCorModalProps) {
  if (!isOpen || !enrollmentData) return null;

  const { student, academicTerm, subjects = [], assessment, totalUnits, totalLecUnits, totalLabUnits, yearLevel } = enrollmentData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '780px',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Action Header (Hidden when printing) */}
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
            <FileText size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Certificate of Registration & Assessment (COR)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm print-allow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Printer size={15} /> Print COR
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

        {/* Paper COR Document */}
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
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '0.5rem', letterSpacing: '0.05em', color: '#047857' }}>
              CERTIFICATE OF REGISTRATION & ASSESSMENT (COR)
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>
              {academicTerm?.name || 'Academic Term 2024-2025'}
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              background: '#f8fafc',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>STUDENT NUMBER</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#047857' }}>{student?.studentNo}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>STUDENT NAME</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                {student?.lastName}, {student?.firstName} {student?.middleName || ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>DEGREE PROGRAM</div>
              <div style={{ fontWeight: 'bold' }}>{student?.program?.code} - Year {yearLevel || student?.yearLevel}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>ADMISSION STATUS</div>
              <div style={{ fontWeight: '600' }}>{student?.status || 'REGULAR'}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>CONTACT NO.</div>
              <div>{student?.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>ENROLLMENT STATUS</div>
              <div style={{ fontWeight: 'bold', color: enrollmentData.status === 'OFFICIALLY_ENROLLED' ? '#047857' : '#d97706' }}>
                {enrollmentData.status === 'OFFICIALLY_ENROLLED' ? 'OFFICIALLY ENROLLED' : 'ASSESSED (PENDING PAYMENT)'}
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '0.4rem', color: '#1e293b' }}>
              ENROLLED SUBJECTS & STUDY LOAD
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderTop: '1px solid #94a3b8', borderBottom: '1px solid #94a3b8' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>CODE</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>DESCRIPTIVE TITLE</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>LEC</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>LAB</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>UNITS</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>SEC</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>SCHEDULE / ROOM</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item: any, idx: number) => {
                  const sub = item.subject || item;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px', fontWeight: 'bold' }}>{sub.code}</td>
                      <td style={{ padding: '6px' }}>{sub.title}</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>{sub.lecUnits}</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>{sub.labUnits}</td>
                      <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{sub.totalUnits}</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>{item.section || 'A'}</td>
                      <td style={{ padding: '6px' }}>{item.schedule || 'TBA'} ({item.room || 'TBA'})</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 'bold', background: '#f8fafc' }}>
                  <td colSpan={2} style={{ padding: '6px', textAlign: 'right' }}>TOTAL CREDITED UNITS:</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{totalLecUnits || 0}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{totalLabUnits || 0}</td>
                  <td style={{ padding: '6px', textAlign: 'center', color: '#047857', fontSize: '12px' }}>
                    {totalUnits || 0}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Financial Assessment Summary */}
          {assessment && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Fee Breakdown */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  ASSESSMENT OF FEES
                </div>
                <table style={{ width: '100%', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Tuition Fee ({totalUnits} units):</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        ₱{Number(assessment.tuitionFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Miscellaneous Fees:</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        ₱{Number(assessment.miscTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {Number(assessment.labTotal) > 0 && (
                      <tr>
                        <td style={{ padding: '3px 0' }}>Laboratory Fee:</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          ₱{Number(assessment.labTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    {Number(assessment.otherTotal) > 0 && (
                      <tr>
                        <td style={{ padding: '3px 0' }}>Other / ID Fee:</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          ₱{Number(assessment.otherTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                      <td style={{ padding: '4px 0' }}>Gross Assessment:</td>
                      <td style={{ textAlign: 'right' }}>
                        ₱{Number(assessment.grossTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {Number(assessment.discountAmount) > 0 && (
                      <tr style={{ color: '#047857' }}>
                        <td style={{ padding: '3px 0' }}>Less Scholarship ({assessment.discountType || 'Grant'}):</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          -₱{Number(assessment.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 'bold', fontSize: '12px' }}>
                      <td style={{ padding: '4px 0' }}>NET ASSESSMENT:</td>
                      <td style={{ textAlign: 'right', color: '#047857' }}>
                        ₱{Number(assessment.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Installment & Account Status */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  PAYMENT & INSTALLMENT SCHEDULE
                </div>
                <table style={{ width: '100%', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Downpayment Required:</td>
                      <td style={{ textAlign: 'right' }}>
                        ₱{Number(assessment.downpaymentDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Prelim Installment:</td>
                      <td style={{ textAlign: 'right' }}>
                        ₱{Number(assessment.prelimDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Midterm Installment:</td>
                      <td style={{ textAlign: 'right' }}>
                        ₱{Number(assessment.midtermDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>Finals Installment:</td>
                      <td style={{ textAlign: 'right' }}>
                        ₱{Number(assessment.finalDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 0', color: '#047857', fontWeight: 'bold' }}>Total Paid:</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#047857' }}>
                        ₱{Number(assessment.totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 'bold', fontSize: '12px' }}>
                      <td style={{ padding: '4px 0', color: Number(assessment.balance) > 0 ? '#b91c1c' : '#047857' }}>
                        REMAINING BALANCE:
                      </td>
                      <td style={{ textAlign: 'right', color: Number(assessment.balance) > 0 ? '#b91c1c' : '#047857' }}>
                        ₱{Number(assessment.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Validation & Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #94a3b8' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                {student?.firstName} {student?.lastName}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Student Signature</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                Maria Elena Veloso
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>University Registrar</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                Roberto Fernandez, CPA
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Finance / Cashier Officer</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '9px', color: '#94a3b8', marginTop: '1.5rem' }}>
            Note: This Certificate of Registration serves as official proof of enrollment when signed by the Registrar. Alterations render this document void.
          </div>
        </div>
      </div>
    </div>
  );
}
