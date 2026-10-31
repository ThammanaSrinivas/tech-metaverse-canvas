import React, { Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { Chapter, EASE, FullStop, LinkedText, MaskWords, Marker, Reveal, Rich, maskStagger } from '@/components/zen/primitives';
import { DIAGRAMS } from '@/components/diagrams';
import HeroSky from '@/components/HeroSky';
import PostList from '@/components/PostList';
import { POSTS, minutesOf, postFor } from '@/content/writing';
import { LINKS, PROFILE, RECENT, SKY, SPEAKING, ZENMODE } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { emitZen } from '@/lib/zenEvents';
import { HOME_META } from '@/site/meta';

// Home, one job per section, on the site's chapter grid (a hairline, the chapter's name in the
// margin): who I am (hero), selected work (the scheduler, running), the night sky the site started
// with (a full screen of its own), life outside work, and the writing. What it avoids on purpose
// (see CLAUDE.md): badges, stat tiles, numbered labels, glows.

const Model = DIAGRAMS['admission-control'];
const SCHEDULER = postFor('scheduling-10m-cron-jobs');
const SCHEDULER_POST = '/writing/scheduling-10m-cron-jobs';
const MORE_POSTS = POSTS.filter((p) => p !== SCHEDULER);

/** The hero's entrance plays once per visit, not on every return to the home page. */
let heroPlayed = false;
/** When the full stop lands: after "Thammana", then "Srinivas", have risen (the logo's T, S, then the dot). */
const DOT_AT = 0.62;

/**
 * The first screen: the name on two lines like a title page, the line, one sentence, and a way to
 * reach me. The name and the line rise, then the orange full stop (the logo's dot) lands last, and
 * the header logo's dot lands with it. The sentence and the links are there from the start. Nothing
 * loops afterwards. Static under reduced motion.
 */
const Hero: React.FC = () => {
  const reduce = useReducedMotion();
  const [play] = useState(() => !reduce && !heroPlayed);
  useEffect(() => {
    heroPlayed = true;
    if (!play) return;
    const id = window.setTimeout(() => emitZen('dot'), DOT_AT * 1000);
    return () => window.clearTimeout(id);
  }, [play]);
  const [first, ...rest] = PROFILE.name.split(' ');
  const enter = (delay: number) =>
    play ? { initial: { y: '110%' }, animate: { y: 0 }, transition: { duration: 0.75, delay, ease: EASE } } : {};
  return (
    // a little shorter than the screen, so the first chapter's hairline peeks: there is more below
    <section className="mx-auto flex min-h-[88svh] w-full max-w-[1120px] flex-col justify-end px-5 pb-[10svh] pt-28">
      <motion.h1 className="-ml-[0.04em] text-display" variants={maskStagger} initial={play ? 'hidden' : false} animate="show">
        <MaskWords text={first} />
        <br />
        <MaskWords text={rest.join(' ')} />
        <FullStop land={play} delay={DOT_AT} />
      </motion.h1>
      <p className="mt-7 max-w-[24ch] overflow-hidden pb-[0.08em] font-display text-h2 font-medium">
        <motion.span className="block" {...enter(0.18)}>
          {PROFILE.line}
        </motion.span>
      </p>
      {/* the sentence a recruiter needs, and the ways to reach me, are there from the first frame */}
      <p className="mt-6 max-w-[54ch] text-lead text-muted-foreground">
        <LinkedText text={PROFILE.bio.intro} />
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
        <a
          href={LINKS.email}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform active:scale-[.98]"
        >
          <Mail aria-hidden className="h-4 w-4" /> Email me
        </a>
        {/* the two links wrap together, never one alone on a line */}
        <span className="flex items-center gap-x-6">
          <a href={LINKS.resume} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 font-semibold">
            Résumé <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 font-semibold">
            LinkedIn <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
        </span>
      </div>
    </section>
  );
};

/** The sky's title ends in the logo's dot, and the sky is born from it, one point at a time. */
const SkyBand: React.FC = () => {
  const dot = useRef<HTMLSpanElement>(null);
  const title = SKY.title.replace(/\.$/, '');
  return (
    <section className="dark relative overflow-hidden bg-background text-foreground" aria-labelledby="sky-title">
      <HeroSky bornFrom={dot} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(45% 55% at 50% 50%, hsl(var(--background) / .75), transparent 80%)' }}
      />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[880px] flex-col items-center justify-center px-5 py-24 text-center">
        <h2 id="sky-title" className="text-title">
          <Rich text={title} />
          <FullStop ref={dot} />
        </h2>
        <p className="mt-5 max-w-xl text-lead text-muted-foreground">{SKY.line}</p>
        <p className="mt-8 hidden text-small text-muted-foreground md:block">
          move your cursor · press <kbd>`</kbd> for the shell
        </p>
      </div>
    </section>
  );
};

/** A picture and two lines, the whole block one link. Images keep their real proportions. */
const Feature: React.FC<{ to: string; image: string; alt: string; aspect: string; meta: string; title: React.ReactNode; body: string }> = ({
  to,
  image,
  alt,
  aspect,
  meta,
  title,
  body,
}) => (
  <Link to={to} className="group block">
    <div className={`overflow-hidden rounded-[20px] border bg-secondary ${aspect}`}>
      <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
    </div>
    <p className="mt-4 text-small text-muted-foreground">{meta}</p>
    <h3 className="mt-1 text-h3 transition-colors group-hover:text-primary">{title}</h3>
    <p className="mt-2 max-w-md text-muted-foreground">{body}</p>
    <span className="mt-3 inline-flex items-center gap-1 font-semibold">
      More <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </span>
  </Link>
);

const Home: React.FC = () => {
  usePageMeta(HOME_META);
  const { zoho } = PROFILE.bio;
  return (
    <>
      <Hero />

      {/* Selected work: the scheduler as a case study. Headline, the story, then the model full width. */}
      <Chapter id="selected-work" label="Selected work" className="pt-0 md:pt-0">
        <Reveal>
          <p className="text-small text-muted-foreground">
            Zoho · Catalyst{SCHEDULER && ` · ${minutesOf(SCHEDULER)} min read`}
          </p>
          <h3 className="mt-2 max-w-3xl text-h1">
            <Link to={SCHEDULER_POST} className="transition-colors hover:text-primary">
              <Rich text={SCHEDULER?.title ?? 'Scheduling 10M cron jobs a day'} />
            </Link>
          </h3>
          <p className="mt-5 max-w-[60ch] text-lead">
            <LinkedText text={zoho.before} />
            <Marker delay={0.3}>{zoho.mark}</Marker>
            {zoho.after}
          </p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <Link to={SCHEDULER_POST} className="zen-link inline-flex items-center gap-1.5 font-semibold">
              Read the write-up <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-small text-muted-foreground">or flip between before and after, below</span>
          </div>
        </Reveal>
        <Reveal delay={0.06} className="mt-10">
          <Suspense fallback={<div className="zen-card h-[460px]" aria-hidden />}>
            <Model className="mt-0" />
          </Suspense>
        </Reveal>

        {/* the current role, smaller: what I shipped at PayPal most recently */}
        <Reveal className="mt-14 border-t pt-8">
          <p className="text-small text-muted-foreground">{RECENT.meta}</p>
          <h3 className="mt-2 text-h2">{RECENT.title}</h3>
          <p className="mt-3 max-w-[60ch]">{RECENT.body}</p>
          <Link to="/work#experience" className="zen-link mt-4 inline-flex items-center gap-1.5 font-semibold">
            More at PayPal <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Reveal>
      </Chapter>

      {/* The sky: the dots from the site's first hero, a full screen of their own. They follow the cursor. */}
      <SkyBand />

      <Chapter id="outside-work" label="Outside work">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-10">
          <Reveal>
            <Feature
              to="/zenmode"
              image="/zenmode-hero.webp"
              alt="ZenMode OS on a phone, with the tagline “Quiet the noise. Together.” and an invitation to create a ZenCircle with friends."
              aspect="aspect-[1094/647]"
              meta="Co-founder · open source"
              title="ZenMode OS"
              body={ZENMODE.teaser}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <Feature
              to="/about"
              image={SPEAKING.photo}
              alt={SPEAKING.alt}
              aspect="aspect-[4/5] max-w-[360px]"
              meta={`${SPEAKING.org} · ${SPEAKING.level}`}
              title={`${SPEAKING.mark} ${SPEAKING.title}`}
              body={SPEAKING.teaser}
            />
          </Reveal>
        </div>
      </Chapter>

      {/* the rest of the writing (the featured write-up is already above) */}
      {/* one entry reads as unfinished: the chapter waits for a second (it is all on /writing) */}
      {MORE_POSTS.length > 1 && (
        <Chapter id="writing" label="Writing">
          <Reveal>
            <PostList posts={MORE_POSTS} inChapter />
            <Link to="/writing" className="zen-link mt-6 inline-flex items-center gap-1.5 font-semibold">
              All writing <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </Chapter>
      )}
    </>
  );
};

export default Home;
