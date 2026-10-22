'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Layers,
  History,
  CheckCircle,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: 'var(--accent-purple)' }} />
            System Administration & Masterlist
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Fee schedule templates, academic calendar terms, and security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success">System Status: Active (MySQL 8.4)</span>
        </div>
      </div>

      {/* Two Grid Cards: Academic Term & Standard Fee Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Academic Calendar Term */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Active Academic Term</h4>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  Current Active Term
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  {currentTerm?.name || 'AY 2024-2025 First Semester'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  School Year: {currentTerm?.schoolYear} • Semester: {currentTerm?.semester}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            All new student enrollments, assessments, and grade evaluations are automatically bound to this active semester.
          </div>
        </div>

        {/* Standard Fee Schedules */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <DollarSign size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Standard Tuition & Miscellaneous Fee Masterlist</h4>
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>FEE CATEGORY</th>
                  <th>DESCRIPTION</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {feeTemplates.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                        {f.category}
                      </span>
                    </td>
                    <td>{f.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-numbers">
                      ₱{Number(f.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {f.isPerUnit ? ' / Unit' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} style={{ color: 'var(--accent-purple)' }} />
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Security & Transaction Audit Trail</h4>
          </div>
          <button onClick={fetchLogs} className="btn btn-secondary btn-sm" disabled={loadingLogs}>
            {loadingLogs ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OFFICER / USER</th>
                <th>ROLE</th>
                <th>ACTION</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.userName}</td>
                    <td>
                      <span
                        className={`badge ${
                          log.role === 'ADMIN'
                            ? 'badge-info'
                            : log.role === 'CASHIER'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.8rem' }}>{log.action}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{log.details}</td>
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
