'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Architectural glass background with motion-reactive specular illumination.
 * Strictly positioned on the background canvas (z-index: 0), rendering a smoked glass
 * backdrop whose crystalline grid and specular sheen gently illuminate only when the cursor moves.
 */
export default function CursorGlow() {
  const [isEmitting, setIsEmitting] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch input
      if (e.pointerType === 'touch') return;

      // Update position via hardware-accelerated CSS variables
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
          document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
          rafId = null;
        });
      }

      // Emit subtle glass sheen and grid illumination on movement
      setIsEmitting(true);

      // Smoothly dissolve glass sheen 450ms after motion ceases
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setIsEmitting(false);
      }, 450);
    };

    const handleMouseLeave = () => {
      setIsEmitting(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="glass-canvas-container" aria-hidden="true">
      {/* Permanent, ultra-subtle base smoked glass canvas depth */}
      <div className="glass-canvas-base" />

      {/* Optical glass specular reflection - glides smoothly with cursor */}
      <div className={`glass-specular-sheen ${isEmitting ? 'emitting' : ''}`} />

      {/* Crystalline glass grid - softly illuminates only around moving cursor */}
      <div className={`glass-grid-illumination ${isEmitting ? 'emitting' : ''}`} />
    </div>
  );
}
