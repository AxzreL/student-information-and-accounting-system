'use client';

import React, { useState } from 'react';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: () => void;
  programs: any[];
}

export default function NewStudentModal({
  isOpen,
  onClose,
  onStudentCreated,
  programs,
}: NewStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    studentNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    programId: programs[0]?.id || '',
    yearLevel: '1',
    status: 'REGULAR',
    email: '',
    phone: '',
    address: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to register student');
      }

      onStudentCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-tactical" style={{ maxWidth: '640px' }}>
        {/* Header Bar */}
        <div className="instrument-header-bar" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tag-mono tag-amber">[FORM::ADM_01]</span>
            <span style={{ fontWeight: 800 }}>REGISTER_NEW_STUDENT_PROFILE</span>
          </div>
          <button
            onClick={onClose}
            className="btn-mechanical btn-sm"
            style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}
          >
            [ESC]
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && (
            <div
              style={{
                padding: '0.55rem 0.75rem',
                border: '1px solid var(--signal-red)',
                background: 'var(--signal-red-dim)',
                color: 'var(--signal-red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              [ERROR::FAULT] {error}
            </div>
          )}

          {/* Student No */}
          <div>
            <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
              STUDENT_IDENTIFIER // LEAVE_BLANK_FOR_AUTO_SEQUENCE
            </label>
            <input
              type="text"
              className="input-instrument"
              placeholder="AUTO-GENERATE (E.G. 2024-00105)"
              value={formData.studentNo}
              onChange={(e) => setFormData({ ...formData, studentNo: e.target.value })}
            />
          </div>

          {/* Names */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.65rem' }}>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                FIRST_NAME *
              </label>
              <input
                type="text"
                required
                className="input-instrument"
                placeholder="FIRST NAME"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                MIDDLE_NAME
              </label>
              <input
                type="text"
                className="input-instrument"
                placeholder="MIDDLE NAME"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                LAST_NAME *
              </label>
              <input
                type="text"
                required
                className="input-instrument"
                placeholder="LAST NAME"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Program, Level, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.65rem' }}>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                DEGREE_PROGRAM *
              </label>
              <select
                className="input-instrument"
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                required
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                YEAR_LEVEL
              </label>
              <select
                className="input-instrument"
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
              >
                <option value="1">YR_1</option>
                <option value="2">YR_2</option>
                <option value="3">YR_3</option>
                <option value="4">YR_4</option>
              </select>
            </div>

            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                ADMISSION_STATUS
              </label>
              <select
                className="input-instrument"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="REGULAR">REGULAR</option>
                <option value="IRREGULAR">IRREGULAR</option>
                <option value="TRANSFEREE">TRANSFEREE</option>
                <option value="RETURNEE">RETURNEE</option>
              </select>
            </div>
          </div>

          {/* Gender & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '0.65rem' }}>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                GENDER
              </label>
              <select
                className="input-instrument"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">MALE</option>
                <option value="Female">FEMALE</option>
              </select>
            </div>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                EMAIL_COMM
              </label>
              <input
                type="email"
                className="input-instrument"
                placeholder="student@ssu.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
                PHONE_LINE
              </label>
              <input
                type="tel"
                className="input-instrument"
                placeholder="0917-000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Home Address */}
          <div>
            <label className="telemetry-label" style={{ display: 'block', marginBottom: '0.3rem' }}>
              CIVIL_RESIDENCE // BARANGAY_LOCATION
            </label>
            <input
              type="text"
              className="input-instrument"
              placeholder="Brgy. Guindapunan, Catbalogan City, Samar"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
            <button type="button" onClick={onClose} className="btn-mechanical btn-sm">
              [DISCARD]
            </button>
            <button type="submit" disabled={loading} className="btn-mechanical btn-signal-amber btn-sm">
              {loading ? '[COMMITTING...]' : '[COMMIT_REGISTRATION]'} <span className="hotkey-tag">↵</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
