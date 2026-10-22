'use client';

import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Receipt,
  UserCheck,
  Sun,
  Moon,
  School,
  Calendar,
} from 'lucide-react';

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
}: HeaderProps) {
  const roleProfiles = {
    ADMIN: {
      name: 'Dr. Alejandro Gomez',
      title: 'Administrator',
      badge: 'Admin Access',
      avatar: 'AG',
      color: 'var(--accent-purple)',
    },
    REGISTRAR: {
      name: 'Maria Elena Veloso',
      title: 'University Registrar',
      badge: 'Academic Admissions',
      avatar: 'MV',
      color: 'var(--accent-emerald)',
    },
    CASHIER: {
      name: 'Roberto Fernandez, CPA',
      title: 'Cashier & Finance Officer',
      badge: 'Accounting & Collections',
      avatar: 'RF',
      color: 'var(--accent-cyan)',
    },
  };

  return (
    <header className="no-print" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
      {/* Top Branding & Role Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Institution Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <School size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {institutionName}
              </h1>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                SIAS v2.4
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Student Information & Accounting System • Higher Education
            </p>
          </div>
        </div>

        {/* Academic Term Indicator & Fast Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Active Term Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>{activeTermName}</span>
          </div>

          {/* Quick Role Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '0 0.5rem', fontWeight: 600 }}>
              ROLE:
            </span>
            <button
              onClick={() => onRoleChange('ADMIN')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: currentRole === 'ADMIN' ? 'var(--accent-purple)' : 'transparent',
                color: currentRole === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleChange('REGISTRAR')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: currentRole === 'REGISTRAR' ? 'var(--accent-emerald)' : 'transparent',
                color: currentRole === 'REGISTRAR' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              Registrar
            </button>
            <button
              onClick={() => onRoleChange('CASHIER')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: currentRole === 'CASHIER' ? 'var(--accent-cyan)' : 'transparent',
                color: currentRole === 'CASHIER' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              Cashier
            </button>
          </div>

          {/* Active User Avatar & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: roleProfiles[currentRole].color,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {roleProfiles[currentRole].avatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{roleProfiles[currentRole].name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{roleProfiles[currentRole].title}</span>
            </div>
          </div>

          {/* Animated Theme Toggle Switch */}
          <button
            onClick={onToggleTheme}
            className="theme-switch-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Dark and Light Mode"
          >
            <div className="theme-switch-thumb">
              {theme === 'dark' ? (
                <Moon size={15} className="theme-icon-animate" />
              ) : (
                <Sun size={15} className="theme-icon-animate" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.75rem',
          background: 'var(--bg-primary)',
        }}
      >
        <button
          onClick={() => onTabChange('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'dashboard' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'dashboard' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <UserCheck size={16} />
          Overview Dashboard
        </button>

        <button
          onClick={() => onTabChange('registrar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'registrar' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'registrar' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'registrar' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <GraduationCap size={16} />
          Registrar & Enrollment
        </button>

        <button
          onClick={() => onTabChange('cashier')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'cashier' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'cashier' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'cashier' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <Receipt size={16} />
          Cashier & Accounting
        </button>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => onTabChange('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--text-main)' : 'var(--text-muted)',
              borderBottom: activeTab === 'admin' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={16} />
            Masterlist & Audit Logs
          </button>
        )}
      </div>
    </header>
  );
}
