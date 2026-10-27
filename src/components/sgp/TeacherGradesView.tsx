'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Save,
  Send,
  Search,
  Filter,
  Calculator,
  AlertCircle,
  RefreshCw,
  UserCheck,
  FileText,
} from 'lucide-react';

interface TeacherGradesViewProps {
  onNavigateToStudentPortal?: (studentId: string) => void;
  onNavigateToCashier?: () => void;
  showToast: (msg: string) => void;
}

export default function TeacherGradesView({
  onNavigateToStudentPortal,
  onNavigateToCashier,
  showToast,
}: TeacherGradesViewProps) {
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
      const res = await fetch('/api/sgp/classes');
      const data = await res.json();
      if (data.success && data.classes.length > 0) {
        setClasses(data.classes);
        // Default to first class if not already selected
        if (!selectedClassId) {
          setSelectedClassId(data.classes[0].classId);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading class records');
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
          `/api/sgp/grades?subjectId=${cls.subjectId}&section=${cls.section}`
        );
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error(err);
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
        const p = updated.prelimGrade !== null ? Number(updated.prelimGrade) : null;
        const m = updated.midtermGrade !== null ? Number(updated.midtermGrade) : null;
        const f = updated.finalsGrade !== null ? Number(updated.finalsGrade) : null;

        if (p !== null || m !== null || f !== null) {
          const comp = Number(
            ((p || 0) * 0.3 + (m || 0) * 0.3 + (f || 0) * 0.4).toFixed(2)
          );
          let rating = '5.00';
          let remarks = 'FAILED';

          if (comp >= 97) rating = '1.00';
          else if (comp >= 94) rating = '1.25';
          else if (comp >= 91) rating = '1.50';
          else if (comp >= 88) rating = '1.75';
          else if (comp >= 85) rating = '2.00';
          else if (comp >= 82) rating = '2.25';
          else if (comp >= 79) rating = '2.50';
          else if (comp >= 76) rating = '2.75';
          else if (comp >= 75) rating = '3.00';
          else rating = '5.00';

          remarks = Number(rating) <= 3.0 ? 'PASSED' : 'FAILED';

          updated.computedGrade = comp;
          updated.finalRating = rating;
          updated.remarks = remarks;
        }

        return updated;
      })
    );
  };

  // Handle manual grade override (e.g. INC, DRP)
  const handleOverrideChange = (enrolledSubjectId: string, override: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrolledSubjectId !== enrolledSubjectId) return s;
        if (override === 'INC') {
          return { ...s, finalRating: 'INC', remarks: 'INCOMPLETE' };
        } else if (override === 'DRP') {
          return { ...s, finalRating: 'DRP', remarks: 'DROPPED' };
        } else {
          // Re-calculate normal score
          const p = s.prelimGrade || 0;
          const m = s.midtermGrade || 0;
          const f = s.finalsGrade || 0;
          const comp = Number((p * 0.3 + m * 0.3 + f * 0.4).toFixed(2));
          let rating = '5.00';
          if (comp >= 75) rating = '3.00';
          return { ...s, finalRating: rating, remarks: comp >= 75 ? 'PASSED' : 'FAILED' };
        }
      })
    );
  };

  // Save or submit grades to SIAS backend
  const handleSaveGrades = async (isSubmitting = false) => {
    if (!currentClass || students.length === 0) return;

    setSaving(true);
    try {
      const payload = {
        instructorName: currentClass.instructor,
        isSubmitting,
        grades: students.map((s) => ({
          enrolledSubjectId: s.enrolledSubjectId,
          prelimGrade: s.prelimGrade,
          midtermGrade: s.midtermGrade,
          finalsGrade: s.finalsGrade,
          manualGrade: ['INC', 'DRP'].includes(s.finalRating) ? s.finalRating : undefined,
        })),
      };

      const res = await fetch('/api/sgp/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadClasses();
        // Update local state isSubmitted if submitted
        if (isSubmitting) {
          setStudents((prev) => prev.map((s) => ({ ...s, isSubmitted: true })));
        }
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner / System Responsibility Indicator */}
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
              Student Grades Portal · Faculty Grade Sheet
            </span>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot badge-dot-green" />
              SGP Teacher Portal
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            SIAS manages subjects, sections, and student study loads. Faculty members compute, encode, and submit class records here.
          </div>
        </div>

        {/* Integration Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => handleSaveGrades(false)}
            disabled={saving}
            className="btn-saas"
            style={{ fontSize: '0.8rem' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSaveGrades(true)}
            disabled={saving}
            className="btn-saas btn-saas-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Send size={14} />
            Submit Official Grades
          </button>
        </div>
      </div>

      {/* Class Section Selection Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Select Assigned Class (SIAS Owned):
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="saas-input"
              style={{ minWidth: '320px', fontWeight: 500 }}
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.subjectCode} - {c.subjectTitle} (Sec: {c.section}) · {c.enrolledCount} Students
                </option>
              ))}
            </select>
          </div>

          {currentClass && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                Units: {currentClass.totalUnits}
              </span>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                Room: {currentClass.room}
              </span>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                Schedule: {currentClass.schedule}
              </span>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
                {currentClass.isFullySubmitted ? (
                  <>
                    <span className="badge-dot badge-dot-green" />
                    Officially Submitted to Registrar
                  </>
                ) : (
                  <>
                    <span className="badge-dot badge-dot-amber" />
                    Draft In-Progress ({currentClass.gradedCount}/{currentClass.enrolledCount})
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Search within class */}
        <div style={{ position: 'relative', width: '240px' }}>
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
            placeholder="Search student in class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="saas-input"
            style={{ paddingLeft: '2rem', width: '100%', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Main Grade Encoding Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              Class Record & Grade Encoding Sheet — {currentClass?.subjectCode || ''} ({currentClass?.section || ''})
            </div>
            <div className="card-description">
              Grade Computation: Prelim (30%) + Midterm (30%) + Finals (40%) = 1.00 (97-100) to 5.00 (Below 75).
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-status badge-neutral" style={{ fontSize: '0.72rem' }}>
              Instructor: {currentClass?.instructor || 'Prof. Maria Santos, MSIT'}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="saas-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Student No</th>
                <th>Student Name</th>
                <th style={{ width: '100px' }}>Program</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Prelim (30%)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Midterm (30%)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Finals (40%)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Computed %</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Rating</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Remarks</th>
                <th style={{ width: '170px' }}>SIAS Clearance Status</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading enrolled students from SIAS...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No enrolled students found for this class in SIAS.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.enrolledSubjectId}>
                    <td className="font-mono-numbers" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      {st.studentNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Year {st.yearLevel}</div>
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

                    {/* Final Grade Rating Dropdown / Display */}
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

                    {/* SIAS Accounting Clearance Status (Demonstrates Integration) */}
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

                    {/* Direct Test Links */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigateToStudentPortal && onNavigateToStudentPortal(st.studentId)}
                        className="btn-saas btn-saas-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                        title="View how this student sees their grades in SGP"
                      >
                        Portal
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
            Total Roster: <strong>{students.length}</strong> · Graded: <strong>{students.filter((s) => s.finalRating).length}</strong> · Passed: <strong>{students.filter((s) => s.remarks === 'PASSED').length}</strong> · Failed: <strong>{students.filter((s) => s.remarks === 'FAILED').length}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Integrated with SIAS Student Records & Accounting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
