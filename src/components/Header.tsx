'use client';

import { Sun, Moon, School, ChevronDown, ExternalLink, Award } from 'lucide-react';

export type UserRole = 'ADMIN' | 'REGISTRAR' | 'CASHIER';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  institutionName: string;
  activeTermName: string;
  onOpenClearanceModal?: () => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  institutionName,
  activeTermName,
  onOpenClearanceModal,
}: HeaderProps) {
  const roleProfiles: Record<UserRole, { name: string; title: string; initials: string }> = {
    ADMIN: {
      name: 'Dr. Alejandro Gomez',
      title: 'System Administrator (SIAS)',
      initials: 'AG',
    },
    REGISTRAR: {
      name: 'Maria Elena Veloso',
      title: 'University Registrar (SIAS)',
      initials: 'MV',
    },
    CASHIER: {
      name: 'Roberto Fernandez, CPA',
      title: 'Finance & Cashier (SIAS)',
      initials: 'RF',
    },
  };

  return (
    <header className="no-print" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
      {/* Top Navbar */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Organization & App Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <School size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                {institutionName}
              </span>
              <span className="badge-status badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                SIAS Port:3000
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Student Information and Accounting System (System of Record)
            </div>
          </div>
        </div>

        {/* Right Controls: Academic Term, Role Switcher, SGP Cross-link & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Active Term Pill */}
          <div
            className="badge-status badge-neutral"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span>{activeTermName}</span>
          </div>

          {/* Clean Segmented Role Switcher: Admin, Registrar, Cashier */}
          <div className="segmented-control">
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`segmented-btn ${currentRole === 'ADMIN' ? 'active' : ''}`}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleChange('REGISTRAR')}
              className={`segmented-btn ${currentRole === 'REGISTRAR' ? 'active' : ''}`}
            >
              Registrar
            </button>
            <button
              onClick={() => onRoleChange('CASHIER')}
              className={`segmented-btn ${currentRole === 'CASHIER' ? 'active' : ''}`}
            >
              Cashier
            </button>
          </div>

          {/* Cross-System Link to Separate Student Grades Portal (Port 3001) */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-saas"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              textDecoration: 'none',
              gap: '0.4rem',
            }}
            title="Launch separate Student Grades Portal (Faculty Grade Encoding & Student Report Cards) on Port 3001"
          >
            <Award size={13} style={{ color: '#3b82f6' }} />
            <span>Student Grades Portal</span>
            <ExternalLink size={12} style={{ opacity: 0.6 }} />
          </a>

          {/* User Account Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {roleProfiles[currentRole].initials}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {roleProfiles[currentRole].name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {roleProfiles[currentRole].title}
              </div>
            </div>
          </div>

          {/* Clean Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn-saas"
            style={{ padding: '0.45rem', width: '32px', height: '32px', borderRadius: 'var(--radius-md)' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Clean Tab Navigation Bar */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            gap: '0.25rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => onTabChange('dashboard')}
            className={`tab-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Overview (SIAS)
          </button>

          <button
            onClick={() => onTabChange('registrar')}
            className={`tab-nav-btn ${activeTab === 'registrar' ? 'active' : ''}`}
          >
            Registrar & Admissions
          </button>

          <button
            onClick={() => onTabChange('cashier')}
            className={`tab-nav-btn ${activeTab === 'cashier' ? 'active' : ''}`}
          >
            Cashier & Accounting
          </button>

          {onOpenClearanceModal && (
            <button
              onClick={onOpenClearanceModal}
              className="tab-nav-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Award size={13} style={{ color: '#3b82f6' }} />
              <span>Academic & Clearance Report (SGP)</span>
            </button>
          )}

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`tab-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            >
              System Administration
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
