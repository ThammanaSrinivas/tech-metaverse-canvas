import React, { useEffect, useRef } from 'react';
import { useStarsEnabled } from '@/lib/stars';
import { useBrandTheme } from '@/theme/runtime';
import { toRgb } from '@/theme/color';

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number; // 0.2 (far) … 1 (near): scales drift and parallax
  phase: number;
  speed: number;
  color: string;
}

/**
 * Quiet night sky for the ink sections: fills its (positioned) parent. Static for
 * reduced-motion users; paused while the tab is hidden or off-screen.
 */
const Starfield: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [active] = useStarsEnabled();
  const { sky } = useBrandTheme();
  const [bright, primary, , highlight] = sky;

  useEffect(() => {
    const canvas = ref.current;
    if (!active || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mostly the bright neutral, some primary, a rare highlighter star.
    const tones = [bright, primary, highlight].map((h) => toRgb(h).join(','));
    const pickColor = () => {
      const roll = Math.random();
      return roll < 0.04 ? tones[2] : roll < 0.16 ? tones[1] : tones[0];
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const host = canvas.parentElement!;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let visible = true;

    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(220, (w * h) / 9000));
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
      for (const s of stars) {
        const twinkle = reduce ? 0.8 : 0.55 + 0.45 * Math.sin((t / 1000) * s.speed + s.phase);
        // Drift upward very slowly; nearer stars move faster.
        const y = (((s.y - (reduce ? 0 : t * 0.004 * s.depth)) % h) + h) % h;
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
    ro.observe(host);
    // Only animate while on screen.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) restart();
    });
    io.observe(canvas);

    resize();
    restart();
    document.addEventListener('visibilitychange', restart);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', restart);
    };
  }, [active, bright, primary, highlight]);

  if (!active) return null;
  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    />
  );
};

export default Starfield;
