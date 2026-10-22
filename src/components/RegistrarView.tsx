'use client';

import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  BookOpen,
  Printer,
  FileText,
  Filter,
  CheckCircle,
  Clock,
  GraduationCap,
} from 'lucide-react';

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
      {/* Top Action Bar */}
      <div
        className="glass-panel"
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
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={22} style={{ color: 'var(--accent-emerald)' }} />
            Registrar & Student Admissions
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Manage student records, degree programs, curricula, and subject-level enrollment schedules.
          </p>
        </div>

        <button onClick={onOpenNewStudent} className="btn btn-primary">
          <UserPlus size={16} /> Register New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by Student No, First Name, or Last Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Program Filter */}
        <div style={{ width: '220px' }}>
          <select
            className="input-field"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All Degree Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Level Filter */}
        <div style={{ width: '150px' }}>
          <select
            className="input-field"
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
      </div>

      {/* Student Directory Table */}
      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT NO.</th>
              <th>NAME & CONTACT</th>
              <th>DEGREE PROGRAM</th>
              <th>YEAR & STATUS</th>
              <th>ENROLLMENT STATUS</th>
              <th>ENROLLED UNITS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No students found matching your criteria.
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
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent-emerald)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {st.studentNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {st.lastName}, {st.firstName} {st.middleName ? `${st.middleName[0]}.` : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {st.email || st.phone || 'No contact provided'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{st.program?.code}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {st.program?.department?.name}
                      </div>
                    </td>
                    <td>
                      <div>Year {st.yearLevel}</div>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        {st.status}
                      </span>
                    </td>
                    <td>
                      {isEnrolled ? (
                        <span
                          className={`badge ${
                            status === 'OFFICIALLY_ENROLLED'
                              ? 'badge-success'
                              : status === 'ASSESSED'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {status === 'OFFICIALLY_ENROLLED'
                            ? 'Officially Enrolled'
                            : status === 'ASSESSED'
                            ? 'Assessed'
                            : 'Draft'}
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ opacity: 0.7 }}>
                          Not Enrolled
                        </span>
                      )}
                    </td>
                    <td>
                      {isEnrolled ? (
                        <div>
                          <span style={{ fontWeight: 700 }} className="tabular-numbers">
                            {latestEnrollment.totalUnits} Units
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            Lec: {latestEnrollment.totalLecUnits} | Lab: {latestEnrollment.totalLabUnits}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onOpenEnrollment(st)}
                          className="btn btn-secondary btn-sm"
                          title="Enroll or change subjects"
                        >
                          <BookOpen size={14} />
                          {isEnrolled ? 'Adjust' : 'Enroll'}
                        </button>

                        {isEnrolled && (
                          <button
                            onClick={() => onOpenCor({ ...latestEnrollment, student: st })}
                            className="btn btn-primary btn-sm"
                            title="Print Certificate of Registration & Assessment Form"
                          >
                            <Printer size={14} /> COR
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
  );
}
