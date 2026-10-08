'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'leaf' | 'mote' | 'petal';
}

export function LiveDynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create organic particles (leaves, light motes, botanical specks)
    const particleCount = 28;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 6,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        opacity: Math.random() * 0.25 + 0.12,
        type: i % 3 === 0 ? 'leaf' : i % 3 === 1 ? 'mote' : 'petal',
      });
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = motionQuery.matches;

    // Draw single frame of gentle static elements for reduced-motion users
    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'leaf') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
          ctx.fillStyle = '#227B4E';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.85);
          ctx.lineTo(0, p.size * 0.85);
          ctx.strokeStyle = '#175E3B';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else if (p.type === 'mote') {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.8);
          gradient.addColorStop(0, 'rgba(255, 218, 128, 0.45)');
          gradient.addColorStop(1, 'rgba(64, 160, 96, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.8, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#68AA7E';
          ctx.fill();
        }
        ctx.restore();
      });
    };

    if (prefersReducedMotion) {
      drawParticles();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Render loop for motion-enabled users
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(p.y * 0.005) * 0.5 + p.speedX;
        p.rotation += p.rotationSpeed;

        // Reset if drifted past top
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'leaf') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
          ctx.fillStyle = '#227B4E';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.85);
          ctx.lineTo(0, p.size * 0.85);
          ctx.strokeStyle = '#175E3B';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else if (p.type === 'mote') {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.8);
          gradient.addColorStop(0, 'rgba(255, 218, 128, 0.45)');
          gradient.addColorStop(1, 'rgba(64, 160, 96, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.8, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#68AA7E';
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
