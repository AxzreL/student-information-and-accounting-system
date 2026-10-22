'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

interface RegistrarViewProps {
  students: any[];
  programs: any[];
  onOpenNewStudent: () => void;
  onOpenEnrollment: (student: any) => void;
  onOpenCor: (enrollmentData: any) => void;
}

export default function RegistrarView({
  students,
  programs,
  onOpenNewStudent,
  onOpenEnrollment,
  onOpenCor,
}: RegistrarViewProps) {
  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.studentNo.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase());

    const matchesProgram = selectedProgram === '' || s.programId === selectedProgram;
    const matchesYear = selectedYear === '' || String(s.yearLevel) === selectedYear;

    return matchesSearch && matchesProgram && matchesYear;
  });

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
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Students & Admissions
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Manage student records, program curricula, and subject study load allocations.
          </div>
        </div>

        <button onClick={onOpenNewStudent} className="btn-saas btn-saas-primary">
          <Plus size={15} /> Register Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="saas-card"
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="saas-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by student ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            className="saas-input"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '150px' }}>
          <select
            className="saas-input"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Year Levels</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Data Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Program</th>
                <th>Year & Status</th>
                <th>Enrollment Status</th>
                <th>Enrolled Units</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const latestEnrollment = st.enrollments?.[0];
                  const isEnrolled = !!latestEnrollment;
                  const status = latestEnrollment?.status;

                  return (
                    <tr key={st.id}>
                      <td>
                        <span className="font-mono-numbers" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.studentNo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.lastName}, {st.firstName} {st.middleName ? `${st.middleName[0]}.` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {st.email || st.phone || 'No contact info'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{st.program?.code}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {st.program?.department?.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>Year {st.yearLevel}</div>
                        <span className="badge-status badge-neutral" style={{ fontSize: '0.68rem', marginTop: '0.15rem' }}>
                          {st.status}
                        </span>
                      </td>
                      <td>
                        {isEnrolled ? (
                          <span
                            className={`badge-status ${
                              status === 'OFFICIALLY_ENROLLED'
                                ? 'badge-green'
                                : status === 'ASSESSED'
                                ? 'badge-amber'
                                : 'badge-neutral'
                            }`}
                          >
                            {status === 'OFFICIALLY_ENROLLED'
                              ? 'Officially Enrolled'
                              : status === 'ASSESSED'
                              ? 'Assessed'
                              : 'Draft'}
                          </span>
                        ) : (
                          <span className="badge-status badge-red">
                            Not Enrolled
                          </span>
                        )}
                      </td>
                      <td>
                        {isEnrolled ? (
                          <div>
                            <span className="font-mono-numbers" style={{ fontWeight: 600 }}>
                              {latestEnrollment.totalUnits} units
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Lec: {latestEnrollment.totalLecUnits} · Lab: {latestEnrollment.totalLabUnits}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => onOpenEnrollment(st)}
                            className="btn-saas btn-saas-sm"
                          >
                            {isEnrolled ? 'Adjust Load' : 'Enroll'}
                          </button>

                          {isEnrolled && (
                            <button
                              onClick={() => onOpenCor({ ...latestEnrollment, student: st })}
                              className="btn-saas btn-saas-sm"
                            >
                              View COR
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
