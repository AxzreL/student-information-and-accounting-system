'use client';

import React, { useState } from 'react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Station Header */}
      <div
        className="instrument-panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--bg-surface-sunken)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[STATION_02]</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>
              REGISTRAR // CANDIDATE_STUDENT_DIRECTORY
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            MANAGE ACADEMIC ADMISSIONS, CURRICULAR LOAD SCHEDULING, AND CERTIFICATE OF REGISTRATION DISPATCH.
          </div>
        </div>

        <button onClick={onOpenNewStudent} className="btn-mechanical btn-signal-amber">
          [+ REGISTER_NEW_CANDIDATE] <span className="hotkey-tag">N</span>
        </button>
      </div>

      {/* Filter & Query Bar */}
      <div
        className="instrument-panel"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="input-instrument"
            placeholder="QUERY: ENTER STUDENT_ID OR NAME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Program Filter */}
        <div style={{ width: '240px' }}>
          <select
            className="input-instrument"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">[ALL_DEGREE_PROGRAMS]</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div style={{ width: '160px' }}>
          <select
            className="input-instrument"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">[ALL_YEAR_LEVELS]</option>
            <option value="1">YR_1 (FRESHMAN)</option>
            <option value="2">YR_2 (SOPHOMORE)</option>
            <option value="3">YR_3 (JUNIOR)</option>
            <option value="4">YR_4 (SENIOR)</option>
          </select>
        </div>

        <div className="tag-mono" style={{ padding: '0.55rem 0.75rem' }}>
          ENTRIES: {filteredStudents.length}/{students.length}
        </div>
      </div>

      {/* High-Density Hairline Registry Table */}
      <div className="instrument-panel" style={{ overflowX: 'auto' }}>
        <table className="hairline-grid-table">
          <thead>
            <tr>
              <th>STUDENT_ID</th>
              <th>CANDIDATE_NAME & CONTACT</th>
              <th>CURRICULUM_PROGRAM</th>
              <th>LEVEL_STATUS</th>
              <th>ENROLLMENT_STATUS</th>
              <th>CREDIT_LOAD</th>
              <th style={{ textAlign: 'right' }}>OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  [ZERO_RECORDS_MATCHING_SPECIFIED_QUERY]
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => {
                const latestEnrollment = st.enrollments?.[0];
                const isEnrolled = !!latestEnrollment;
                const status = latestEnrollment?.status;

                return (
                  <tr key={st.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--signal-amber)' }}>
                      {st.studentNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                        {st.lastName}, {st.firstName} {st.middleName ? `${st.middleName[0]}.` : ''}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {st.email || st.phone || 'NO_CONTACT_REGISTERED'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{st.program?.code}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {st.program?.department?.code}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>YEAR_{st.yearLevel}</div>
                      <span className="tag-mono" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                        [{st.status}]
                      </span>
                    </td>
                    <td>
                      {isEnrolled ? (
                        <span
                          className={`tag-mono ${
                            status === 'OFFICIALLY_ENROLLED'
                              ? 'tag-green'
                              : status === 'ASSESSED'
                              ? 'tag-amber'
                              : ''
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {status === 'OFFICIALLY_ENROLLED'
                            ? '[OFFICIALLY_ENROLLED]'
                            : status === 'ASSESSED'
                            ? '[ASSESSED_PENDING]'
                            : '[DRAFT_COMMITTED]'}
                        </span>
                      ) : (
                        <span className="tag-mono tag-red" style={{ fontSize: '0.65rem' }}>
                          [UNREGISTERED]
                        </span>
                      )}
                    </td>
                    <td>
                      {isEnrolled ? (
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem' }}>
                            {latestEnrollment.totalUnits}_UNITS
                          </span>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                            LEC:{latestEnrollment.totalLecUnits} | LAB:{latestEnrollment.totalLabUnits}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>--</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => onOpenEnrollment(st)}
                          className="btn-mechanical btn-sm"
                          title="Schedule curriculum subjects"
                        >
                          {isEnrolled ? '[ADJUST_LOAD]' : '[ENROLL_LOAD]'}
                        </button>

                        {isEnrolled && (
                          <button
                            onClick={() => onOpenCor({ ...latestEnrollment, student: st })}
                            className="btn-mechanical btn-signal-green btn-sm"
                            title="Generate Certificate of Registration"
                          >
                            [PRINT_COR]
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
