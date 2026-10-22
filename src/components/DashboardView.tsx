'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 4 Clean SaaS Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1: Total Enrolled */}
        <div className="saas-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Total Enrolled Students
          </div>
          <div
            className="font-mono-numbers"
            style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}
          >
            {stats?.totalEnrolled || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {stats?.totalStudents || 0} total registered student profiles
          </div>
        </div>

        {/* Metric 2: Today's Collections */}
        <div className="saas-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Today's Collections
          </div>
          <div
            className="font-mono-numbers"
            style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}
          >
            {currency}{Number(stats?.todayCollectionTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Processed through active cashier registers today
          </div>
        </div>

        {/* Metric 3: Total Semester Collections */}
        <div className="saas-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Total Semester Collections
          </div>
          <div
            className="font-mono-numbers"
            style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}
          >
            {currency}{Number(stats?.totalCollected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Out of {currency}{Number(stats?.totalAssessed || 0).toLocaleString()} net assessments
          </div>
        </div>

        {/* Metric 4: Outstanding Receivables */}
        <div className="saas-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Outstanding Balance
          </div>
          <div
            className="font-mono-numbers"
            style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}
          >
            {currency}{Number(stats?.totalReceivables || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-status badge-green" style={{ fontSize: '0.7rem' }}>
              {stats?.examClearedCount || 0} Cleared
            </span>
            <span className="badge-status badge-red" style={{ fontSize: '0.7rem' }}>
              {stats?.examHoldCount || 0} On Hold
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div
        className="saas-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Quick Actions
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Navigate directly to student admissions or the payment collection register.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onNavigate('registrar')} className="btn-saas btn-saas-primary">
            Registrar Workspace
          </button>
          <button onClick={() => onNavigate('cashier')} className="btn-saas">
            Cashier Register
          </button>
        </div>
      </div>

      {/* Two Clean Data Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem' }}>
        {/* Left Table: Recent Collections */}
        <div className="saas-card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent Collections</div>
              <div className="card-description">Latest official payment receipts recorded</div>
            </div>
            <button
              onClick={() => onNavigate('cashier')}
              className="btn-saas btn-saas-sm"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Student Name</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => {
                    const st = p.assessment?.enrollment?.student;
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {p.orNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                            {st ? `${st.firstName} ${st.lastName}` : p.paidBy}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            ₱{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
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
                            className="btn-saas btn-saas-sm"
                          >
                            Receipt
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

        {/* Right Table: Recent Enrollments */}
        <div className="saas-card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent Enrollments</div>
              <div className="card-description">Latest student study load commitments</div>
            </div>
            <button
              onClick={() => onNavigate('registrar')}
              className="btn-saas btn-saas-sm"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View directory <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Student No.</th>
                  <th>Student Name</th>
                  <th>Load</th>
                  <th>Assessment</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No enrollments recorded for this term yet.
                    </td>
                  </tr>
                ) : (
                  recentEnrollments.map((enr) => (
                    <tr key={enr.id}>
                      <td>
                        <span className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          {enr.student?.studentNo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                          {enr.student?.firstName} {enr.student?.lastName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {enr.student?.program?.code} · Year {enr.yearLevel}
                        </div>
                      </td>
                      <td>
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {enr.totalUnits} units
                        </span>
                      </td>
                      <td>
                        <span className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                          ₱{Number(enr.assessment?.netTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenCor(enr)}
                          className="btn-saas btn-saas-sm"
                        >
                          View COR
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
