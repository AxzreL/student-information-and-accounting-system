'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

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

  const totalAssessed = filtered.reduce((sum, a) => sum + Number(a.netTotal), 0);
  const totalPaid = filtered.reduce((sum, a) => sum + Number(a.totalPaid), 0);
  const totalBalance = filtered.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Summary Chips */}
      <div
        className="saas-card"
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
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Cashier & Student Accounts
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Collect fee payments, issue official receipts, monitor balances, and update exam clearances.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="badge-status badge-neutral" style={{ padding: '0.35rem 0.65rem' }}>
            <span>Net Assessed: </span>
            <strong className="font-mono-numbers" style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>
              ₱{totalAssessed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="badge-status badge-neutral" style={{ padding: '0.35rem 0.65rem' }}>
            <span className="badge-dot badge-dot-green" />
            <span>Total Collected: </span>
            <strong className="font-mono-numbers" style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>
              ₱{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="badge-status badge-neutral" style={{ padding: '0.35rem 0.65rem' }}>
            <span className="badge-dot badge-dot-red" />
            <span>Outstanding Balance: </span>
            <strong className="font-mono-numbers" style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>
              ₱{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="saas-card"
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="saas-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by student number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '190px' }}>
          <select
            className="saas-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <select
            className="saas-input"
            value={permitFilter}
            onChange={(e) => setPermitFilter(e.target.value)}
          >
            <option value="ALL">All Exam Permits</option>
            <option value="CLEARED">Cleared for Exams</option>
            <option value="HOLD">On Hold</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
          Showing {filtered.length} of {assessments.length} accounts
        </div>
      </div>

      {/* Clean Financial Accounts Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Student ID & Name</th>
                <th>Program</th>
                <th>Net Assessment</th>
                <th>Total Paid</th>
                <th>Remaining Balance</th>
                <th>Payment Status</th>
                <th>Exam Permit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No student assessment accounts match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const student = a.enrollment?.student;
                  const balance = Number(a.balance);
                  const net = Number(a.netTotal);
                  const paid = Number(a.totalPaid);
                  const isCleared = a.examPermitStatus === 'CLEARED';
                  const latestPayment = a.payments?.[0];

                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="font-mono-numbers" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {student?.studentNo}
                        </div>
                        <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                          {student?.lastName}, {student?.firstName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{student?.program?.code}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {a.enrollment?.totalUnits || 0} units
                        </div>
                      </td>
                      <td>
                        <div className="font-mono-numbers" style={{ fontWeight: 600 }}>
                          ₱{net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {Number(a.discountAmount) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>
                            Grant: -₱{Number(a.discountAmount).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="font-mono-numbers" style={{ fontWeight: 600, color: '#10b981' }}>
                          ₱{paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {a.payments?.length || 0} payments posted
                        </div>
                      </td>
                      <td>
                        <div
                          className="font-mono-numbers"
                          style={{
                            fontWeight: 600,
                            color: balance > 0 ? '#f43f5e' : '#10b981',
                          }}
                        >
                          ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {balance > 0 && Number(a.downpaymentDue) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Min down: ₱{Number(a.downpaymentDue).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge-status ${
                            a.status === 'PAID'
                              ? 'badge-green'
                              : a.status === 'PARTIAL'
                              ? 'badge-amber'
                              : 'badge-red'
                          }`}
                        >
                          {a.status === 'PAID'
                            ? 'Fully Paid'
                            : a.status === 'PARTIAL'
                            ? 'Partial'
                            : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-status ${isCleared ? 'badge-green' : 'badge-red'}`}
                        >
                          {isCleared ? 'Cleared' : 'On Hold'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {balance > 0 && (
                            <button
                              onClick={() => onOpenPayment(a)}
                              className="btn-saas btn-saas-primary btn-saas-sm"
                            >
                              Pay
                            </button>
                          )}

                          <button
                            onClick={() => onOpenSoa(a)}
                            className="btn-saas btn-saas-sm"
                          >
                            Statement
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
                              className="btn-saas btn-saas-sm"
                            >
                              Receipt
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
    </div>
  );
}
