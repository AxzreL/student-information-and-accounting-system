'use client';

import React, { useState, useEffect } from 'react';

interface AdminViewProps {
  currentTerm: any;
  feeTemplates: any[];
  institutionName: string;
}

export default function AdminView({
  currentTerm,
  feeTemplates,
  institutionName,
}: AdminViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Station Header */}
      <div
        className="instrument-panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-sunken)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[STATION_04]</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>
              SYSTEM_ADMINISTRATION // MASTER_REGISTRY_AUDIT
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            FEE MATRIX TEMPLATES, CALENDAR TERM SYNC, AND IMMUTABLE COMPLIANCE AUDIT TRAILS.
          </div>
        </div>

        <span className="tag-mono tag-green">[SYS_CORE: MYSQL_8.4_ACTIVE]</span>
      </div>

      {/* Two Grid Cards: Academic Term & Standard Fee Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
        {/* Academic Calendar Term */}
        <div className="instrument-panel">
          <div className="instrument-header-bar">
            <span>CALENDAR_SYNC // ACTIVE_TERM_MATRIX</span>
            <span style={{ color: 'var(--signal-green)' }}>[LOCKED]</span>
          </div>

          <div style={{ padding: '1rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--bg-surface-sunken)', border: '1px solid var(--border-hairline)' }}>
              <span className="tag-mono tag-green" style={{ fontSize: '0.62rem' }}>
                CURRENT_OPERATIONAL_TERM
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {currentTerm?.name || 'AY 2024-2025 FIRST SEMESTER'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                CODE: {currentTerm?.code} // SY: {currentTerm?.schoolYear} // SEM: {currentTerm?.semester}
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              NOTICE: ALL STUDENT ADMISSIONS, SUBJECT LOAD ALLOCATIONS, AND FINANCIAL ASSESSMENTS COMMIT TO THIS CURRENT ACTIVE TERM.
            </div>
          </div>
        </div>

        {/* Standard Fee Schedules */}
        <div className="instrument-panel">
          <div className="instrument-header-bar">
            <span>FEE_MATRIX // STANDARD_TARIFF_TEMPLATES</span>
            <span>COUNT: {feeTemplates.length}</span>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <table className="hairline-grid-table">
              <thead>
                <tr>
                  <th>FEE_CATEGORY</th>
                  <th>DESCRIPTIVE_TITLE</th>
                  <th style={{ textAlign: 'right' }}>BASE_TARIFF</th>
                </tr>
              </thead>
              <tbody>
                {feeTemplates.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className="tag-mono" style={{ fontSize: '0.62rem' }}>
                        [{f.category}]
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.78rem' }}>{f.name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      ₱{Number(f.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {f.isPerUnit ? ' / UNIT' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="instrument-panel">
        <div className="instrument-header-bar">
          <span>SECURITY_AUDIT_TRAIL // IMMUTABLE_EVENT_LOG</span>
          <button onClick={fetchLogs} className="btn-mechanical btn-sm" disabled={loadingLogs} style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
            {loadingLogs ? '[REFRESHING...]' : '[POLL_LATEST_LOGS]'}
          </button>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
          <table className="hairline-grid-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OPERATOR_IDENTITY</th>
                <th>ROLE_AUTH</th>
                <th>ACTION_CODE</th>
                <th>TELEMETRY_PAYLOAD</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    [ZERO_AUDIT_EVENTS_RETURNED]
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.78rem' }}>{log.userName}</td>
                    <td>
                      <span
                        className={`tag-mono ${
                          log.role === 'ADMIN'
                            ? 'tag-amber'
                            : log.role === 'CASHIER'
                            ? 'tag-green'
                            : 'tag-cyan'
                        }`}
                        style={{ fontSize: '0.62rem' }}
                      >
                        [{log.role}]
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--signal-amber)' }}>
                      {log.action}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
