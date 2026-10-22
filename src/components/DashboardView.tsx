'use client';

import React from 'react';

interface DashboardViewProps {
  stats: any;
  recentPayments: any[];
  recentEnrollments: any[];
  onNavigate: (tab: string) => void;
  onOpenReceipt: (paymentData: any) => void;
  onOpenCor: (enrollmentData: any) => void;
}

export default function DashboardView({
  stats,
  recentPayments = [],
  recentEnrollments = [],
  onNavigate,
  onOpenReceipt,
  onOpenCor,
}: DashboardViewProps) {
  const currency = '₱';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Precision Instrument Readouts (4 Metres) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1px',
          background: 'var(--border-hairline)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        {/* Metre 1: Enrolled Headcount */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem' }}>
          <div className="instrument-header-bar" style={{ margin: '-1rem -1.25rem 0.85rem', padding: '0.45rem 1rem' }}>
            <span>METRIC:01 // ENROLLMENT_LOAD</span>
            <span style={{ color: 'var(--signal-green)' }}>[ONLINE]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="telemetry-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.totalEnrolled || 0}
            </div>
            <span className="tag-mono tag-cyan">HEADCOUNT</span>
          </div>
          <div style={{ marginTop: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            REGISTERED_PROFILES: {stats?.totalStudents || 0} // ALLOCATION: 100%
          </div>
        </div>

        {/* Metre 2: Daily Collections */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem' }}>
          <div className="instrument-header-bar" style={{ margin: '-1rem -1.25rem 0.85rem', padding: '0.45rem 1rem' }}>
            <span>METRIC:02 // DIURNAL_COLLECTIONS</span>
            <span style={{ color: 'var(--signal-amber)' }}>[VERIFIED]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="telemetry-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--signal-amber)' }}>
              {currency}{Number(stats?.todayCollectionTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="tag-mono tag-amber">CASHIER_04</span>
          </div>
          <div style={{ marginTop: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            CYCLE: CURRENT_DAY_REGISTER // VERIFIED_OR_ONLY
          </div>
        </div>

        {/* Metre 3: Semester Total Collection */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem' }}>
          <div className="instrument-header-bar" style={{ margin: '-1rem -1.25rem 0.85rem', padding: '0.45rem 1rem' }}>
            <span>METRIC:03 // CUMULATIVE_REVENUE</span>
            <span style={{ color: 'var(--text-secondary)' }}>[POSTED]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="telemetry-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currency}{Number(stats?.totalCollected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="tag-mono">[NET_TOTAL]</span>
          </div>
          <div style={{ marginTop: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            TOTAL_ASSESSED: {currency}{Number(stats?.totalAssessed || 0).toLocaleString()}
          </div>
        </div>

        {/* Metre 4: Receivables & Clearance */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem' }}>
          <div className="instrument-header-bar" style={{ margin: '-1rem -1.25rem 0.85rem', padding: '0.45rem 1rem' }}>
            <span>METRIC:04 // RECEIVABLES_LEDGER</span>
            <span style={{ color: 'var(--signal-red)' }}>[PENDING]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="telemetry-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--signal-red)' }}>
              {currency}{Number(stats?.totalReceivables || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="tag-mono tag-red">UNSETTLED</span>
          </div>
          <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="tag-mono tag-green" style={{ fontSize: '0.65rem' }}>
              CLEARED: {stats?.examClearedCount || 0}
            </span>
            <span className="tag-mono tag-red" style={{ fontSize: '0.65rem' }}>
              HOLD: {stats?.examHoldCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Structured Tactical Command Strip */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="tag-mono tag-amber">[CONSOLE_CMD]</span>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700 }}>
              TERMINAL INTERFACE DIRECT ACCESS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              EXECUTE ADMISSION REGISTRATION // CASHIER PAYMENT CLEARANCE
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onNavigate('registrar')} className="btn-mechanical btn-signal-amber btn-sm">
            [CMD: ADMISSIONS_DESK] <span className="hotkey-tag">R</span>
          </button>
          <button onClick={() => onNavigate('cashier')} className="btn-mechanical btn-sm">
            [CMD: CASHIER_REGISTER] <span className="hotkey-tag">C</span>
          </button>
        </div>
      </div>

      {/* Dual Telemetry Log Feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Financial Ledger Stream */}
        <div className="instrument-panel">
          <div className="instrument-header-bar">
            <span>REGISTER_FEED // CASHIER_COLLECTIONS_LOG</span>
            <button
              onClick={() => onNavigate('cashier')}
              style={{ background: 'transparent', border: 'none', color: 'var(--signal-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', cursor: 'pointer' }}
            >
              [FULL_LOG ➔]
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="hairline-grid-table">
              <thead>
                <tr>
                  <th>REF_OR</th>
                  <th>PAYOR_IDENTITY</th>
                  <th>METHOD</th>
                  <th style={{ textAlign: 'right' }}>VAL_POSTED</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      [NO_TRANSACTIONS_LOGGED_IN_SESSION]
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => {
                    const st = p.assessment?.enrollment?.student;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--signal-amber)' }}>
                          {p.orNumber}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                            {st ? `${st.lastName}, ${st.firstName}` : p.paidBy}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className="tag-mono" style={{ fontSize: '0.62rem' }}>
                            [{p.paymentMethod}]
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          ₱{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() =>
                              onOpenReceipt({
                                payment: p,
                                assessment: p.assessment,
                                student: st,
                              })
                            }
                            className="btn-mechanical btn-sm"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.65rem' }}
                          >
                            [OR]
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Academic Enrollment Stream */}
        <div className="instrument-panel">
          <div className="instrument-header-bar">
            <span>REGISTRAR_FEED // ENROLLMENT_COMMITS</span>
            <button
              onClick={() => onNavigate('registrar')}
              style={{ background: 'transparent', border: 'none', color: 'var(--signal-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', cursor: 'pointer' }}
            >
              [FULL_REGISTRY ➔]
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="hairline-grid-table">
              <thead>
                <tr>
                  <th>STUDENT_ID</th>
                  <th>CANDIDATE_NAME</th>
                  <th>LOAD</th>
                  <th>ASSESSMENT</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      [NO_ENROLLMENT_RECORDS_REGISTERED]
                    </td>
                  </tr>
                ) : (
                  recentEnrollments.map((enr) => (
                    <tr key={enr.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {enr.student?.studentNo}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                          {enr.student?.lastName}, {enr.student?.firstName}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                          {enr.student?.program?.code} // YR_{enr.yearLevel}
                        </div>
                      </td>
                      <td>
                        <span className="tag-mono" style={{ fontSize: '0.62rem' }}>
                          {enr.totalUnits}_UNITS
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem' }}>
                        ₱{Number(enr.assessment?.netTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenCor(enr)}
                          className="btn-mechanical btn-sm"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.65rem' }}
                        >
                          [COR]
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
