'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div
        className="saas-card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            System Administration & Settings
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Fee schedule templates, academic term calendars, and security activity audit logs.
          </div>
        </div>

        <span className="badge-status badge-neutral">
          <span className="badge-dot badge-dot-green" />
          System Operational · MySQL 8.4
        </span>
      </div>

      {/* Two Grid Cards: Academic Term & Standard Fee Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }}>
        {/* Academic Calendar Term */}
        <div className="saas-card">
          <div className="card-header">
            <div>
              <div className="card-title">Active Academic Term</div>
              <div className="card-description">Currently active semester for enrollments and billing</div>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                Current Semester
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {currentTerm?.name || 'AY 2024-2025 First Semester'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                School Year: {currentTerm?.schoolYear} · Semester: {currentTerm?.semester}
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              All new admissions, enrolled study loads, and financial assessments automatically commit to this academic term.
            </div>
          </div>
        </div>

        {/* Standard Fee Schedules */}
        <div className="saas-card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Standard Tuition & Fee Schedules</div>
              <div className="card-description">Default fees applied during subject enrollment</div>
            </div>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Fee Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {feeTemplates.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {f.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{f.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-mono-numbers" style={{ fontWeight: 600 }}>
                        ₱{Number(f.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {f.isPerUnit ? ' / unit' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Activity & Security Audit Log</div>
            <div className="card-description">Chronological trail of user actions across registrar and cashier operations</div>
          </div>
          <button onClick={fetchLogs} className="btn-saas btn-saas-sm" disabled={loadingLogs}>
            <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
            {loadingLogs ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>

        <div className="saas-table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <table className="saas-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No audit log events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.userName}</td>
                    <td>
                      <span
                        className="badge-status badge-neutral"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {log.role === 'ADMIN' ? 'Admin' : log.role === 'CASHIER' ? 'Cashier' : 'Registrar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {log.action}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
