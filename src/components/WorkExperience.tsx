import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { JOBS, type Job } from '@/data/profile';
import { CountUp, Reveal, Section, SectionHeader } from '@/components/zen/primitives';

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
          <h3 className="mt-5 text-4xl">{job.company}</h3>
          <p className="mt-1 text-muted-foreground">{job.role}</p>
          <p className={`zen-label mt-3 ${now ? 'text-primary' : 'text-muted-foreground'}`}>{job.period}</p>
          {job.earlier && <p className="mt-2 text-xs text-muted-foreground">{job.earlier}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {job.stats.map((s) => (
            <div key={s.label} className={`rounded-[20px] border p-5 transition-transform duration-300 hover:-translate-y-1 ${now ? 'border-tint-line bg-card' : 'bg-secondary/60'}`}>
              <CountUp value={s.value} className={`block font-mono text-4xl md:text-[2.75rem] ${now ? 'text-primary' : 'text-foreground'}`} />
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

const WorkExperience: React.FC = () => (
  <Section id="work">
    <SectionHeader index="02" title="Day job" kicker="Platforms that quietly run at scale." />
    <div className="grid gap-4">
      {JOBS.map((job, i) => (
        <Reveal key={job.id} delay={0.08 * i}>
          <JobCard job={job} />
        </Reveal>
      ))}
    </div>
  </Section>
);

export default WorkExperience;
