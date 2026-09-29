import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useStarsEnabled } from '@/lib/stars';

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number; // 0.2 (far) … 1 (near): scales drift and parallax
  phase: number;
  speed: number;
  color: string;
}

// Mostly paper-white, a few zen greens, one or two amber: the brand pairing budget, as a sky.
const pickColor = () => {
  const roll = Math.random();
  if (roll < 0.04) return '255,200,0';
  if (roll < 0.16) return '91,223,98';
  return '245,245,241';
};

/**
 * Quiet night sky. `page`: fixed behind the whole site, dark theme only, with scroll
 * parallax. `band`: fills its (positioned) parent, any theme, for the ink sections.
 * Static for reduced-motion users; paused while the tab is hidden or off-screen.
 */
const Starfield: React.FC<{ mode?: 'page' | 'band' }> = ({ mode = 'page' }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [enabled] = useStarsEnabled();
  const active = enabled && (mode === 'band' || theme === 'dark');

  useEffect(() => {
    const canvas = ref.current;
    if (!active || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const host = mode === 'band' ? canvas.parentElement! : null;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let visible = true;

    const resize = () => {
      w = host ? host.clientWidth : window.innerWidth;
      h = host ? host.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(mode === 'band' ? 220 : 160, (w * h) / 9000));
      stars = Array.from({ length: count }, () => {
        const depth = 0.2 + Math.random() * 0.8;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.35 + depth * 1.1,
          depth,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          color: pickColor(),
        };
      });
    };

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = mode === 'page' ? window.scrollY : 0;
      for (const s of stars) {
        const twinkle = reduce ? 0.8 : 0.55 + 0.45 * Math.sin((t / 1000) * s.speed + s.phase);
        // Drift upward very slowly; nearer stars move more with scroll.
        const y = (((s.y - scroll * 0.08 * s.depth - (reduce ? 0 : t * 0.004 * s.depth)) % h) + h) % h;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.color},${(twinkle * (0.35 + s.depth * 0.5)).toFixed(3)})`;
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      resize();
      restart();
    });
    ro.observe(host ?? document.documentElement);
    // Bands only animate while on screen.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) restart();
    });
    io.observe(canvas);
    const onScroll = () => reduce && mode === 'page' && draw(0);

    resize();
    restart();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', restart);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', restart);
    };
  }, [active, mode]);

  if (!active) return null;
  return (
    <canvas
      ref={ref}
      className={`pointer-events-none ${mode === 'page' ? 'fixed inset-0 -z-10' : 'absolute inset-0'}`}
      aria-hidden
    />
  );
};

export default Starfield;
