'use client';

import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  Receipt,
  Printer,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface CashierViewProps {
  assessments: any[];
  onOpenPayment: (assessment: any) => void;
  onOpenSoa: (assessment: any) => void;
  onOpenReceipt: (paymentData: any) => void;
}

export default function CashierView({
  assessments,
  onOpenPayment,
  onOpenSoa,
  onOpenReceipt,
}: CashierViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [permitFilter, setPermitFilter] = useState('ALL');

  const filtered = assessments.filter((a) => {
    const st = a.enrollment?.student;
    const matchesSearch =
      search === '' ||
      st?.studentNo?.toLowerCase().includes(search.toLowerCase()) ||
      st?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      st?.lastName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesPermit = permitFilter === 'ALL' || a.examPermitStatus === permitFilter;

    return matchesSearch && matchesStatus && matchesPermit;
  });

  // Calculate totals
  const totalAssessed = filtered.reduce((sum, a) => sum + Number(a.netTotal), 0);
  const totalPaid = filtered.reduce((sum, a) => sum + Number(a.totalPaid), 0);
  const totalBalance = filtered.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={22} style={{ color: 'var(--accent-cyan)' }} />
            Cashier & Student Accounts Ledger
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Accept tuition payments, issue official receipts, monitor student balances, and manage exam permit clearances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-dim)' }}>Total Net Assessed: </span>
            <strong className="tabular-numbers">₱{totalAssessed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.8rem',
              color: 'var(--accent-emerald)',
            }}
          >
            <span>Total Collected: </span>
            <strong className="tabular-numbers">₱{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(244, 63, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              fontSize: '0.8rem',
              color: '#fb7185',
            }}
          >
            <span>Pending Receivables: </span>
            <strong className="tabular-numbers">₱{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search student number or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Payment Status Filter */}
        <div style={{ width: '180px' }}>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        {/* Exam Permit Filter */}
        <div style={{ width: '180px' }}>
          <select
            className="input-field"
            value={permitFilter}
            onChange={(e) => setPermitFilter(e.target.value)}
          >
            <option value="ALL">All Exam Permits</option>
            <option value="CLEARED">Cleared for Exams</option>
            <option value="HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Assessment Accounts Table */}
      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT NO. & NAME</th>
              <th>PROGRAM & UNITS</th>
              <th>NET ASSESSMENT</th>
              <th>TOTAL PAID</th>
              <th>OUTSTANDING BALANCE</th>
              <th>PAYMENT STATUS</th>
              <th>EXAM PERMIT</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No student assessment accounts found.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const student = a.enrollment?.student;
                const balance = Number(a.balance);
                const net = Number(a.netTotal);
                const paid = Number(a.totalPaid);
                const percentPaid = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 100;
                const isCleared = a.examPermitStatus === 'CLEARED';
                const latestPayment = a.payments?.[0];

                return (
                  <tr key={a.id}>
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent-cyan)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {student?.studentNo}
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {student?.lastName}, {student?.firstName}
                      </div>
                    </td>
                    <td>
                      <div>{student?.program?.code}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {a.enrollment?.totalUnits || 0} Units Assessed
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }} className="tabular-numbers">
                        ₱{net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {Number(a.discountAmount) > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>
                          Grant: -₱{Number(a.discountAmount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }} className="tabular-numbers">
                        ₱{paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '2px',
                          marginTop: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentPaid}%`,
                            height: '100%',
                            background: 'var(--accent-emerald)',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 800,
                          color: balance > 0 ? '#fb7185' : 'var(--accent-emerald)',
                        }}
                        className="tabular-numbers"
                      >
                        ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {balance > 0 && Number(a.downpaymentDue) > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          Downpayment: ₱{Number(a.downpaymentDue).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          a.status === 'PAID'
                            ? 'badge-success'
                            : a.status === 'PARTIAL'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${isCleared ? 'badge-success' : 'badge-danger'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {isCleared ? '✓ CLEARED' : '⚠ ON HOLD'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {balance > 0 && (
                          <button
                            onClick={() => onOpenPayment(a)}
                            className="btn btn-primary btn-sm"
                            title="Accept payment from student"
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                        )}

                        <button
                          onClick={() => onOpenSoa(a)}
                          className="btn btn-secondary btn-sm"
                          title="Print official Statement of Account & Ledger"
                        >
                          <Receipt size={14} /> SOA
                        </button>

                        {latestPayment && (
                          <button
                            onClick={() =>
                              onOpenReceipt({
                                payment: latestPayment,
                                assessment: a,
                                student,
                              })
                            }
                            className="btn btn-secondary btn-sm"
                            title="View / Print latest Official Receipt"
                          >
                            <Printer size={14} /> OR
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
