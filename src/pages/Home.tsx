import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { useViewTransitionState } from 'react-router-dom';
import { Link, POST_TITLE } from '@/components/zen/Link';
import { Chapter, DOT_AT, FullStop, LinkedText, MaskWords, Marker, Picture, Reveal, Rich, WORD_STAGGER } from '@/components/zen/primitives';
import { DIAGRAMS } from '@/components/diagrams';
import HeroSky from '@/components/HeroSky';
import PostList from '@/components/PostList';
import { POSTS, minutesOf, postFor } from '@/content/writing';
import { LINKS, PROFILE, RECENT, SKY, SPEAKING, ZENMODE } from '@/data/profile';
import { prefersReducedMotion, useFromServer } from '@/lib/hydration';
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

/**
 * The first screen: the name on two lines like a title page, the line, one sentence, and a way to
 * reach me. The name and the line rise, then the orange full stop (the logo's dot) lands last
 * (DOT_AT: after "Thammana", then "Srinivas", have risen: the logo's T, S, then the dot), and the
 * header logo's dot lands with it. The sentence and the links are there from the start. Nothing
 * loops afterwards. The entrance is CSS, so on a first visit it plays from the page's HTML, before
 * the app has loaded; under reduced motion it is static (index.css).
 *
 * On wide screens the paper to the right of the text was empty, so the portrait stands there, its
 * foot level with the links (the owner picked it over a 3D mark from a three-way mock). It is
 * placed over the layout, not in it: the name and the text sit exactly where they did, and phones,
 * where the name fills the width, keep the page without it (and never fetch it: Picture `media`).
 */
const Hero: React.FC = () => {
  const [play] = useState(() => !heroPlayed);
  // in the page's HTML the header's dot lands by itself (Navigation); after a link, it needs the event
  const fromServer = useFromServer();
  useEffect(() => {
    heroPlayed = true;
    if (!play || fromServer || prefersReducedMotion()) return;
    const id = window.setTimeout(() => emitZen('dot'), DOT_AT * 1000);
    return () => window.clearTimeout(id);
  }, [play, fromServer]);
  const [first, ...rest] = PROFILE.name.split(' ');
  return (
    // a little shorter than the screen, so the first chapter's hairline peeks: there is more below
    <section className="mx-auto flex min-h-[88svh] w-full max-w-[1120px] flex-col justify-end px-5 pb-[8svh] pt-24">
      {/* as the page scrolls on, the title page steps back (index.css, .zen-recede) */}
      <div className="zen-recede relative">
        <h1 className="zen-poster -ml-[0.05em]">
          <MaskWords text={first} rise={play} />
          <br />
          <MaskWords text={rest.join(' ')} rise={play} delay={WORD_STAGGER} />
          <FullStop land={play} delay={DOT_AT} />
        </h1>
        <p className="mt-7 max-w-[24ch] overflow-hidden pb-[0.08em] font-display text-h2 font-medium">
          <span className={`block ${play ? 'zen-rise' : ''}`} style={play ? { animationDelay: '0.18s' } : undefined}>
            {PROFILE.line}
          </span>
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
        <div className="absolute bottom-0 right-0 hidden w-[clamp(13rem,20vw,19rem)] lg:block">
          <Picture
            src={PROFILE.portraitHero}
            media="(min-width: 1024px)"
            alt={PROFILE.name}
            width={384}
            height={480}
            decoding="async"
            frame="aspect-[4/5]"
            className="h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

/** The sky's title ends in the logo's dot, and the sky is born from it, one point at a time. */
const SkyBand: React.FC = () => {
  const dot = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLElement>(null);
  const title = SKY.title.replace(/\.$/, '');
  return (
    // The band is taller than the screen and the sky is pinned inside it (sticky, never fixed): the
    // extra scroll first carries the sky's birth, then flies the camera through the stars (HeroSky
    // `flight`), so the band holds still until the sky is whole. Under reduced motion it is one
    // screen tall and nothing pins. `overflow: clip` on the pinned box: `hidden` would unpin it.
    <section ref={track} className="dark relative bg-background text-foreground motion-safe:h-[280svh]" aria-labelledby="sky-title">
      <div className="sticky top-0 flex min-h-[100svh] flex-col justify-center overflow-clip">
        <HeroSky bornFrom={dot} flight={track} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(45% 55% at 50% 50%, hsl(var(--background) / .75), transparent 80%)' }}
        />
        <div className="relative mx-auto flex max-w-[980px] flex-col items-center px-5 py-24 text-center">
          <h2 id="sky-title" className="text-display">
            <Rich text={title} />
            <FullStop ref={dot} />
          </h2>
          <p className="mt-6 max-w-xl text-lead text-muted-foreground">{SKY.line}</p>
          <p className="mt-8 hidden text-small text-muted-foreground md:block">
            scroll to fly through it · move your cursor · press <kbd>`</kbd> for the shell
          </p>
        </div>
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
    <Picture src={image} alt={alt} loading="lazy" frame={aspect} className="h-full object-cover" />
    <p className="mt-5 text-small text-muted-foreground">{meta}</p>
    <h3 className="mt-1 w-fit text-h2">
      <span className="zen-draw">{title}</span>
    </h3>
    <p className="mt-3 max-w-md text-muted-foreground">{body}</p>
    <span className="mt-4 inline-flex items-center gap-1.5 font-semibold">
      More <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
    </span>
  </Link>
);

const Home: React.FC = () => {
  usePageMeta(HOME_META);
  const { zoho } = PROFILE.bio;
  const opening = useViewTransitionState(SCHEDULER_POST);
  return (
    <>
      <Hero />

      {/* Selected work: the scheduler as a case study. Headline, the story, then the model full width. */}
      <Chapter id="selected-work" label="Selected work" className="pt-0 md:pt-0">
        <Reveal>
          <p className="text-small text-muted-foreground">
            Zoho · Catalyst{SCHEDULER && ` · ${minutesOf(SCHEDULER)} min read`}
          </p>
          {/* opening the write-up, this headline travels to the article's title (POST_TITLE) */}
          <h3 className="mt-3 w-fit max-w-3xl text-title" style={opening ? POST_TITLE : undefined}>
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
          <div>
            <Feature
              to="/zenmode"
              image="/zenmode-hero.webp"
              alt="ZenMode OS on a phone, with the tagline “Quiet the noise. Together.” and an invitation to create a ZenCircle with friends."
              aspect="aspect-[1094/647]"
              meta="Co-founder · open source"
              title="ZenMode OS"
              body={ZENMODE.teaser}
            />
          </div>
          <div>
            <Feature
              to="/about"
              image={SPEAKING.photo}
              alt={SPEAKING.alt}
              aspect="aspect-[4/5] max-w-[360px]"
              meta={`${SPEAKING.org} · ${SPEAKING.level}`}
              title={`${SPEAKING.mark} ${SPEAKING.title}`}
              body={SPEAKING.teaser}
            />
          </div>
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
