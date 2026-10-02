import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { JOBS, type Job } from '@/data/profile';
import { postFor } from '@/content/writing';
import { plain } from '@/lib/rich';

/** A role: dates in the margin, the story in prose. Its node on the timeline fills as you arrive. */
const Role: React.FC<{ j: Job }> = ({ j }) => {
  const ref = useRef<HTMLElement>(null);
  const reached = useInView(ref, { once: true, margin: '0px 0px -45% 0px' });
  const reduce = useReducedMotion();
  const post = j.writeup ? postFor(j.writeup) : undefined;
  return (
    <article ref={ref} className="relative grid gap-4 py-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 md:pl-10">
      {/* timeline node (desktop): an outlined dot that fills when the role scrolls into view */}
      <span aria-hidden className="absolute left-[-6px] top-[3.15rem] hidden h-3 w-3 items-center justify-center rounded-full border-2 border-primary bg-background md:flex">
        <motion.span
          className={`h-1.5 w-1.5 rounded-full ${j.current ? 'bg-highlight' : 'bg-primary'}`}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: reduce || reached ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        />
      </span>
      <p className="font-mono text-small text-muted-foreground md:pt-2">{j.period}</p>
      <div className="max-w-[68ch]">
        <h2 className="text-h2">{j.company}</h2>
        <p className="mt-1 text-muted-foreground">{j.role}</p>
        <div className="mt-5 grid gap-4">
          {j.story.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
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
