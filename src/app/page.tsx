'use client';

import React, { useState, useEffect } from 'react';
import Header, { UserRole } from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import RegistrarView from '@/components/RegistrarView';
import CashierView from '@/components/CashierView';
import AdminView from '@/components/AdminView';

import NewStudentModal from '@/components/NewStudentModal';
import EnrollmentModal from '@/components/EnrollmentModal';
import PaymentModal from '@/components/PaymentModal';
import PrintReceiptModal from '@/components/PrintReceiptModal';
import PrintCorModal from '@/components/PrintCorModal';
import PrintSoaModal from '@/components/PrintSoaModal';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('REGISTRAR');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Server Data State
  const [settings, setSettings] = useState<any>({});
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [feeTemplates, setFeeTemplates] = useState<any[]>([]);

  const [statsData, setStatsData] = useState<any>({
    stats: {},
    recentPayments: [],
    recentEnrollments: [],
  });
  const [students, setStudents] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Modals
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [enrollmentStudent, setEnrollmentStudent] = useState<any>(null);
  const [paymentAssessment, setPaymentAssessment] = useState<any>(null);

  // Print Modals
  const [receiptData, setReceiptData] = useState<any>(null);
  const [corData, setCorData] = useState<any>(null);
  const [soaData, setSoaData] = useState<any>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  // Circular Screen Transition State (for browsers without View Transitions)
  const [circleRipple, setCircleRipple] = useState<{
    x: number;
    y: number;
    radius: number;
    color: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const toggleTheme = (e?: React.MouseEvent<HTMLElement>) => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Calculate exact origin coordinates from the clicked switch button
    let x = window.innerWidth - 80;
    let y = 30;
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.clientX || rect.left + rect.width / 2;
      y = e.clientY || rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const applyThemeChange = () => {
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('sias_theme', next);
      } catch (err) {}
      showToast(`Switched to ${next === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`);
    };

    // 1. If native View Transitions API is supported (Edge, Chrome, Safari 18+)
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const transition = (document as any).startViewTransition(() => {
        applyThemeChange();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      // 2. High-performance fallback: circular expanding ripple overlay
      setCircleRipple({
        x,
        y,
        radius: 0,
        color: next === 'dark' ? '#0b1120' : '#f8fafc',
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCircleRipple((prev) => (prev ? { ...prev, radius: endRadius } : null));
        });
      });

      setTimeout(() => {
        applyThemeChange();
        setTimeout(() => {
          setCircleRipple(null);
        }, 300);
      }, 550);
    }
  };

  // Initial Data Fetch & Theme Restore
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('sias_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [settingsRes, statsRes, studentsRes, programsRes, assessmentsRes] =
        await Promise.all([
          fetch('/api/settings').then((r) => r.json()),
          fetch('/api/dashboard/stats').then((r) => r.json()),
          fetch('/api/students').then((r) => r.json()),
          fetch('/api/programs').then((r) => r.json()),
          fetch('/api/accounting/assessments').then((r) => r.json()),
        ]);

      if (settingsRes.success) {
        setSettings(settingsRes.settings);
        setCurrentTerm(settingsRes.currentTerm);
        setFeeTemplates(settingsRes.feeTemplates);
      }

      if (statsRes.success) {
        setStatsData(statsRes);
      }

      if (studentsRes.success) {
        setStudents(studentsRes.students);
      }

      if (programsRes.success) {
        const flattenedProgs: any[] = [];
        programsRes.departments?.forEach((d: any) => {
          d.programs?.forEach((p: any) => {
            flattenedProgs.push({ ...p, department: d });
          });
        });
        setPrograms(flattenedProgs);
        setSubjects(programsRes.subjects || []);
      }

      if (assessmentsRes.success) {
        setAssessments(assessmentsRes.assessments);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  const handleStudentCreated = () => {
    fetchAllData();
    showToast('New student record admitted successfully!');
  };

  const handleEnrollmentSuccess = (result: any) => {
    fetchAllData();
    showToast(`Enrolled successfully! Assessment created for ${result.student?.firstName} ${result.student?.lastName}`);
    // Automatically trigger COR print preview!
    setCorData({
      ...result.enrollment,
      student: result.student,
      assessment: result.assessment,
      subjects: result.enrollment?.subjects || [],
    });
  };

  const handlePaymentSuccess = (result: any) => {
    fetchAllData();
    showToast(`Official Receipt ${result.payment?.orNumber} generated successfully!`);
    // Automatically trigger Official Receipt print preview!
    setReceiptData({
      payment: result.payment,
      assessment: result.assessment,
      student: result.student,
    });
  };

  const institutionName = settings?.institution_name || 'Samar State University';
  const institutionAddress =
    settings?.institution_address || 'Arteche Blvd, Catbalogan City, Samar, Philippines';
  const activeTermName = currentTerm?.name || 'AY 2024-2025 First Semester';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg-canvas)' }}>
      {/* Circular Screen Transition Overlay (Fallback) */}
      {circleRipple && (
        <div
          className="circular-transition-overlay"
          style={{
            backgroundColor: circleRipple.color,
            clipPath: `circle(${circleRipple.radius}px at ${circleRipple.x}px ${circleRipple.y}px)`,
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-main)',
            padding: '0.75rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            zIndex: 9999,
            fontSize: '0.8125rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
            }}
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Enterprise Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          if (r === 'REGISTRAR') setActiveTab('registrar');
          else if (r === 'CASHIER') setActiveTab('cashier');
          else if (r === 'ADMIN') setActiveTab('admin');
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        institutionName={institutionName}
        activeTermName={activeTermName}
      />

      {/* Main Workspace Body */}
      <main className="no-print" style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={statsData.stats}
            recentPayments={statsData.recentPayments}
            recentEnrollments={statsData.recentEnrollments}
            onNavigate={setActiveTab}
            onOpenReceipt={setReceiptData}
            onOpenCor={setCorData}
          />
        )}

        {activeTab === 'registrar' && (
          <RegistrarView
            students={students}
            programs={programs}
            onOpenNewStudent={() => setIsNewStudentOpen(true)}
            onOpenEnrollment={setEnrollmentStudent}
            onOpenCor={setCorData}
          />
        )}

        {activeTab === 'cashier' && (
          <CashierView
            assessments={assessments}
            onOpenPayment={setPaymentAssessment}
            onOpenSoa={setSoaData}
            onOpenReceipt={setReceiptData}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            currentTerm={currentTerm}
            feeTemplates={feeTemplates}
            institutionName={institutionName}
          />
        )}
      </main>

      {/* Interactive Operational Modals */}
      <NewStudentModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onStudentCreated={handleStudentCreated}
        programs={programs}
      />

      <EnrollmentModal
        isOpen={!!enrollmentStudent}
        onClose={() => setEnrollmentStudent(null)}
        student={enrollmentStudent}
        allSubjects={subjects}
        currentTerm={currentTerm}
        feeTemplates={feeTemplates}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />

      <PaymentModal
        isOpen={!!paymentAssessment}
        onClose={() => setPaymentAssessment(null)}
        assessment={paymentAssessment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Printable Document Modals */}
      <PrintReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        paymentData={receiptData}
        institutionName={institutionName}
        institutionAddress={institutionAddress}
      />

      <PrintCorModal
        isOpen={!!corData}
        onClose={() => setCorData(null)}
        enrollmentData={corData}
        institutionName={institutionName}
        institutionAddress={institutionAddress}
      />

      <PrintSoaModal
        isOpen={!!soaData}
        onClose={() => setSoaData(null)}
        assessmentData={soaData}
        institutionName={institutionName}
        institutionAddress={institutionAddress}
      />
    </div>
  );
}
