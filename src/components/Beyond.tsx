import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Mic } from 'lucide-react';
import { BEYOND, JOURNEY, SPEAKING, formatDate } from '@/data/profile';
import { Marker, Reveal, Section, SectionHeader } from '@/components/zen/primitives';

/** The featured story: a photo and the moment behind it. */
const SpeakingStory: React.FC = () => (
  <Reveal>
    <article className="zen-tile grid overflow-hidden md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="relative bg-secondary">
        <img
          src={SPEAKING.photo}
          alt={SPEAKING.alt}
          width={360}
          height={450}
          loading="lazy"
          className="h-full max-h-[460px] w-full object-cover"
        />
        <span className="zen-pill absolute left-4 top-4 border-white/30 bg-black/45 text-white">
          <Mic className="h-3 w-3" /> {SPEAKING.org}
        </span>
      </div>
      <div className="flex flex-col p-6 md:p-10">
        <p className="zen-label text-primary">{SPEAKING.level}</p>
        <h2 className="mt-4 text-h1">
          <Marker>{SPEAKING.mark}</Marker> {SPEAKING.title}
        </h2>
        <p className="mt-5 max-w-xl text-lead text-muted-foreground">{SPEAKING.body}</p>
        <a
          href={SPEAKING.post}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          className="group mt-auto inline-flex items-center gap-2 pt-8 font-semibold text-primary"
        >
          Read the LinkedIn post
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  </Reveal>
);

/** Building in public: a vertical timeline, oldest first, each moment linking to its post. */
/** One moment: its dot fills and the text settles in as the reader reaches it (scroll-linked). */
const JourneyStop: React.FC<{ m: (typeof JOURNEY)[number]; last: boolean }> = ({ m, last }) => {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 50%'] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 });
  const fill = useTransform(p, [0.4, 1], [0, 1]);
  const opacity = useTransform(p, [0, 1], [0.3, 1]);
  const x = useTransform(p, [0, 1], [-10, 0]);
  return (
    <li ref={ref} className={`relative pl-7 md:pl-10 ${last ? '' : 'pb-10'}`}>
      <span aria-hidden className="absolute -left-[7px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-background">
        <motion.span className={`h-1.5 w-1.5 rounded-full ${last ? 'bg-highlight' : 'bg-primary'}`} style={{ scale: reduce ? 1 : fill }} />
      </span>
      <motion.div style={reduce ? undefined : { opacity, x }}>
        <a href={m.post} target="_blank" rel="noopener noreferrer" data-cursor="view" className="group block max-w-2xl">
          <p className="zen-label text-muted-foreground">
            <span className="text-primary">{formatDate(m.date)}</span> · {m.kind}
          </p>
          <p className="mt-1.5 font-display text-h3 transition-colors group-hover:text-primary">
            {m.title}
            <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
          <p className="mt-1 text-small text-muted-foreground">{m.body}</p>
        </a>
      </motion.div>
    </li>
  );
};

/** Building in public: the line draws as the reader scrolls through the moments. */
const Journey: React.FC = () => {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <Section id="journey" className="pt-0 md:pt-0">
      <SectionHeader title="Building *in public*" kicker="Every moment here has a public post behind it." />
      <ol ref={ref} className="relative ml-2 md:ml-4">
        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-border">
          <motion.span className="absolute inset-0 origin-top bg-primary" style={{ scaleY: reduce ? 1 : progress }} />
        </span>
        {JOURNEY.map((m, i) => (
          <JourneyStop key={m.post} m={m} last={i === JOURNEY.length - 1} />
        ))}
      </ol>
    </Section>
  );
};

/** Leadership, speaking and community: the part of a senior engineer a job card doesn't show. */
const Beyond: React.FC = () => (
  <>
    <Section id="speaking" className="pt-8 md:pt-10">
      <SpeakingStory />
    </Section>
    <Section id="beyond" className="pt-0 md:pt-0">
      <SectionHeader title="Also" />
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {BEYOND.map((b, i) => (
          <Reveal key={b.title} delay={0.05 * i} className="h-full">
            <div className="zen-tile h-full p-6">
              <p className="zen-label text-primary">{b.label}</p>
              <h3 className="mt-4 text-h3">{b.title}</h3>
              <p className="mt-2 text-muted-foreground">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
    <Journey />
  </>
);

export default Beyond;
