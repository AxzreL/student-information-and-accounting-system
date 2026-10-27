'use client';

import React, { useState } from 'react';
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Key,
} from 'lucide-react';

interface SiasLoginViewProps {
  onLoginSuccess: (user: any) => void;
  institutionName?: string;
}

export default function SiasLoginView({
  onLoginSuccess,
  institutionName = 'Samar State University',
}: SiasLoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        // Enforce SIAS administrative roles
        if (!['ADMIN', 'REGISTRAR', 'CASHIER'].includes(data.user.role)) {
          setError(
            `Account role is "${data.user.role}". SIAS is reserved for Administrative, Registrar, and Accounting Staff. Please use the Student Grades Portal on Port 3001.`
          );
          setLoading(false);
          return;
        }

        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    handleLogin(undefined, presetEmail, presetPass);
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
          maxWidth: '460px',
          width: '100%',
          padding: '2.25rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            <School size={24} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {institutionName}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Student Information and Accounting System (SIAS)
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Official System of Record for Admissions, Enrollment & Accounting
          </div>
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

        {/* Login Form */}
        <form onSubmit={(e) => handleLogin(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Official Email Address
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
                placeholder="e.g. registrar@sias.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saas-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Password
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
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to SIAS'}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Accounts Helper */}
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
            1-Click Demo Staff Presets
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('admin@sias.edu.ph', 'admin123')}
              className="btn-saas"
              style={{ fontSize: '0.72rem', padding: '0.45rem 0.35rem', flexDirection: 'column', gap: '0.2rem' }}
              title="admin@sias.edu.ph / admin123"
            >
              <ShieldCheck size={14} style={{ color: '#3b82f6' }} />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('registrar@sias.edu.ph', 'registrar123')}
              className="btn-saas"
              style={{ fontSize: '0.72rem', padding: '0.45rem 0.35rem', flexDirection: 'column', gap: '0.2rem' }}
              title="registrar@sias.edu.ph / registrar123"
            >
              <UserCheck size={14} style={{ color: '#10b981' }} />
              <span>Registrar</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('cashier@sias.edu.ph', 'cashier123')}
              className="btn-saas"
              style={{ fontSize: '0.72rem', padding: '0.45rem 0.35rem', flexDirection: 'column', gap: '0.2rem' }}
              title="cashier@sias.edu.ph / cashier123"
            >
              <DollarSign size={14} style={{ color: '#f59e0b' }} />
              <span>Cashier</span>
            </button>
          </div>
        </div>

        {/* Cross-Link to SGP (Port 3001) */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'color var(--trans-fast)',
            }}
          >
            <span>Are you a Faculty Member or Student? Open Grades Portal (Port 3001)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
