'use client';

import React, { useState } from 'react';
import SgpHeader from '@/components/SgpHeader';
import FacultyGradeSheet from '@/components/FacultyGradeSheet';
import StudentGradesPortal from '@/components/StudentGradesPortal';

export default function SgpHomePage() {
  const [activePortalView, setActivePortalView] = useState<'FACULTY' | 'STUDENT'>('FACULTY');
  const [inspectedStudentId, setInspectedStudentId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleInspectStudent = (studentId: string) => {
    setInspectedStudentId(studentId);
    setActivePortalView('STUDENT');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* SGP Main Navigation Header */}
      <SgpHeader
        activePortalView={activePortalView}
        setActivePortalView={setActivePortalView}
        academicTerm="A.Y. 2024-2025 1st Semester"
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
            initialStudentId={inspectedStudentId}
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
