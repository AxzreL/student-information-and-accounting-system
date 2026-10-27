'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Save,
  Send,
  Search,
  Calculator,
  AlertCircle,
  RefreshCw,
  UserCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface FacultyGradeSheetProps {
  onNavigateToStudentPortal?: (studentId: string) => void;
  showToast: (msg: string) => void;
  siasBaseUrl?: string;
}

export default function FacultyGradeSheet({
  onNavigateToStudentPortal,
  showToast,
  siasBaseUrl = 'http://localhost:3000',
}: FacultyGradeSheetProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch classes list owned by SIAS
  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${siasBaseUrl}/api/sgp/classes`);
      const data = await res.json();
      if (data.success && data.classes.length > 0) {
        setClasses(data.classes);
        if (!selectedClassId) {
          setSelectedClassId(data.classes[0].classId);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to SIAS classes endpoint (Port 3000)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Fetch students & encoded grades when selected class changes
  useEffect(() => {
    if (!selectedClassId || classes.length === 0) return;

    const cls = classes.find((c) => c.classId === selectedClassId);
    if (!cls) return;

    setCurrentClass(cls);

    const loadGrades = async () => {
      try {
        const res = await fetch(
          `${siasBaseUrl}/api/sgp/grades?subjectId=${cls.subjectId}&section=${cls.section}`
        );
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error(err);
        showToast('Error loading student grades from SIAS');
      }
    };

    loadGrades();
  }, [selectedClassId, classes]);

  // Handle grade score changes in table
  const handleScoreChange = (
    enrolledSubjectId: string,
    field: 'prelimGrade' | 'midtermGrade' | 'finalsGrade',
    value: string
  ) => {
    const num = value === '' ? null : Math.min(100, Math.max(0, parseFloat(value) || 0));

    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrolledSubjectId !== enrolledSubjectId) return s;

        const updated = { ...s, [field]: num };

        // Dynamic Philippine collegiate rating computation (30% Prelim, 30% Midterm, 40% Finals)
        const p = updated.prelimGrade !== null && updated.prelimGrade !== undefined ? Number(updated.prelimGrade) : 0;
        const m = updated.midtermGrade !== null && updated.midtermGrade !== undefined ? Number(updated.midtermGrade) : 0;
        const f = updated.finalsGrade !== null && updated.finalsGrade !== undefined ? Number(updated.finalsGrade) : 0;

        const hasAnyScore =
          updated.prelimGrade !== null ||
          updated.midtermGrade !== null ||
          updated.finalsGrade !== null;

        if (!hasAnyScore) {
          return {
            ...updated,
            computedGrade: null,
            finalRating: null,
            remarks: 'UNGRADED',
          };
        }

        const raw = Number((p * 0.3 + m * 0.3 + f * 0.4).toFixed(2));
        let rating = '5.00';
        if (raw >= 97) rating = '1.00';
        else if (raw >= 94) rating = '1.25';
        else if (raw >= 91) rating = '1.50';
        else if (raw >= 88) rating = '1.75';
        else if (raw >= 85) rating = '2.00';
        else if (raw >= 82) rating = '2.25';
        else if (raw >= 79) rating = '2.50';
        else if (raw >= 76) rating = '2.75';
        else if (raw >= 75) rating = '3.00';
        else rating = '5.00';

        const remarks = Number(rating) <= 3.0 ? 'PASSED' : 'FAILED';

        return {
          ...updated,
          computedGrade: raw,
          finalRating: rating,
          remarks,
        };
      })
    );
  };

  // Handle manual grade override (INC, DRP)
  const handleOverrideChange = (enrolledSubjectId: string, manualValue: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrolledSubjectId !== enrolledSubjectId) return s;

        if (manualValue === 'INC') {
          return { ...s, finalRating: 'INC', remarks: 'INCOMPLETE' };
        }
        if (manualValue === 'DRP') {
          return { ...s, finalRating: 'DRP', remarks: 'DROPPED' };
        }
        if (manualValue === '') {
          return { ...s, finalRating: null, remarks: 'UNGRADED' };
        }

        const isPassed = !isNaN(Number(manualValue)) && Number(manualValue) <= 3.0;
        return {
          ...s,
          finalRating: manualValue,
          remarks: isPassed ? 'PASSED' : 'FAILED',
        };
      })
    );
  };

  // Save drafts or submit final grades
  const saveGrades = async (isSubmitting: boolean) => {
    setSaving(true);
    try {
      const payload = {
        isSubmitting,
        instructorName: currentClass?.instructor || 'Faculty Instructor',
        grades: students.map((s) => ({
          enrolledSubjectId: s.enrolledSubjectId,
          prelimGrade: s.prelimGrade,
          midtermGrade: s.midtermGrade,
          finalsGrade: s.finalsGrade,
          manualGrade: s.finalRating,
        })),
      };

      const res = await fetch(`${siasBaseUrl}/api/sgp/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          isSubmitting
            ? `Grades officially submitted and posted to SIAS for ${data.count} students.`
            : `Grade drafts saved successfully.`
        );
        loadClasses();
      } else {
        showToast(`Failed to save grades: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving grades to SIAS API');
    } finally {
      setSaving(false);
    }
  };

  // Filter students by name or student number
  const filteredStudents = students.filter(
    (s) =>
      s.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEnrolled = students.length;
  const gradedCount = students.filter((s) => s.finalRating && s.finalRating !== 'UNGRADED').length;
  const passedCount = students.filter((s) => s.remarks === 'PASSED').length;
  const failedCount = students.filter((s) => s.remarks === 'FAILED').length;
  const incCount = students.filter((s) => s.remarks === 'INCOMPLETE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner / Integration Context */}
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
              Faculty Grade Encoding & Class Records
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-green" />
              SIAS Subject Master Synchronized
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Portal reads course sections & enrolled students from SIAS (Port 3000). Automated Philippine standard rating: <strong>Prelim (30%) + Midterm (30%) + Finals (40%)</strong>.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => loadClasses()}
            disabled={loading}
            className="btn-saas"
            style={{ fontSize: '0.8rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sync SIAS Rosters
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div
        className="saas-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Select Class:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="saas-input"
              style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '320px' }}
            >
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.subjectCode} ({cls.section}) - {cls.subjectTitle} [{cls.enrolledCount} Students]
                </option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={13}
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
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="saas-input"
              style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Action Buttons: Save Draft & Official Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => saveGrades(false)}
            disabled={saving || students.length === 0}
            className="btn-saas"
            style={{ fontSize: '0.8rem' }}
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => saveGrades(true)}
            disabled={saving || students.length === 0}
            className="btn-saas btn-saas-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Send size={14} />
            <span>Submit to SIAS Official Records</span>
          </button>
        </div>
      </div>

      {/* Class Information Strip */}
      {currentClass && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="saas-card" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Subject & Section
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {currentClass.subjectCode} · {currentClass.section}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {currentClass.subjectTitle}
            </div>
          </div>

          <div className="saas-card" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Instructor
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {currentClass.instructor}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Faculty Instructor
            </div>
          </div>

          <div className="saas-card" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Schedule & Room
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {currentClass.schedule}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Room: {currentClass.room} ({currentClass.totalUnits} Units)
            </div>
          </div>

          <div className="saas-card" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Submission Status
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              {currentClass.isFullySubmitted ? (
                <span className="badge-status badge-neutral">
                  <span className="badge-dot badge-dot-green" />
                  Submitted & Locked
                </span>
              ) : (
                <span className="badge-status badge-neutral">
                  <span className="badge-dot badge-dot-amber" />
                  Draft / Encoding Open
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {gradedCount} of {totalEnrolled} students graded
            </div>
          </div>
        </div>
      )}

      {/* Grade Encoding Roster Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '110px' }}>Student No</th>
                <th>Student Full Name</th>
                <th style={{ width: '80px' }}>Program</th>
                <th style={{ width: '85px', textAlign: 'center' }}>Prelim (30%)</th>
                <th style={{ width: '85px', textAlign: 'center' }}>Midterm (30%)</th>
                <th style={{ width: '85px', textAlign: 'center' }}>Finals (40%)</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Raw %</th>
                <th style={{ width: '95px', textAlign: 'center' }}>Rating</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Remarks</th>
                <th style={{ width: '150px' }}>SIAS Accounting Clearance</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No students found matching current class or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.enrolledSubjectId}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {idx + 1}
                    </td>
                    <td className="font-mono-numbers" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {st.studentNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{st.fullName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Year {st.yearLevel}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{st.programCode}</td>

                    {/* Prelim Input */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="--"
                        value={st.prelimGrade !== null && st.prelimGrade !== undefined ? st.prelimGrade : ''}
                        onChange={(e) => handleScoreChange(st.enrolledSubjectId, 'prelimGrade', e.target.value)}
                        className="saas-input font-mono-numbers"
                        style={{
                          width: '72px',
                          textAlign: 'center',
                          padding: '0.25rem 0.35rem',
                          fontSize: '0.82rem',
                          margin: '0 auto',
                        }}
                      />
                    </td>

                    {/* Midterm Input */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="--"
                        value={st.midtermGrade !== null && st.midtermGrade !== undefined ? st.midtermGrade : ''}
                        onChange={(e) => handleScoreChange(st.enrolledSubjectId, 'midtermGrade', e.target.value)}
                        className="saas-input font-mono-numbers"
                        style={{
                          width: '72px',
                          textAlign: 'center',
                          padding: '0.25rem 0.35rem',
                          fontSize: '0.82rem',
                          margin: '0 auto',
                        }}
                      />
                    </td>

                    {/* Finals Input */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="--"
                        value={st.finalsGrade !== null && st.finalsGrade !== undefined ? st.finalsGrade : ''}
                        onChange={(e) => handleScoreChange(st.enrolledSubjectId, 'finalsGrade', e.target.value)}
                        className="saas-input font-mono-numbers"
                        style={{
                          width: '72px',
                          textAlign: 'center',
                          padding: '0.25rem 0.35rem',
                          fontSize: '0.82rem',
                          margin: '0 auto',
                        }}
                      />
                    </td>

                    {/* Computed % */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-mono-numbers" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {st.computedGrade ? `${st.computedGrade}%` : '--'}
                      </span>
                    </td>

                    {/* Rating Dropdown */}
                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={st.finalRating || ''}
                        onChange={(e) => handleOverrideChange(st.enrolledSubjectId, e.target.value)}
                        className="saas-input font-mono-numbers"
                        style={{
                          width: '85px',
                          textAlign: 'center',
                          padding: '0.25rem 0.35rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          margin: '0 auto',
                        }}
                      >
                        <option value="">--</option>
                        <option value="1.00">1.00</option>
                        <option value="1.25">1.25</option>
                        <option value="1.50">1.50</option>
                        <option value="1.75">1.75</option>
                        <option value="2.00">2.00</option>
                        <option value="2.25">2.25</option>
                        <option value="2.50">2.50</option>
                        <option value="2.75">2.75</option>
                        <option value="3.00">3.00</option>
                        <option value="5.00">5.00</option>
                        <option value="INC">INC</option>
                        <option value="DRP">DRP</option>
                      </select>
                    </td>

                    {/* Remarks with Uniform Neutral Badges */}
                    <td style={{ textAlign: 'center' }}>
                      {st.remarks === 'PASSED' ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          <span className="badge-dot badge-dot-green" />
                          Passed
                        </span>
                      ) : st.remarks === 'FAILED' ? (
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                          <span className="badge-dot badge-dot-red" />
                          Failed
                        </span>
                      ) : st.remarks === 'INCOMPLETE' ? (
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

                    {/* Live SIAS Accounting Clearance Status */}
                    <td>
                      {st.isCleared ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-green" />
                            Cleared
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {st.balance === 0 ? '₱0 bal' : `₱${st.balance} (Permit OK)`}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span className="badge-status badge-neutral" style={{ fontSize: '0.7rem' }}>
                            <span className="badge-dot badge-dot-red" />
                            Financial Hold
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            Bal: ₱{st.balance.toLocaleString()} (No grades)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Direct Inspection Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigateToStudentPortal && onNavigateToStudentPortal(st.studentId)}
                        className="btn-saas btn-saas-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                        title="View how this student views their portal in SGP"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Showing <strong>{filteredStudents.length}</strong> of <strong>{totalEnrolled}</strong> enrolled students
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Passed: <strong style={{ color: '#10b981' }}>{passedCount}</strong></span>
            <span>Failed: <strong style={{ color: '#f43f5e' }}>{failedCount}</strong></span>
            <span>Incomplete: <strong style={{ color: '#f59e0b' }}>{incCount}</strong></span>
            <span>Graded: <strong>{gradedCount}/{totalEnrolled}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
