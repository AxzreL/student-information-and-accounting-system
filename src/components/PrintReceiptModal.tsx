'use client';

import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: any;
  institutionName: string;
  institutionAddress: string;
}

export default function PrintReceiptModal({
  isOpen,
  onClose,
  paymentData,
  institutionName,
  institutionAddress,
}: PrintReceiptModalProps) {
  if (!isOpen || !paymentData) return null;

  const { payment, assessment, student } = paymentData;
  const orNumber = payment.orNumber;
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '620px',
          background: '#ffffff',
          color: '#1e293b',
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
            <Printer size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Official Cashier Receipt Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm print-allow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Printer size={15} /> Print Receipt
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

        {/* Paper Official Receipt Body */}
        <div
          className="printable-document"
          style={{
            padding: '2.25rem',
            fontFamily: "'Courier New', Courier, monospace",
            lineHeight: 1.4,
            fontSize: '13px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #94a3b8', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Republic of the Philippines
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>
              {institutionName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{institutionAddress}</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '0.5rem', color: '#047857' }}>
              OFFICIAL RECEIPT
            </div>
          </div>

          {/* Metadata Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '12px' }}>
            <div>
              <strong>OR NUMBER:</strong> <span style={{ color: '#047857', fontWeight: 'bold' }}>{orNumber}</span>
            </div>
            <div>
              <strong>DATE:</strong> {paymentDate}
            </div>
          </div>

          {/* Student Info Box */}
          <div
            style={{
              border: '1px solid #cbd5e1',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Student No: </span>
                <strong>{student?.studentNo || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Program: </span>
                <strong>{student?.program?.code || 'N/A'}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b' }}>Received From: </span>
                <strong style={{ fontSize: '13px' }}>
                  {payment.paidBy || `${student?.firstName} ${student?.lastName}`}
                </strong>
              </div>
            </div>
          </div>

          {/* Payment Details Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #0f172a', borderTop: '1px solid #0f172a' }}>
                <th style={{ textAlign: 'left', padding: '6px 0' }}>DESCRIPTION</th>
                <th style={{ textAlign: 'right', padding: '6px 0' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  Tuition & Academic Fees Payment
                  {payment.remarks && (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Remarks: {payment.remarks}</div>
                  )}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 'bold', fontSize: '13px' }}>
                  ₱{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ borderTop: '1px dashed #cbd5e1' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Payment Method:</td>
                <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: '600' }}>
                  {payment.paymentMethod} {payment.referenceNo ? `(${payment.referenceNo})` : ''}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Remaining Balance:</td>
                <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold', color: assessment?.balance > 0 ? '#b91c1c' : '#047857' }}>
                  ₱{Number(assessment?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '14px' }}>TOTAL PAID</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '15px', color: '#047857' }}>
                  ₱{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </th>
              </tr>
            </tfoot>
          </table>

          {/* Exam Clearance Notice */}
          <div
            style={{
              padding: '0.6rem',
              borderRadius: '4px',
              border: assessment?.examPermitStatus === 'CLEARED' ? '1px solid #a7f3d0' : '1px solid #fed7aa',
              background: assessment?.examPermitStatus === 'CLEARED' ? '#ecfdf5' : '#fffbeb',
              marginBottom: '1.75rem',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: assessment?.examPermitStatus === 'CLEARED' ? '#065f46' : '#9a3412',
            }}
          >
            {assessment?.examPermitStatus === 'CLEARED'
              ? '✓ CLEARED FOR MAJOR EXAMINATIONS'
              : '⚠ PENDING MINIMUM BALANCE SETTLEMENT FOR EXAM PERMIT'}
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dotted #94a3b8' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px' }}>
                Student / Payor Signature
              </div>
            </div>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                {payment.cashierName || 'Cashier In-Charge'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Authorized Cashier</div>
            </div>
          </div>

          {/* Footer Notice */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '1.5rem' }}>
            System Generated via SIAS Higher Education Portal • Please retain this official receipt for clearance.
          </div>
        </div>
      </div>
    </div>
  );
}
