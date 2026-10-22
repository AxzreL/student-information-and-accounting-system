'use client';

import React, { useEffect, useState } from 'react';

/**
 * High-performance cursor ambient spotlight
 * Tracks cursor position and updates CSS variables for smooth 60/120fps hardware-accelerated shine
 */
export default function CursorGlow() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch gestures
      if (e.pointerType === 'touch') return;

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        rafId = null;
      });

      if (!active) {
        setActive(true);
      }
    };

    const handleMouseLeave = () => {
      setActive(false);
    };

    const handleMouseEnter = () => {
      setActive(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [active]);

  return (
    <div
      className={`cursor-spotlight ${active ? 'active' : ''}`}
      aria-hidden="true"
    />
  );
}
