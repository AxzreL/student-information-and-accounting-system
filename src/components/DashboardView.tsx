'use client';

import React from 'react';
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Enrolled */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Total Enrolled Students
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }} className="tabular-numbers">
                {stats?.totalEnrolled || 0}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Active Term</span> • {stats?.totalStudents || 0} Registered Profiles
          </div>
        </div>

        {/* Card 2: Today's Collection */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Today's Collections
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-emerald)' }} className="tabular-numbers">
                {currency}{Number(stats?.todayCollectionTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Cashier Window</span> • Verified via OR Register
          </div>
        </div>

        {/* Card 3: Total Collections */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Total Semester Collections
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-cyan)' }} className="tabular-numbers">
                {currency}{Number(stats?.totalCollected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Net Assessed: {currency}{Number(stats?.totalAssessed || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Accounts Receivable & Exam Clearance */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Accounts Receivable (Pending)
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#fb7185' }} className="tabular-numbers">
                {currency}{Number(stats?.totalReceivables || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
              {stats?.examClearedCount || 0} Cleared for Exams
            </span>
            <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
              {stats?.examHoldCount || 0} On Hold
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Enrollment & Accounting Quick Actions</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Direct access to student admission, subject schedule enrollment, and cashier payment processing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('registrar')} className="btn btn-primary btn-sm">
            <UserCheck size={16} /> Open Registrar Portal
          </button>
          <button onClick={() => onNavigate('cashier')} className="btn btn-secondary btn-sm">
            <CreditCard size={16} /> Open Cashier Counter
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Collections & Recent Enrollments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Recent Cashier Collections */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} style={{ color: 'var(--accent-emerald)' }} />
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Recent Cashier Collections</h4>
            </div>
            <button
              onClick={() => onNavigate('cashier')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-emerald)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentPayments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No recent payment transactions recorded yet.
              </div>
            ) : (
              recentPayments.map((p) => {
                const st = p.assessment?.enrollment?.student;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                          {p.orNumber}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>
                        {st ? `${st.firstName} ${st.lastName}` : p.paidBy}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {new Date(p.paymentDate).toLocaleDateString()} • Cashier: {p.cashierName}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }} className="tabular-numbers">
                        ₱{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        onClick={() =>
                          onOpenReceipt({
                            payment: p,
                            assessment: p.assessment,
                            student: st,
                          })
                        }
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        Print OR
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Student Enrollments */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Recent Student Enrollments</h4>
            </div>
            <button
              onClick={() => onNavigate('registrar')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View Directory <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentEnrollments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No student enrollments for this term yet.
              </div>
            ) : (
              recentEnrollments.map((enr) => (
                <div
                  key={enr.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {enr.student?.studentNo}
                      </span>
                      <span
                        className={`badge ${
                          enr.status === 'OFFICIALLY_ENROLLED' ? 'badge-success' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {enr.status === 'OFFICIALLY_ENROLLED' ? 'Enrolled' : 'Assessed'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {enr.student?.firstName} {enr.student?.lastName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {enr.student?.program?.code} - Year {enr.yearLevel} • {enr.totalUnits} Units
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }} className="tabular-numbers">
                      ₱{Number(enr.assessment?.netTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => onOpenCor(enr)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      Print COR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
