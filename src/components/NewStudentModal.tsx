'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
      <div className="modal-dialog" style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="card-header">
          <div>
            <div className="card-title">Register New Student</div>
            <div className="card-description">Create an official student admission record</div>
          </div>
          <button
            onClick={onClose}
            className="btn-saas"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div className="alert-danger">
              {error}
            </div>
          )}

          {/* Student No */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Student Number (Leave blank to auto-generate)
            </label>
            <input
              type="text"
              className="saas-input"
              placeholder="e.g. 2024-00105"
              value={formData.studentNo}
              onChange={(e) => setFormData({ ...formData, studentNo: e.target.value })}
            />
          </div>

          {/* Names */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                className="saas-input"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Middle Name
              </label>
              <input
                type="text"
                className="saas-input"
                placeholder="Middle name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                className="saas-input"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Program, Level, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Degree Program *
              </label>
              <select
                className="saas-input"
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Year Level
              </label>
              <select
                className="saas-input"
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Admission Status
              </label>
              <select
                className="saas-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="REGULAR">Regular</option>
                <option value="IRREGULAR">Irregular</option>
                <option value="TRANSFEREE">Transferee</option>
                <option value="RETURNEE">Returnee</option>
              </select>
            </div>
          </div>

          {/* Gender & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                className="saas-input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="saas-input"
                placeholder="student@ssu.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Contact Number
              </label>
              <input
                type="tel"
                className="saas-input"
                placeholder="0917-000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Home Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Home Address / Barangay
            </label>
            <input
              type="text"
              className="saas-input"
              placeholder="Brgy. Guindapunan, Catbalogan City, Samar"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn-saas">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-saas btn-saas-primary">
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
