'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface SgpLoginViewProps {
  onLoginSuccess: (session: { type: 'FACULTY' | 'STUDENT'; data: any }) => void;
  siasBaseUrl?: string;
  institutionName?: string;
}

export default function SgpLoginView({
  onLoginSuccess,
  siasBaseUrl = 'http://localhost:3000',
  institutionName = 'Subic Bay Colleges Inc.',
}: SgpLoginViewProps) {
  const [activeTab, setActiveTab] = useState<'FACULTY' | 'STUDENT'>('FACULTY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Faculty form fields
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPass, setFacultyPass] = useState('');

  // Student form fields
  const [studentNo, setStudentNo] = useState('');
  const [studentPass, setStudentPass] = useState('');

  // Handle Faculty Login
  const handleFacultyLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const email = customEmail || facultyEmail;
    const pass = customPass || facultyPass;

    try {
      const res = await fetch(`${siasBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess({
          type: 'FACULTY',
          data: data.user,
        });
      } else {
        setError(data.error || 'Authentication failed. Please check your faculty credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to reach SIAS authentication service at Port 3000.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Login
  const handleStudentLogin = async (e?: React.FormEvent, customStudentNo?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const no = customStudentNo || studentNo;
    const pass = customPass || studentPass;

    try {
      const res = await fetch(`${siasBaseUrl}/api/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNo: no, password: pass }),
      });

      const data = await res.json();
      if (data.success && data.student) {
        onLoginSuccess({
          type: 'STUDENT',
          data: {
            ...data.student,
            clearance: data.clearance,
          },
        });
      } else {
        setError(data.error || 'Student login failed. Please verify your Student Number.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to reach SIAS student authentication service at Port 3000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        padding: '1.5rem',
      }}
    >
      <div
        className="saas-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.25rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Header Branding & Micro Sync Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--btn-primary-bg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.85rem',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            }}
          >
            <GraduationCap size={24} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Student Grades Portal (SGP)
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {institutionName}
          </div>

          {/* Micro Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-subdued)',
              border: '1px solid var(--border-default)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginTop: '0.65rem',
            }}
          >
            <span className="badge-dot badge-dot-green" />
            <span>Integrated with SIAS (Port 3000)</span>
          </div>
        </div>

        {/* Tab Switcher: Faculty vs Student */}
        <div
          className="segmented-control"
          style={{ width: '100%', display: 'flex', marginBottom: '1.25rem' }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('FACULTY');
              setError(null);
            }}
            className={`segmented-btn ${activeTab === 'FACULTY' ? 'active' : ''}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem' }}
          >
            <Users size={14} />
            <span>Faculty Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('STUDENT');
              setError(null);
            }}
            className={`segmented-btn ${activeTab === 'STUDENT' ? 'active' : ''}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem' }}
          >
            <Award size={14} />
            <span>Student Portal</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="alert-danger"
            style={{ marginBottom: '1.25rem', fontSize: '0.78rem', lineHeight: 1.4 }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Faculty Login Form */}
        {activeTab === 'FACULTY' ? (
          <form onSubmit={(e) => handleFacultyLogin(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Faculty Email / Instructor ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="e.g. faculty@sias.edu.ph"
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  className="saas-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Faculty Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="Enter faculty password..."
                  value={facultyPass}
                  onChange={(e) => setFacultyPass(e.target.value)}
                  className="saas-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-saas btn-saas-primary"
              style={{
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '100%',
                marginTop: '0.25rem',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Faculty'}
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* Student Login Form */
          <form onSubmit={(e) => handleStudentLogin(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Student Number (from SIAS)
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={14}
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
                  required
                  placeholder="e.g. 2024-00101"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  className="saas-input font-mono-numbers"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Student numbers are issued during SIAS enrollment.
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Portal Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="Default: student123"
                  value={studentPass}
                  onChange={(e) => setStudentPass(e.target.value)}
                  className="saas-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-saas btn-saas-primary"
              style={{
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '100%',
                marginTop: '0.25rem',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* 1-Click Demo Presets */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            {activeTab === 'FACULTY' ? '1-Click Faculty Demo' : '1-Click Student Demos'}
          </div>

          {activeTab === 'FACULTY' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setFacultyEmail('faculty@sias.edu.ph');
                  setFacultyPass('faculty123');
                  handleFacultyLogin(undefined, 'faculty@sias.edu.ph', 'faculty123');
                }}
                className="btn-saas"
                style={{ fontSize: '0.72rem', padding: '0.45rem', flexDirection: 'column', gap: '0.15rem' }}
                title="faculty@sias.edu.ph / faculty123"
              >
                <Users size={14} style={{ color: '#3b82f6' }} />
                <span>Prof. Maria Santos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFacultyEmail('dgomez@sias.edu.ph');
                  setFacultyPass('faculty123');
                  handleFacultyLogin(undefined, 'dgomez@sias.edu.ph', 'faculty123');
                }}
                className="btn-saas"
                style={{ fontSize: '0.72rem', padding: '0.45rem', flexDirection: 'column', gap: '0.15rem' }}
                title="dgomez@sias.edu.ph / faculty123"
              >
                <Users size={14} style={{ color: '#10b981' }} />
                <span>Engr. Dan Gomez</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStudentNo('2024-00101');
                  setStudentPass('student123');
                  handleStudentLogin(undefined, '2024-00101', 'student123');
                }}
                className="btn-saas"
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.25rem', flexDirection: 'column', gap: '0.15rem' }}
                title="Mark Anthony Reyes (Cleared with Cashier)"
              >
                <CheckCircle size={13} style={{ color: '#10b981' }} />
                <span>Mark (Cleared)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudentNo('2024-00102');
                  setStudentPass('student123');
                  handleStudentLogin(undefined, '2024-00102', 'student123');
                }}
                className="btn-saas"
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.25rem', flexDirection: 'column', gap: '0.15rem' }}
                title="Princess Mae Tan (UniFAST Scholar, GWA 1.07)"
              >
                <Award size={13} style={{ color: '#3b82f6' }} />
                <span>Princess (Scholar)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudentNo('2024-00201');
                  setStudentPass('student123');
                  handleStudentLogin(undefined, '2024-00201', 'student123');
                }}
                className="btn-saas"
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.25rem', flexDirection: 'column', gap: '0.15rem' }}
                title="Sarah Jane Mendoza (Financial Hold - Withheld Grades)"
              >
                <Lock size={13} style={{ color: '#fb7185' }} />
                <span>Sarah (Hold)</span>
              </button>
            </div>
          )}
        </div>

        {/* Cross-link to SIAS */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Administrator or Cashier? Open SIAS (Port 3000)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
