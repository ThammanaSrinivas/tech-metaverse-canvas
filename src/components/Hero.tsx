import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, FileText, Terminal } from 'lucide-react';
import { LINKS, PROFILE, ZENMODE, JOBS } from '@/data/profile';
import { MarkGlyph } from '@/components/zen/primitives';
import { emitZen } from '@/lib/zenEvents';
import HeroDots from './HeroDots';

// Faint grid of mark shapes that fades in from the left, echoing the ZenMode hero art.
const MarkPattern: React.FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    aria-hidden
    preserveAspectRatio="xMaxYMin slice"
    viewBox="0 0 1280 640"
  >
    <defs>
      <linearGradient id="hero-fade" x1="0" x2="1">
        <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id="hero-mask">
        <rect width="1280" height="640" fill="url(#hero-fade)" />
      </mask>
    </defs>
    <g mask="url(#hero-mask)" opacity="0.09">
     <g className="zen-drift">
      {Array.from({ length: 6 }).flatMap((_, row) =>
        Array.from({ length: 13 }).map((__, col) => (
          <g key={`${row}-${col}`} transform={`translate(${col * 128 - (row % 2) * 64} ${row * 128 - 40}) scale(0.1)`}>
            <MarkGlyph fill="#FFFFFF" />
          </g>
        ))
      )}
     </g>
    </g>
  </svg>
);

// The mark assembles from its three pieces on load.
const PIECES = [
  { points: '214,214 416,214 214,416', from: { x: -120, y: -120 } },
  { points: '810,810 607,810 810,607', from: { x: 120, y: 120 } },
  { points: '600.6,216 810,216 810,423.4 423.4,810 214,810 214,602.6', from: { x: 0, y: 0, scale: 0.6 } },
];

const AssemblingMark: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <svg width="64" height="64" viewBox="0 0 1024 1024" aria-hidden className="mb-8 overflow-visible">
      <rect width="1024" height="1024" rx="230" fill="#FFFFFF" />
      {PIECES.map((p, i) => (
        <motion.polygon
          key={p.points}
          points={p.points}
          fill="#0F7A18"
          stroke="#0F7A18"
          strokeWidth={80}
          strokeLinejoin="round"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={reduce ? false : { opacity: 0, ...p.from }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.circle cx={510} cy={510} r={40} fill="#FFFFFF"
        initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        transition={{ delay: 0.75, type: 'spring', stiffness: 300, damping: 12 }} />
    </svg>
  );
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const Widget: React.FC<{ label: string; children: React.ReactNode; delay: number; className?: string }> = ({
  label,
  children,
  delay,
  className = '',
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[22px] border border-white/15 bg-[#0B5C12]/55 p-5 ${className}`}
    >
      <p className="zen-label mb-3 text-white/60">{label}</p>
      {children}
    </motion.div>
  );
};

const Hero: React.FC = () => {
  const reduce = useReducedMotion();
  const now = JOBS.find((j) => j.current)!;
  const zoho = JOBS.find((j) => j.id === 'zoho')!;

  return (
    <section id="home" className="mx-auto w-full max-w-[1120px] px-5 pt-24">
      <div
        data-cursor-invert
        className="relative overflow-hidden rounded-[28px] text-white"
        style={{ background: 'radial-gradient(120% 90% at 90% 0%, #2AA136 0%, #0F7A18 45%, #0B5C12 100%)' }}
      >
        <MarkPattern />
        <HeroDots />
        <div className="relative grid gap-10 p-7 sm:p-10 md:grid-cols-[1.5fr_1fr] md:items-center md:p-14">
          <motion.div variants={stagger} initial={reduce ? false : 'hidden'} animate="show">
            <AssemblingMark />
            <motion.p variants={rise} className="zen-label mb-3 text-white/70">Hi, I'm</motion.p>
            <motion.h1 variants={rise} className="text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl">{PROFILE.name}</motion.h1>
            <motion.p variants={rise} className="mt-4 text-lg text-white/80 sm:text-xl">{PROFILE.tagline}</motion.p>

            <motion.div variants={rise} className="mt-6 flex flex-wrap gap-2">
              <span className="zen-pill border-white/25 bg-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-zen-300" /> SWE @ {now.company}
              </span>
              <span className="zen-pill border-white bg-white text-zen-700">Founder, ZenMode OS</span>
              <span className="zen-pill border-white/25 text-white/80">Open source</span>
            </motion.div>

            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-zen-700 transition-transform hover:-translate-y-0.5"
              >
                See my work <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={LINKS.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 font-semibold transition-colors hover:bg-white/10"
              >
                <FileText className="h-4 w-4" /> Resume
              </a>
              <button
                onClick={() => emitZen('shell')}
                className="hidden items-center gap-2 px-2 font-mono text-xs uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-white sm:inline-flex"
              >
                <Terminal className="h-3.5 w-3.5" /> press <kbd className="rounded border border-white/30 px-1.5">`</kbd> for zen shell
              </button>
            </motion.div>
          </motion.div>

          <div className="grid gap-3">
            <Widget label="Now" delay={0.15}>
              <p className="font-display text-2xl">{now.company}</p>
              <p className="text-sm text-white/70">
                {now.role} · since {now.period.split(' — ')[0]}
              </p>
            </Widget>
            <Widget label="Building" delay={0.25}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-2xl">ZenMode OS</p>
                  <p className="text-sm text-white/70">{ZENMODE.award}</p>
                </div>
                <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden className="shrink-0">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#FFC800" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="102 113" transform="rotate(-90 22 22)" />
                </svg>
              </div>
            </Widget>
            <Widget label="Previously" delay={0.35} className="hidden md:block">
              <p className="font-mono text-3xl">{zoho.stats[0].value}</p>
              <p className="text-sm text-white/70">{zoho.stats[0].label} at {zoho.company}</p>
            </Widget>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
        {PROFILE.intro}
      </p>
    </section>
  );
};

export default Hero;
