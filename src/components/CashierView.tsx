'use client';

import React, { useState } from 'react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Station Header & Telemetry Indicators */}
      <div
        className="instrument-panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--bg-surface-sunken)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[STATION_03]</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>
              CASHIER_TERMINAL // STUDENT_FINANCIAL_LEDGER
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            TRANSACTION ASSESSMENT ENGINE // DISPATCH OFFICIAL RECEIPTS AND EXAM PERMIT CLEARANCES.
          </div>
        </div>

        {/* Telemetry Metric Readouts */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="tag-mono" style={{ padding: '0.4rem 0.75rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>NET_ASSESSED: </span>
            <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>
              ₱{totalAssessed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="tag-mono tag-green" style={{ padding: '0.4rem 0.75rem' }}>
            <span>TOTAL_COLLECTED: </span>
            <strong style={{ marginLeft: '4px' }}>
              ₱{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="tag-mono tag-red" style={{ padding: '0.4rem 0.75rem' }}>
            <span>RECEIVABLES: </span>
            <strong style={{ marginLeft: '4px' }}>
              ₱{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      {/* Query Filter Strip */}
      <div
        className="instrument-panel"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="input-instrument"
            placeholder="FILTER: ENTER CANDIDATE ID OR SURNAME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Payment Status Filter */}
        <div style={{ width: '200px' }}>
          <select
            className="input-instrument"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">[ALL_PAYMENT_STATUSES]</option>
            <option value="PAID">PAID_FULL (SETTLED)</option>
            <option value="PARTIAL">PARTIAL_COMMITTED</option>
            <option value="UNPAID">UNPAID_ZERO_CREDIT</option>
          </select>
        </div>

        {/* Exam Permit Filter */}
        <div style={{ width: '190px' }}>
          <select
            className="input-instrument"
            value={permitFilter}
            onChange={(e) => setPermitFilter(e.target.value)}
          >
            <option value="ALL">[ALL_EXAM_PERMITS]</option>
            <option value="CLEARED">PERMIT: CLEARED</option>
            <option value="HOLD">PERMIT: HOLD</option>
          </select>
        </div>

        <div className="tag-mono" style={{ padding: '0.55rem 0.75rem' }}>
          COUNT: {filtered.length}/{assessments.length}
        </div>
      </div>

      {/* Hairline Financial Ledger Table */}
      <div className="instrument-panel" style={{ overflowX: 'auto' }}>
        <table className="hairline-grid-table">
          <thead>
            <tr>
              <th>STUDENT_ID & NAME</th>
              <th>CURRICULUM_LOAD</th>
              <th>NET_ASSESSMENT</th>
              <th>POSTED_CREDITS</th>
              <th>BALANCE_DUE</th>
              <th>SETTLEMENT_STATE</th>
              <th>EXAM_PERMIT</th>
              <th style={{ textAlign: 'right' }}>OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  [ZERO_ASSESSMENT_RECORDS_LOCATED]
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
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--signal-amber)' }}>
                        {student?.studentNo}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                        {student?.lastName}, {student?.firstName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{student?.program?.code}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        LOAD: {a.enrollment?.totalUnits || 0}_UNITS
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
                        ₱{net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {Number(a.discountAmount) > 0 && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--signal-green)' }}>
                          GRANT: -₱{Number(a.discountAmount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--signal-green)', fontSize: '0.82rem' }}>
                        ₱{paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        POSTED_TX: {a.payments?.length || 0}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: balance > 0 ? 'var(--signal-red)' : 'var(--signal-green)',
                        }}
                      >
                        ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {balance > 0 && Number(a.downpaymentDue) > 0 && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                          MIN_DOWN: ₱{Number(a.downpaymentDue).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`tag-mono ${
                          a.status === 'PAID'
                            ? 'tag-green'
                            : a.status === 'PARTIAL'
                            ? 'tag-amber'
                            : 'tag-red'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        [{a.status}]
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tag-mono ${isCleared ? 'tag-green' : 'tag-red'}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {isCleared ? '[CLEARED]' : '[HOLD]'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {balance > 0 && (
                          <button
                            onClick={() => onOpenPayment(a)}
                            className="btn-mechanical btn-signal-amber btn-sm"
                            title="Execute cash or electronic payment"
                          >
                            [EXEC_PAY]
                          </button>
                        )}

                        <button
                          onClick={() => onOpenSoa(a)}
                          className="btn-mechanical btn-sm"
                          title="Generate official Statement of Account"
                        >
                          [SOA]
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
                            className="btn-mechanical btn-sm"
                            title="Inspect official receipt"
                          >
                            [OR]
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
