'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  X,
  Search,
  Filter,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  GraduationCap,
} from 'lucide-react';

interface AcademicClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
}

export default function AcademicClearanceModal({
  isOpen,
  onClose,
  institutionName,
}: AcademicClearanceModalProps) {
  const [reportData, setReportData] = useState<any[]>([]);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/reports/academic-clearance');
        const data = await res.json();
        if (data.success) {
          setReportData(data.report || []);
          setCurrentTerm(data.currentTerm);
        }
      } catch (err) {
        console.error('Error fetching clearance report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = reportData.filter((row) => {
    const matchesSearch =
      row.studentNo.toLowerCase().includes(search.toLowerCase()) ||
      row.fullName.toLowerCase().includes(search.toLowerCase()) ||
      row.programCode.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'CLEARED') return row.isOverallCleared;
    if (statusFilter === 'HOLD_FINANCIAL') return !row.isFinanciallyCleared && row.isAcademicallyCleared;
    if (statusFilter === 'HOLD_ACADEMIC') return !row.isAcademicallyCleared;
    if (statusFilter === 'PROBATION') return row.academicStanding === 'ACADEMIC_PROBATION';

    return true;
  });

  const clearedCount = reportData.filter((r) => r.isOverallCleared).length;
  const financialHoldCount = reportData.filter((r) => !r.isFinanciallyCleared).length;
  const academicHoldCount = reportData.filter((r) => !r.isAcademicallyCleared).length;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '1100px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileCheck size={20} />
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                SIAS Academic & Financial Clearance Verification Report
              </span>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                Cross-System SGP Integration
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Pulls SGP grade status (passed, failed, incomplete) & SIAS accounting balance to authorize graduation and re-enrollment.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => window.print()} className="btn-saas" style={{ fontSize: '0.8rem' }}>
              <Printer size={14} />
              Print
            </button>
            <button onClick={onClose} className="btn-saas" style={{ padding: '0.35rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ fontSize: '0.82rem' }}>
            Term: <strong>{currentTerm?.name || 'Current Term'}</strong>
          </div>
          <div style={{ fontSize: '0.82rem' }}>
            Total Assessed: <strong>{reportData.length} Students</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-green" />
              Fully Cleared: {clearedCount}
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-red" />
              Financial Holds: {financialHoldCount}
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-amber" />
              Academic Deficiencies: {academicHoldCount}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by student no, name, program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input"
              style={{ paddingLeft: '2rem', width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="saas-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              <option value="ALL">All Records</option>
              <option value="CLEARED">Fully Cleared (Overall)</option>
              <option value="HOLD_FINANCIAL">Hold - Financial (Balance &gt; 0)</option>
              <option value="HOLD_ACADEMIC">Hold - Academic Deficiency</option>
              <option value="PROBATION">Academic Probation (Failed &gt;= 6u)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem 1.5rem' }}>
          <table className="saas-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Student No</th>
                <th>Student Name</th>
                <th style={{ width: '80px' }}>Program</th>
                <th style={{ width: '110px', textAlign: 'center' }}>SGP GWA</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Units Breakdown</th>
                <th style={{ width: '150px' }}>Academic Standing</th>
                <th style={{ width: '150px' }}>SIAS Accounting</th>
                <th style={{ width: '180px' }}>Clearance Verdict</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Pulling SGP grade statuses and SIAS accounting clearances...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No student records matched your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.studentId}>
                    <td className="font-mono-numbers" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {row.studentNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{row.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Year {row.yearLevel}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{row.programCode}</td>

                    {/* SGP GWA */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-mono-numbers" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {row.gwa || 'N/A'}
                      </span>
                    </td>

                    {/* Units Breakdown */}
                    <td style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                      <span>{row.passedUnits}/{row.totalUnits} passed</span>
                      {row.failedUnits > 0 && (
                        <span style={{ color: '#fb7185', display: 'block', fontSize: '0.7rem' }}>
                          ({row.failedUnits}u failed)
                        </span>
                      )}
                    </td>

                    {/* Academic Standing */}
                    <td>
                      {row.academicStanding === 'GOOD_STANDING' ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          <span className="badge-dot badge-dot-green" />
                          Good Standing
                        </span>
                      ) : row.academicStanding === 'ACADEMIC_PROBATION' ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          <span className="badge-dot badge-dot-red" />
                          Academic Probation
                        </span>
                      ) : row.academicStanding === 'ACADEMIC_WARNING' ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          <span className="badge-dot badge-dot-amber" />
                          Academic Warning
                        </span>
                      ) : (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          In Progress
                        </span>
                      )}
                    </td>

                    {/* SIAS Accounting Balance */}
                    <td>
                      {row.isFinanciallyCleared ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-green" />
                            Cleared
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {row.balance === 0 ? '₱0' : `₱${row.balance.toLocaleString()}`}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-red" />
                            Hold (₱{row.balance.toLocaleString()})
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Final Clearance Verdict */}
                    <td>
                      {row.isOverallCleared ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                          <span className="badge-dot badge-dot-green" />
                          Cleared for Graduation / Enrollment
                        </span>
                      ) : !row.isFinanciallyCleared && row.isAcademicallyCleared ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                          <span className="badge-dot badge-dot-red" />
                          Hold (Settle Balance with Cashier)
                        </span>
                      ) : !row.isAcademicallyCleared && row.isFinanciallyCleared ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                          <span className="badge-dot badge-dot-amber" />
                          Hold (Academic Deficiency)
                        </span>
                      ) : (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                          <span className="badge-dot badge-dot-red" />
                          Hold (Academic + Financial)
                        </span>
                      )}
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
