import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { JOBS, type Job } from '@/data/profile';
import { postFor } from '@/content/writing';
import { plain } from '@/lib/rich';
import { LinkedText } from '@/components/zen/primitives';

/** "**Lead-in.** The rest": the lead-in opens the paragraph in semibold, for readers who skim. */
const splitLead = (para: string) => {
  const m = para.match(/^\*\*(.+?)\*\*\s+/);
  return m ? { lead: m[1], text: para.slice(m[0].length) } : { lead: null, text: para };
};

const LAND = { type: 'spring', stiffness: 600, damping: 30 } as const;

/** One paragraph of a role, opening with its lead-in. (No marks on the rail: dots there mean dated events.) */
const Para: React.FC<{ para: string }> = ({ para }) => {
  const { lead, text } = splitLead(para);
  return (
    <p>
      {lead && <span className="font-semibold">{lead} </span>}
      <LinkedText text={text} />
    </p>
  );
};

/** "May 2025 – Present" on two lines, the end under the start. */
const Period: React.FC<{ period: string }> = ({ period }) => {
  const [from, to] = period.split(' – ');
  return (
    <p className="font-mono text-small tabular-nums text-muted-foreground md:sticky md:top-24 md:self-start md:pt-2">
      {to ? (
        <>
          {from} –<br />
          {to}
        </>
      ) : (
        period
      )}
    </p>
  );
};

/**
 * A role: dates in the margin (they stay in view while you read it), the story in prose. Its node
 * on the timeline fills as you arrive. The rail's indent (40px) + date column (160px) = the Chapter
 * margin (200px), so the story lines up with every chapter's content below it.
 */
const Role: React.FC<{ j: Job }> = ({ j }) => {
  const ref = useRef<HTMLElement>(null);
  const reached = useInView(ref, { once: true, margin: '100000px 0px -45% 0px' });
  const reduce = useReducedMotion();
  const post = j.writeup ? postFor(j.writeup) : undefined;
  return (
    <article ref={ref} className="relative grid gap-4 py-10 md:grid-cols-[160px_minmax(0,1fr)] md:gap-10 md:pl-10">
      {/* timeline node (desktop): an outlined dot that fills when the role scrolls into view */}
      <span aria-hidden className="absolute left-[-6px] top-[3.15rem] hidden h-3 w-3 items-center justify-center rounded-full border-2 border-primary bg-background md:flex">
        <motion.span
          className={`h-1.5 w-1.5 rounded-full ${j.current ? 'bg-highlight' : 'bg-primary'}`}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: reduce || reached ? 1 : 0 }}
          transition={LAND}
        />
      </span>
      <Period period={j.period} />
      <div className="max-w-[62ch]">
        <h2 className="text-h2">{j.company}</h2>
        <p className="mt-1 text-muted-foreground">{j.role}</p>
        <div className="mt-6 grid gap-5 md:text-lead">
          {j.story.map((para) => (
            <Para key={para.slice(0, 24)} para={para} />
          ))}
        </div>
        {post && (
          <Link to={`/writing/${post.slug}`} className="zen-link mt-5 inline-flex items-center gap-1.5 font-semibold">
            Read the write-up: {plain(post.title)} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {j.earlier && <p className="mt-5 text-small text-muted-foreground">Earlier: {j.earlier}</p>}
      </div>
    </article>
  );
};

/**
 * Each role as a few paragraphs of prose with the numbers inline, on a timeline whose line draws
 * itself as you read down (static under reduced motion).
 */
const WorkExperience: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });
  return (
    <section id="experience" className="mx-auto w-full max-w-[1120px] px-5 pb-8 pt-8">
      <div ref={ref} className="relative">
        <span aria-hidden className="absolute bottom-10 left-0 top-[3.5rem] hidden w-px bg-border md:block" />
        <motion.span
          aria-hidden
          className="absolute bottom-10 left-0 top-[3.5rem] hidden w-px origin-top bg-primary md:block"
          style={{ scaleY: reduce ? 1 : drawn }}
        />
        <div className="divide-y border-y md:border-y-0">
          {JOBS.map((j) => (
            <Role key={j.id} j={j} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;
