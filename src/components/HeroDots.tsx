import React, { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tint: string;
}

const LINK = 110; // px: dots closer than this get a faint line
const REACH = 150; // px: cursor influence radius

/**
 * Drifting constellation for the green hero: white dots wander, nearby dots link up,
 * and the cursor gently pushes them aside and draws lines to the closest ones.
 * 2D canvas (no three.js); paused off-screen; a still frame for reduced motion.
 */
const HeroDots: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let visible = true;
    let raf = 0;

    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(130, (w * h) / 5500));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.5,
        tint: Math.random() < 0.2 ? '191,243,194' : '255,255,255', // a few zen.100 dots
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!reduce) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH && dist > 0.1) {
            const push = (1 - dist / REACH) * 0.6;
            d.vx += (dx / dist) * push * 0.08;
            d.vy += (dy / dist) * push * 0.08;
          }
          d.vx *= 0.985;
          d.vy *= 0.985;
          // keep a minimum idle drift so the field never freezes
          if (Math.abs(d.vx) + Math.abs(d.vy) < 0.08) {
            d.vx += (Math.random() - 0.5) * 0.02;
            d.vy += (Math.random() - 0.5) * 0.02;
          }
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
          if (d.y < -10) d.y = h + 10;
          if (d.y > h + 10) d.y = -10;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(255,255,255,${(0.14 * (1 - dist / LINK)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < REACH) {
          ctx.strokeStyle = `rgba(255,255,255,${(0.35 * (1 - md / REACH)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (const d of dots) {
        ctx.fillStyle = `rgba(${d.tint},${d.a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    const ro = new ResizeObserver(() => {
      resize();
      restart();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) restart();
    });
    io.observe(canvas);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', restart);
    resize();
    restart();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', restart);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />;
};

export default HeroDots;
