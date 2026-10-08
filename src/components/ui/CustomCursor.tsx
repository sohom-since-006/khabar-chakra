'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Position references for smooth interpolation (lerp)
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable on desktop / fine-pointer devices and when user has not requested reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable or interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, select, textarea, [role="button"], [tabindex="0"], label, .cursor-pointer'
        );
        setIsHovering(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animationFrameId: number;

    const animate = () => {
      // Lerp ring towards mouse with smooth follow lag
      const ringSpeed = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringSpeed;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringSpeed;

      // Inner dot follows fast
      dotPos.current.x = mousePos.current.x;
      dotPos.current.y = mousePos.current.y;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Outer ambient glowing ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-4 -mt-4 rounded-full border pointer-events-none transition-[width,height,background-color,border-color] duration-200 ease-out flex items-center justify-center ${
          isClicking
            ? 'w-6 h-6 border-[#22B282] bg-[rgba(34,178,130,0.35)] shadow-[0_0_15px_rgba(34,178,130,0.5)]'
            : isHovering
            ? 'w-10 h-10 border-[#22B282] bg-[rgba(34,178,130,0.14)] shadow-[0_0_20px_rgba(34,178,130,0.35)] -ml-5 -mt-5'
            : 'w-8 h-8 border-[#22B282]/60 bg-[rgba(11,110,60,0.06)] dark:border-[#22B282]/80 dark:bg-[rgba(34,178,130,0.08)]'
        }`}
      />

      {/* Crisp inner botanical core point */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -ml-1 -mt-1 rounded-full pointer-events-none transition-transform duration-75 ${
          isHovering
            ? 'w-2.5 h-2.5 bg-[#FFC93C] -ml-1.25 -mt-1.25 shadow-[0_0_8px_#FFC93C]'
            : 'w-2 h-2 bg-[#22B282] dark:bg-[#34D399] shadow-[0_0_6px_rgba(34,178,130,0.6)]'
        }`}
      />
    </div>
  );
}
