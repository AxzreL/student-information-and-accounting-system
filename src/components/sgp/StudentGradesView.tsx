'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Printer,
  CreditCard,
  Search,
  Lock,
  Unlock,
  Building,
  User,
  Calendar,
  Award,
} from 'lucide-react';

interface StudentGradesViewProps {
  initialStudentId?: string;
  onNavigateToCashier?: (assessmentId?: string) => void;
  onOpenGradeSlipPrint?: (gradeData: any) => void;
  showToast: (msg: string) => void;
}

export default function StudentGradesView({
  initialStudentId,
  onNavigateToCashier,
  onOpenGradeSlipPrint,
  showToast,
}: StudentGradesViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load student grades data from SIAS + SGP integration API
  const loadStudentData = async (stId?: string) => {
    setLoading(true);
    try {
      const url = stId ? `/api/sgp/student-grades?studentId=${stId}` : '/api/sgp/student-grades';
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
        showToast(data.error || 'Failed to load student grade records');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading student grades portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData(initialStudentId);
  }, [initialStudentId]);

  const handleStudentSwitch = (newId: string) => {
    setSelectedStudentId(newId);
    loadStudentData(newId);
  };

  const student = portalData?.student;
  const clearance = portalData?.clearance;
  const grades = portalData?.grades;
  const currentTerm = portalData?.currentTerm;
  const isWithheld = clearance?.isWithheld;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner / SGP Identity */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Student Grades Portal · Academic Grade Slip & Clearance
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-blue" />
              SGP Student Access
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Portal checks student balance in SIAS before releasing grades and report cards (Policy: "No Clearance, No Grades").
          </div>
        </div>

        {/* Demo Student Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Switch Demo Student:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSwitch(e.target.value)}
            className="saas-input"
            style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '280px' }}
          >
            {studentList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.studentNo} - {st.name} ({st.isCleared ? 'Cleared' : `Hold - ₱${st.balance.toLocaleString()}`})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="saas-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Verifying SIAS Accounting clearance and loading semester grades...
        </div>
      ) : !portalData?.student ? (
        <div className="saas-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No enrolled student record found.
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
                  Year {student.yearLevel} · {student.department.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Academic Term (SIAS)
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {currentTerm?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {currentTerm?.schoolYear} · {currentTerm?.semester}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Accounting Clearance (SIAS)
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  {clearance.isCleared ? (
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot badge-dot-green" />
                      Financially Cleared
                    </span>
                  ) : (
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot badge-dot-red" />
                      Financial Hold (Bal: ₱{clearance.balance.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KEY INTEGRATION SHOWCASE: Balance Clearance ("No Clearance, No Grades") */}
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
                    <div className="font-mono-numbers" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fb7185' }}>
                      ₱{clearance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={() => onNavigateToCashier && onNavigateToCashier()}
                      className="btn-saas btn-saas-primary"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <CreditCard size={14} />
                      Go to Cashier & Accounting to Settle / Clear Balance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="saas-card"
              style={{
                padding: '1.25rem 1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Unlock size={18} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Student Account Financially Cleared · Official Grades Released
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Cleared with SIAS Accounting. Official Report Card & Certificate of Grades can be printed.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {grades?.gwa && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Semester GWA:</div>
                    <div className="font-mono-numbers" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {grades.gwa}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onOpenGradeSlipPrint && onOpenGradeSlipPrint(portalData)}
                  className="btn-saas btn-saas-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Printer size={15} />
                  Print Official Grade Slip / Report Card
                </button>
              </div>
            </div>
          )}

          {/* Academic Grades Table */}
          <div className="saas-card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Enrolled Study Load & Academic Class Records</div>
                <div className="card-description">
                  Official subjects enrolled via SIAS with grade ratings encoded by assigned faculty in SGP.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                  Total Units: {grades?.totalUnits || 0}
                </span>
                {!isWithheld && (
                  <>
                    <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                      <span className="badge-dot badge-dot-green" />
                      Passed: {grades?.passedUnits || 0} Units
                    </span>
                    {grades?.failedUnits > 0 && (
                      <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                        <span className="badge-dot badge-dot-red" />
                        Failed: {grades?.failedUnits} Units
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>Course Code</th>
                    <th>Descriptive Title</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Section</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Units</th>
                    <th>Instructor (SGP)</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Prelim</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Midterm</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Finals</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Final Rating</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {grades?.subjects?.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No enrolled subjects found in SIAS for this semester.
                      </td>
                    </tr>
                  ) : (
                    grades?.subjects?.map((sub: any) => (
                      <tr key={sub.id}>
                        <td className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                          {sub.code}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>{sub.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {sub.schedule} · {sub.room}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.8rem' }}>{sub.section}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{sub.totalUnits}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.instructor}</td>

                        {/* Prelim Score */}
                        <td style={{ textAlign: 'center' }}>
                          {isWithheld ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>••••</span>
                          ) : (
                            <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                              {sub.prelimGrade ? `${sub.prelimGrade}%` : '--'}
                            </span>
                          )}
                        </td>

                        {/* Midterm Score */}
                        <td style={{ textAlign: 'center' }}>
                          {isWithheld ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>••••</span>
                          ) : (
                            <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                              {sub.midtermGrade ? `${sub.midtermGrade}%` : '--'}
                            </span>
                          )}
                        </td>

                        {/* Finals Score */}
                        <td style={{ textAlign: 'center' }}>
                          {isWithheld ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>••••</span>
                          ) : (
                            <span className="font-mono-numbers" style={{ fontSize: '0.82rem' }}>
                              {sub.finalsGrade ? `${sub.finalsGrade}%` : '--'}
                            </span>
                          )}
                        </td>

                        {/* Final Rating */}
                        <td style={{ textAlign: 'center' }}>
                          {isWithheld ? (
                            <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                              <Lock size={10} style={{ marginRight: '2px' }} />
                              Withheld
                            </span>
                          ) : (
                            <span
                              className="font-mono-numbers"
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: sub.grade === '5.00' ? '#fb7185' : 'var(--text-primary)',
                              }}
                            >
                              {sub.grade || '--'}
                            </span>
                          )}
                        </td>

                        {/* Remarks */}
                        <td style={{ textAlign: 'center' }}>
                          {isWithheld ? (
                            <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Grading Scale Legend Footer */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>
                Grading System: 1.00 (97-100) · 1.25 (94-96) · 1.50 (91-93) · 1.75 (88-90) · 2.00 (85-87) · 2.25 (82-84) · 2.50 (79-81) · 2.75 (76-78) · 3.00 (75 - Passing) · 5.00 (Failed) · INC (Incomplete)
              </div>
              <div>
                Integrated System: SIAS (Accounting & Records) ⇄ SGP (Grades Portal)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
