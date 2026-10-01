import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { JOBS, type Job } from '@/data/profile';
import { CountUp, Section, SectionHeader } from '@/components/zen/primitives';

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const [open, setOpen] = useState(false);
  const now = job.current;
  const panelId = `${job.id}-highlights`;

  return (
    <article className={`rounded-[22px] border p-5 md:p-6 ${now ? 'border-tint-line bg-tint' : 'bg-card'}`}>
      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:gap-6">
        <div className="flex flex-col">
          <span
            className={`zen-pill w-fit ${now ? 'border-tint-line bg-card text-primary' : 'bg-secondary text-muted-foreground'}`}
          >
            {now && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
            {now ? 'Now' : 'Previously'}
          </span>
          <h3 className="mt-5 text-h2">{job.company}</h3>
          <p className="mt-1 text-muted-foreground">{job.role}</p>
          <p className={`zen-label mt-3 ${now ? 'text-primary' : 'text-muted-foreground'}`}>{job.period}</p>
          {job.earlier && <p className="mt-2 text-xs text-muted-foreground">{job.earlier}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {job.stats.map((s) => (
            <div key={s.label} className={`rounded-[20px] border p-5 transition-transform duration-300 hover:-translate-y-1 ${now ? 'border-tint-line bg-card' : 'bg-secondary/60'}`}>
              <CountUp value={s.value} className={`block font-mono text-h2 ${now ? 'text-primary' : 'text-foreground'}`} />
              <p className="mt-4 font-medium">{s.label}</p>
              <p className="text-sm text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="zen-label mt-5 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? 'Hide highlights' : `${job.highlights.length} highlights`}
      </button>

      {open && (
        <ul id={panelId} className="mt-4 grid gap-3 md:grid-cols-2">
          {job.highlights.map((h) => (
            <li key={h.title} className="flex gap-3 rounded-2xl border bg-card p-4 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                <strong className="font-semibold">{h.title}</strong> <span className="text-muted-foreground">{h.body}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

/** Start year of a period like "May 2025 — Present". */
const startYear = (period: string) => period.match(/\d{4}/)?.[0] ?? '';

/**
 * One stop on the career rail: the card settles into focus as it reaches the reading line, and
 * its node on the rail fills and shows the start year. Scroll-linked, so it follows the reader's
 * own pace and never plays on its own.
 */
const Stop: React.FC<{ job: Job }> = ({ job }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 42%'] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 });
  const opacity = useTransform(p, [0, 1], [0.35, 1]);
  const y = useTransform(p, [0, 1], [28, 0]);
  const scale = useTransform(p, [0, 1], [0.975, 1]);
  const fill = useTransform(p, [0.55, 1], [0, 1]);
  const year = useTransform(p, [0.6, 1], [0, 1]);

  return (
    <div ref={ref} className="relative">
      {/* node + year on the rail (desktop) */}
      <div aria-hidden className="absolute -left-[50px] top-8 hidden flex-col items-center md:flex">
        <span className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background">
          <motion.span className="h-2 w-2 rounded-full bg-primary" style={{ scale: reduce ? 1 : fill }} />
        </span>
        {/* page-coloured backing masks the rail behind the year */}
        <motion.span className="mt-2 bg-background py-0.5 font-mono text-label text-muted-foreground" style={{ opacity: reduce ? 1 : year }}>
          {startYear(job.period)}
        </motion.span>
      </div>
      <motion.div style={reduce ? undefined : { opacity, y, scale, transformOrigin: 'left center' }}>
        <JobCard job={job} />
      </motion.div>
    </div>
  );
};

/** The rail itself: a hairline that draws as the reader moves down the career. */
const Rail: React.FC<{ progress: MotionValue<number> }> = ({ progress }) => {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="absolute bottom-10 left-[22px] top-10 hidden w-px bg-border md:block">
      <motion.div className="absolute inset-0 origin-top bg-primary" style={{ scaleY: reduce ? 1 : progress }} />
    </div>
  );
};

const WorkExperience: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <Section id="work" className="pt-8 md:pt-10">
      <SectionHeader title="Day job" />
      <div ref={ref} className="relative md:pl-16">
        <Rail progress={progress} />
        <div className="grid gap-4">
          {JOBS.map((job) => (
            <Stop key={job.id} job={job} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default WorkExperience;
