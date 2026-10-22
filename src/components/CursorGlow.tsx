'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Ambient background light that strictly sits on the background canvas
 * and emits a soft luminescence only when the cursor is in motion.
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

      // Emit light on movement
      setIsEmitting(true);

      // Reset timer: fade light out smoothly 550ms after motion ceases
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setIsEmitting(false);
      }, 550);
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
    <div
      className={`cursor-bg-spotlight ${isEmitting ? 'emitting' : ''}`}
      aria-hidden="true"
    />
  );
}
