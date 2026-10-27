'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Lock,
  CheckCircle,
  FileText,
  Printer,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  BookOpen,
  DollarSign,
  User,
} from 'lucide-react';
import PrintGradeSlipModal from './PrintGradeSlipModal';

interface StudentGradesPortalProps {
  initialStudentId?: string;
  showToast: (msg: string) => void;
  siasBaseUrl?: string;
}

export default function StudentGradesPortal({
  initialStudentId,
  showToast,
  siasBaseUrl = 'http://localhost:3000',
}: StudentGradesPortalProps) {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch student grades & balance clearance directly from SIAS API
  const fetchStudentGrades = async (targetId?: string) => {
    setLoading(true);
    try {
      const url = targetId
        ? `${siasBaseUrl}/api/sgp/student-grades?studentId=${targetId}`
        : `${siasBaseUrl}/api/sgp/student-grades`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setPortalData(data);
        if (data.students && data.students.length > 0) {
          setStudentList(data.students);
          if (!selectedStudentId && data.student) {
            setSelectedStudentId(data.student.id);
          }
        }
      } else {
        showToast(`Failed to load student data from SIAS: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to SIAS Student Grades endpoint (Port 3000)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentGrades(selectedStudentId);
  }, [selectedStudentId]);

  const handleStudentSwitch = (newId: string) => {
    setSelectedStudentId(newId);
  };

  const student = portalData?.student;
  const clearance = portalData?.clearance;
  const grades = portalData?.grades;
  const currentTerm = portalData?.currentTerm;
  const isWithheld = clearance?.isWithheld;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Demo Student Switcher */}
      <div
        className="saas-card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Student Academic Portal & Clearance Check
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-blue" />
              Live Accounting Clearance Sync
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Students view encoded grades and term performance. Automatically enforces school policy: <em>"No balance clearance in SIAS, no grades released."</em>
          </div>
        </div>

        {/* Demo Switcher to test Cleared vs Held students */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Switch Demo Student:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSwitch(e.target.value)}
            className="saas-input"
            style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '300px' }}
          >
            {studentList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.studentNo} - {st.name} ({st.isCleared ? 'Cleared' : `Hold - ₱${st.balance.toLocaleString()}`})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchStudentGrades(selectedStudentId)}
            className="btn-saas"
            style={{ fontSize: '0.8rem' }}
            title="Refresh clearance from SIAS"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="saas-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Verifying SIAS Accounting clearance and loading semester grades...
        </div>
      ) : !portalData?.student ? (
        <div className="saas-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No enrolled student record found in SIAS.
        </div>
      ) : (
        <>
          {/* Student Profile & Academic Summary Strip */}
          <div className="saas-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Student Name & Number
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {student.name}
                </div>
                <div className="font-mono-numbers" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  StudentNo: {student.studentNo}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Program & Year Level
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {student.program.name} ({student.program.code})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Year {student.yearLevel} · {student.department?.name || student.program?.department?.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Academic Term & Load
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {currentTerm?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Total Enrolled: {portalData.enrollment?.totalUnits} Academic Units
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Accounting Clearance Status
                </div>
                <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {clearance.isCleared ? (
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot badge-dot-green" />
                      Cleared with Accounting
                    </span>
                  ) : (
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot badge-dot-red" />
                      Financial Hold (Unsettled)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Ledger Balance: <span className="font-mono-numbers" style={{ fontWeight: 600 }}>₱{clearance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRATION BANNER: Balance Clearance Policy ("No Clearance, No Grades") */}
          {isWithheld ? (
            <div
              className="saas-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.15rem',
                }}
              >
                <Lock size={22} style={{ color: '#fb7185' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Official Grades Withheld — Financial Clearance Required
                  </span>
                  <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                    <span className="badge-dot badge-dot-red" />
                    SSU Policy: No Clearance, No Grades
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>
                  {clearance.reason}
                </div>

                {/* SIAS Ledger Summary Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Assessment:</span>
                    <div className="font-mono-numbers" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      ₱{clearance.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Paid to Date:</span>
                    <div className="font-mono-numbers" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      ₱{clearance.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Outstanding Balance:</span>
                    <div className="font-mono-numbers" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fb7185' }}>
                      ₱{clearance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exam Permit:</span>
                    <div>
                      <span className="badge-status badge-neutral" style={{ fontSize: '0.68rem' }}>
                        <span className="badge-dot badge-dot-red" />
                        {clearance.examPermitStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-saas btn-saas-primary"
                    style={{ fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    <DollarSign size={13} />
                    <span>Open SIAS Cashier to Settle Balance</span>
                    <ExternalLink size={12} />
                  </a>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Once payment or clearance permit is recorded in SIAS, refreshing this page will instantly unlock your grades.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Fully Cleared Banner */
            <div
              className="saas-card"
              style={{
                padding: '1.25rem 1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Accounting Clearance Verified
                    </span>
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                      <span className="badge-dot badge-dot-green" />
                      Official Grades Released
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {clearance.reason}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>General Weighted Average</div>
                  <div className="font-mono-numbers" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {grades.gwa || 'N/A'}
                  </div>
                </div>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="btn-saas btn-saas-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Printer size={14} />
                  <span>Print Official Grade Slip</span>
                </button>
              </div>
            </div>
          )}

          {/* Grades Table */}
          <div className="saas-card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Enrolled Subject Grades & Evaluation</div>
                <div className="card-description">
                  Official subject records certified by the University Registrar and Faculty Department.
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  disabled={isWithheld}
                  className="btn-saas"
                  style={{ fontSize: '0.78rem' }}
                >
                  <FileText size={13} />
                  <span>Report Card View</span>
                </button>
              </div>
            </div>

            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Subject Code</th>
                    <th>Descriptive Title</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Units</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Section</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Prelim</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Midterm</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Finals</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Final Rating</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Remarks</th>
                    <th>Assigned Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.subjects.map((sub: any) => (
                    <tr key={sub.id}>
                      <td className="font-mono-numbers" style={{ fontWeight: 600 }}>
                        {sub.code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{sub.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {sub.schedule} · {sub.room}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{sub.totalUnits}</td>
                      <td style={{ textAlign: 'center', fontSize: '0.78rem' }}>{sub.section}</td>

                      {/* Scores: Masked if Withheld */}
                      <td style={{ textAlign: 'center' }}>
                        {isWithheld ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>--</span>
                        ) : (
                          <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                            {sub.prelimGrade !== null && sub.prelimGrade !== undefined ? `${sub.prelimGrade}` : '--'}
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {isWithheld ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>--</span>
                        ) : (
                          <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                            {sub.midtermGrade !== null && sub.midtermGrade !== undefined ? `${sub.midtermGrade}` : '--'}
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {isWithheld ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>--</span>
                        ) : (
                          <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                            {sub.finalsGrade !== null && sub.finalsGrade !== undefined ? `${sub.finalsGrade}` : '--'}
                          </span>
                        )}
                      </td>

                      {/* Final Rating Rating 1.00-5.00 */}
                      <td style={{ textAlign: 'center' }}>
                        {isWithheld ? (
                          <span
                            className="font-mono-numbers"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#fb7185',
                              letterSpacing: '0.04em',
                            }}
                          >
                            WITHHELD
                          </span>
                        ) : (
                          <span
                            className="font-mono-numbers"
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: sub.grade === '5.00' ? '#fb7185' : 'var(--text-primary)',
                            }}
                          >
                            {sub.grade}
                          </span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td style={{ textAlign: 'center' }}>
                        {isWithheld ? (
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.68rem' }}>
                            <span className="badge-dot badge-dot-red" />
                            Financial Hold
                          </span>
                        ) : sub.remarks === 'PASSED' ? (
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-green" />
                            Passed
                          </span>
                        ) : sub.remarks === 'FAILED' ? (
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-red" />
                            Failed
                          </span>
                        ) : sub.remarks === 'INCOMPLETE' ? (
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-amber" />
                            Incomplete
                          </span>
                        ) : (
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            Ungraded
                          </span>
                        )}
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {sub.instructor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Term Summary Box */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                Total Enrolled Units: <strong style={{ color: 'var(--text-primary)' }}>{grades.totalUnits}</strong>
                {grades.passedUnits !== null && (
                  <>
                    {' '}· Passed Units:{' '}
                    <strong style={{ color: '#10b981' }}>{grades.passedUnits}</strong>
                  </>
                )}
                {grades.failedUnits !== null && grades.failedUnits > 0 && (
                  <>
                    {' '}· Failed Units:{' '}
                    <strong style={{ color: '#f43f5e' }}>{grades.failedUnits}</strong>
                  </>
                )}
              </div>

              <div>
                Semester GWA:{' '}
                {isWithheld ? (
                  <span style={{ color: '#fb7185', fontWeight: 600 }}>Withheld</span>
                ) : (
                  <strong className="font-mono-numbers" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {grades.gwa || 'Pending'}
                  </strong>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Official Print Grade Slip Modal */}
      <PrintGradeSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        gradeData={portalData}
      />
    </div>
  );
}
