'use client';

import React, { useState, useEffect } from 'react';
import SgpHeader from '@/components/SgpHeader';
import FacultyGradeSheet from '@/components/FacultyGradeSheet';
import StudentGradesPortal from '@/components/StudentGradesPortal';
import SgpLoginView from '@/components/SgpLoginView';

export default function SgpHomePage() {
  const [session, setSession] = useState<{ type: 'FACULTY' | 'STUDENT'; data: any } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activePortalView, setActivePortalView] = useState<'FACULTY' | 'STUDENT'>('FACULTY');
  const [inspectedStudentId, setInspectedStudentId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sgp_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSession(parsed);
        setActivePortalView(parsed.type);
        if (parsed.type === 'STUDENT' && parsed.data?.id) {
          setInspectedStudentId(parsed.data.id);
        }
      }
    } catch (e) {}
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = (newSession: { type: 'FACULTY' | 'STUDENT'; data: any }) => {
    setSession(newSession);
    try {
      localStorage.setItem('sgp_auth_session', JSON.stringify(newSession));
    } catch (e) {}
    setActivePortalView(newSession.type);
    if (newSession.type === 'STUDENT' && newSession.data?.id) {
      setInspectedStudentId(newSession.data.id);
    }
    showToast(`Logged in successfully as ${newSession.data?.name || 'User'}`);
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem('sgp_auth_session');
    } catch (e) {}
    showToast('Signed out from Student Grades Portal.');
  };

  const handleInspectStudent = (studentId: string) => {
    setInspectedStudentId(studentId);
    setActivePortalView('STUDENT');
  };

  // If not logged in, render the SGP Dual-Tab Login screen
  if (authChecked && !session) {
    return (
      <SgpLoginView
        onLoginSuccess={handleLoginSuccess}
        siasBaseUrl="http://localhost:3000"
        institutionName="Subic Bay Colleges Inc."
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* SGP Main Navigation Header */}
      <SgpHeader
        activePortalView={activePortalView}
        setActivePortalView={setActivePortalView}
        academicTerm="A.Y. 2024-2025 1st Semester"
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
        {activePortalView === 'FACULTY' ? (
          <FacultyGradeSheet
            onNavigateToStudentPortal={handleInspectStudent}
            showToast={showToast}
          />
        ) : (
          <StudentGradesPortal
            initialStudentId={inspectedStudentId || (session?.type === 'STUDENT' ? session.data?.id : '')}
            showToast={showToast}
          />
        )}
      </main>

      {/* Minimalistic SaaS Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 500,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span className="badge-dot badge-dot-blue" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
