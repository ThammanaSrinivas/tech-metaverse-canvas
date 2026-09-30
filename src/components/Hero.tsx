import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, FileText, Terminal } from 'lucide-react';
import { LINKS, PROFILE, ZENMODE, JOBS } from '@/data/profile';
import { emitZen } from '@/lib/zenEvents';
import { useBrandTheme } from '@/theme/runtime';
import { MONOGRAM_PATH } from '@/components/zen/monogramPath';
import HeroSky from './HeroSky';

// The monogram pops in: tile springs up, then the letters settle.
const HeroMark: React.FC = () => {
  const reduce = useReducedMotion();
  const { monoTile, monoInk } = useBrandTheme();
  return (
    <svg width="64" height="64" viewBox="0 0 1024 1024" aria-hidden className="mb-8 overflow-visible">
      <motion.rect
        width="1024" height="1024" rx="230" fill={monoTile}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
      />
      <motion.path
        d={MONOGRAM_PATH} fill={monoInk}
        initial={reduce ? false : { opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
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
      className={`rounded-[22px] border border-white/10 bg-white/[0.04] p-5 ${className}`}
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
    <>
      <section
        id="home"
        className="dark relative flex min-h-[100svh] items-center overflow-hidden bg-background text-foreground"
      >
        <HeroSky />
        {/* keep the headline side a touch calmer than the sky around it */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{ background: 'radial-gradient(45% 55% at 25% 50%, hsl(var(--background) / .6), transparent 75%)' }}
        />
        <div className="relative mx-auto grid w-full max-w-[1120px] gap-10 px-5 pb-20 pt-28 md:grid-cols-[1.5fr_1fr] md:items-center">
          <motion.div variants={stagger} initial={reduce ? false : 'hidden'} animate="show">
            <HeroMark />
            <motion.p variants={rise} className="zen-label mb-3 text-primary">Hi, I'm</motion.p>
            <motion.h1 variants={rise} className="text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl">{PROFILE.name}</motion.h1>
            <motion.p variants={rise} className="mt-4 text-lg text-muted-foreground sm:text-xl">{PROFILE.tagline}</motion.p>

            <motion.div variants={rise} className="mt-6 flex flex-wrap gap-2">
              <span className="zen-pill border-white/15 bg-white/[0.04]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-highlight" /> SWE @ {now.company}
              </span>
              <span className="zen-pill border-tint-line bg-tint text-primary">Founder, ZenMode OS</span>
              <span className="zen-pill border-white/15 text-muted-foreground">Open source</span>
            </motion.div>

            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                data-magnet
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
              >
                See my work <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={LINKS.resume}
                target="_blank"
                rel="noopener noreferrer"
                data-magnet
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 font-semibold transition-colors hover:bg-white/5"
              >
                <FileText className="h-4 w-4" /> Resume
              </a>
              <button
                onClick={() => emitZen('shell')}
                className="hidden items-center gap-2 px-2 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                <Terminal className="h-3.5 w-3.5" /> press <kbd className="rounded border border-white/20 px-1.5">`</kbd> for zen shell
              </button>
            </motion.div>
          </motion.div>

          <div className="grid gap-3">
            <Widget label="Now" delay={0.15}>
              <p className="font-display text-2xl">{now.company}</p>
              <p className="text-sm text-muted-foreground">
                {now.role} · since {now.period.split(' — ')[0]}
              </p>
            </Widget>
            <Widget label="Building" delay={0.25}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-2xl">ZenMode OS</p>
                  <p className="text-sm text-muted-foreground">{ZENMODE.award}</p>
                </div>
                <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden className="shrink-0">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5" />
                  <circle cx="22" cy="22" r="18" fill="none" className="stroke-highlight" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="102 113" transform="rotate(-90 22 22)" />
                </svg>
              </div>
            </Widget>
            <Widget label="Previously" delay={0.35} className="hidden md:block">
              <p className="font-mono text-3xl text-primary">{zoho.stats[0].value}</p>
              <p className="text-sm text-muted-foreground">{zoho.stats[0].label} at {zoho.company}</p>
            </Widget>
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-2xl px-5 pt-16 text-center text-lg leading-relaxed text-muted-foreground">{PROFILE.intro}</p>
    </>
  );
};

export default Hero;
