'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  Sun,
  Moon,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';

interface SgpHeaderProps {
  activePortalView: 'FACULTY' | 'STUDENT';
  setActivePortalView: (view: 'FACULTY' | 'STUDENT') => void;
  academicTerm?: string;
}

export default function SgpHeader({
  activePortalView,
  setActivePortalView,
  academicTerm = 'A.Y. 2024-2025 1st Semester',
}: SgpHeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('sgp-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sgp-theme', next);
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Left: Branding & SIAS Live Connection Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--btn-primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <GraduationCap size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                  Student Grades Portal
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  SGP Port:3001
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Subic Bay Colleges Inc.</span>
                <span>•</span>
                <span>{academicTerm}</span>
              </div>
            </div>
          </div>

          {/* Micro Integration Badge */}
          <div
            title="SGP reads student enrollments, subjects, and balances directly from SIAS (Port 3000)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-subdued)',
              border: '1px solid var(--border-default)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="badge-dot badge-dot-green" />
            <span>SIAS Connected (Port 3000)</span>
          </div>
        </div>

        {/* Center: SGP Segmented Portal Switcher */}
        <div className="segmented-control">
          <button
            onClick={() => setActivePortalView('FACULTY')}
            className={`segmented-btn ${activePortalView === 'FACULTY' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Users size={14} />
            <span>Faculty Grade Sheets</span>
          </button>
          <button
            onClick={() => setActivePortalView('STUDENT')}
            className={`segmented-btn ${activePortalView === 'STUDENT' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Award size={14} />
            <span>Student Grades & Clearance</span>
          </button>
        </div>

        {/* Right: Cross-Link to SIAS System & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-saas"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', textDecoration: 'none' }}
            title="Open Student Information & Accounting System (Registrar / Cashier) on Port 3000"
          >
            <Layers size={13} />
            <span>Open SIAS System</span>
            <ExternalLink size={12} style={{ opacity: 0.6 }} />
          </a>

          <button
            onClick={toggleTheme}
            className="btn-saas"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
