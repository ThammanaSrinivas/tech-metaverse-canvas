import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Starfield from '@/components/Starfield';
import { useBrandTheme } from '@/theme/runtime';
import { MONOGRAM_PATH } from './monogramPath';

// ZenMode mark on a 1024 grid, traced from the app icon. Rounded via stroke-linejoin.
const MARK_POLYS = [
  '214,214 416,214 214,416',
  '810,810 607,810 810,607',
  '600.6,216 810,216 810,423.4 423.4,810 214,810 214,602.6',
];

export const MarkGlyph: React.FC<{ fill: string; hole?: string }> = ({ fill, hole }) => (
  <>
    {MARK_POLYS.map((p) => (
      <polygon key={p} points={p} fill={fill} stroke={fill} strokeWidth={80} strokeLinejoin="round" />
    ))}
    {hole && <circle cx={510} cy={510} r={40} fill={hole} />}
  </>
);

/** White mark on a brand-green tile. */
export const ZenMark: React.FC<{ size?: number; className?: string; title?: string }> = ({
  size = 32,
  className,
  title = 'ZenMode',
}) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} role="img" aria-label={title}>
    <rect width={1024} height={1024} rx={230} fill="#0F7A18" />
    <MarkGlyph fill="#FFFFFF" hole="#0F7A18" />
  </svg>
);

/** Personal "TS" monogram: palette primary tile, best-contrast letters. Follows the live palette. */
export const Monogram: React.FC<{ size?: number; className?: string; title?: string }> = ({
  size = 32,
  className,
  title = 'Thammana Srinivas',
}) => {
  const { monoTile, monoInk } = useBrandTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} role="img" aria-label={title}>
      <rect width={1024} height={1024} rx={230} fill={monoTile} />
      <path d={MONOGRAM_PATH} fill={monoInk} />
    </svg>
  );
};

/** Numbered section heading shared by every section: mono index chip, Clash title, hairline that draws in. */
export const SectionHeader: React.FC<{ index: string; title: string; kicker?: string }> = ({ index, title, kicker }) => {
  const reduce = useReducedMotion();
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center gap-4">
        <span className="zen-label rounded-lg border border-tint-line bg-tint px-2.5 py-1 text-primary">{index}</span>
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        <motion.span
          className="h-px flex-1 origin-left bg-border"
          aria-hidden
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {kicker && <p className="mt-3 max-w-2xl text-muted-foreground md:ml-[4.25rem]">{kicker}</p>}
    </div>
  );
};

/**
 * Counts the numeric part of a stat up from 0 when it scrolls into view: "40%", "10M+", "4.6", "#14".
 * Values without a leading number (e.g. "1h→1m") render as-is.
 */
export const CountUp: React.FC<{ value: string; className?: string; duration?: number }> = ({
  value,
  className,
  duration = 1.2,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  // Ranges like "1h→1m" or "50ms → 5ms" read wrong mid-count, so they stay static.
  const match = value.includes('→') ? null : value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[2]) : 0;
  const decimals = match?.[2].split('.')[1]?.length ?? 0;
  const [n, setN] = useState(reduce || !match ? target : 0);

  useEffect(() => {
    if (!inView || reduce || !match) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden>
        {match[1]}
        {n.toFixed(decimals)}
        {match[3]}
      </span>
    </span>
  );
};

/** Thin reading progress bar pinned under the nav, in the palette highlighter. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-highlight" style={{ scaleX }} aria-hidden />;
};

/** Fade-and-rise on first view; static when the user prefers reduced motion. */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Page section on the 1120px grid. `ink` makes it a full-bleed black band (as on zenmodeos.com):
 * the `dark` class re-scopes every design token inside, so children need no changes.
 */
export const Section: React.FC<{ id: string; children: React.ReactNode; className?: string; ink?: boolean }> = ({
  id,
  children,
  className = '',
  ink = false,
}) => {
  const inner = <div className={`relative mx-auto w-full max-w-[1120px] px-5 py-16 md:py-24 ${className}`}>{children}</div>;
  if (!ink) return <section id={id}>{inner}</section>;
  return (
    <section id={id} className="dark relative my-8 overflow-hidden bg-background text-foreground">
      <Starfield />
      {inner}
    </section>
  );
};
