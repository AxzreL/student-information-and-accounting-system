'use client';

import React from 'react';

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
      code: 'AUTH:SYS_ADMIN',
      name: 'Dr. Alejandro Gomez',
      station: 'VP_ACAD_FINANCE',
    },
    REGISTRAR: {
      code: 'AUTH:UNIV_REG',
      name: 'Maria Elena Veloso',
      station: 'ADMISSIONS_DESK_01',
    },
    CASHIER: {
      code: 'AUTH:CHIEF_CASHIER',
      name: 'Roberto Fernandez, CPA',
      station: 'COLLECTIONS_REGISTER_04',
    },
  };

  return (
    <header className="no-print" style={{ borderBottom: '1px solid var(--border-hairline)', background: 'var(--bg-surface)' }}>
      {/* Top Telemetry & Instrument Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          borderBottom: '1px solid var(--border-hairline)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Unit Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.2rem 0.45rem',
              background: 'var(--signal-amber)',
              color: '#0d0e10',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              borderRadius: 'var(--radius-strict)',
            }}
          >
            SSU::SIAS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                {institutionName}
              </span>
              <span className="tag-mono" style={{ fontSize: '0.62rem' }}>
                [SYS_ID: 2.4.0-PROD]
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              TELEMETRY: ACTIVE // STUDENT INFORMATION & ACCOUNTING CONSOLE
            </div>
          </div>
        </div>

        {/* Console Controls: Academic Term, Role Rotary, Operator ID & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Term Telemetry */}
          <div className="tag-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem' }}>
            <span style={{ color: 'var(--signal-green)' }}>●</span>
            <span>{activeTermName.toUpperCase()}</span>
          </div>

          {/* Rotary Role Selectors */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-strict)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`btn-mechanical btn-sm ${currentRole === 'ADMIN' ? 'btn-signal-amber' : ''}`}
              style={{
                border: 'none',
                background: currentRole === 'ADMIN' ? 'var(--signal-amber)' : 'transparent',
                color: currentRole === 'ADMIN' ? '#0d0e10' : 'var(--text-secondary)',
                fontSize: '0.68rem',
              }}
            >
              [01_ADMIN]
            </button>
            <button
              onClick={() => onRoleChange('REGISTRAR')}
              className={`btn-mechanical btn-sm ${currentRole === 'REGISTRAR' ? 'btn-signal-amber' : ''}`}
              style={{
                border: 'none',
                background: currentRole === 'REGISTRAR' ? 'var(--signal-amber)' : 'transparent',
                color: currentRole === 'REGISTRAR' ? '#0d0e10' : 'var(--text-secondary)',
                fontSize: '0.68rem',
              }}
            >
              [02_REGISTRAR]
            </button>
            <button
              onClick={() => onRoleChange('CASHIER')}
              className={`btn-mechanical btn-sm ${currentRole === 'CASHIER' ? 'btn-signal-amber' : ''}`}
              style={{
                border: 'none',
                background: currentRole === 'CASHIER' ? 'var(--signal-amber)' : 'transparent',
                color: currentRole === 'CASHIER' ? '#0d0e10' : 'var(--text-secondary)',
                fontSize: '0.68rem',
              }}
            >
              [03_CASHIER]
            </button>
          </div>

          {/* Operator Readout */}
          <div
            style={{
              padding: '0.25rem 0.65rem',
              background: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-strict)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {roleProfiles[currentRole].name}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
              {roleProfiles[currentRole].code} • {roleProfiles[currentRole].station}
            </div>
          </div>

          {/* Precision Rocker Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="rocker-toggle"
            title={`Toggle Theme Mode (Current: ${theme.toUpperCase()})`}
            aria-label="Toggle Theme Mode"
          >
            <span className={`rocker-option ${theme === 'dark' ? 'active' : ''}`}>DARK</span>
            <span className={`rocker-option ${theme === 'light' ? 'active' : ''}`}>LIGHT</span>
          </button>
        </div>
      </div>

      {/* Structured Tactical Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 1.25rem',
          background: 'var(--bg-surface-sunken)',
          borderBottom: '1px solid var(--border-hairline)',
          gap: '0',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => onTabChange('dashboard')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderRight: '1px solid var(--border-hairline)',
            borderBottom: activeTab === 'dashboard' ? '2px solid var(--signal-amber)' : '2px solid transparent',
            background: activeTab === 'dashboard' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--text-primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'background var(--trans-instant)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ color: activeTab === 'dashboard' ? 'var(--signal-amber)' : 'inherit' }}>[01]</span>
          SYSTEM_OVERVIEW
        </button>

        <button
          onClick={() => onTabChange('registrar')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderRight: '1px solid var(--border-hairline)',
            borderBottom: activeTab === 'registrar' ? '2px solid var(--signal-amber)' : '2px solid transparent',
            background: activeTab === 'registrar' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'registrar' ? 'var(--text-primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'background var(--trans-instant)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ color: activeTab === 'registrar' ? 'var(--signal-amber)' : 'inherit' }}>[02]</span>
          REGISTRAR_DIRECTORY
        </button>

        <button
          onClick={() => onTabChange('cashier')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderRight: '1px solid var(--border-hairline)',
            borderBottom: activeTab === 'cashier' ? '2px solid var(--signal-amber)' : '2px solid transparent',
            background: activeTab === 'cashier' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'cashier' ? 'var(--text-primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'background var(--trans-instant)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ color: activeTab === 'cashier' ? 'var(--signal-amber)' : 'inherit' }}>[03]</span>
          FINANCIAL_LEDGER_CASHIER
        </button>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => onTabChange('admin')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.65rem 1.15rem',
              border: 'none',
              borderRight: '1px solid var(--border-hairline)',
              borderBottom: activeTab === 'admin' ? '2px solid var(--signal-amber)' : '2px solid transparent',
              background: activeTab === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'background var(--trans-instant)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span style={{ color: activeTab === 'admin' ? 'var(--signal-amber)' : 'inherit' }}>[04]</span>
            MASTER_REGISTRY_AUDIT
          </button>
        )}
      </div>
    </header>
  );
}
