import React, { Suspense } from 'react';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { LinkedText, Marker, Reveal, Rich } from '@/components/zen/primitives';
import { DIAGRAMS } from '@/components/diagrams';
import HeroSky from '@/components/HeroSky';
import PostList from '@/components/PostList';
import { POSTS } from '@/content/writing';
import { LINKS, PROFILE, SKY, SPEAKING, ZENMODE } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { HOME_META } from '@/site/meta';

// Home, one job per section: who I am (hero), one real thing I built, running (the scheduler),
// the night sky the site started with (a full screen of its own), life outside the day job, and
// the writing. What it avoids on purpose (see CLAUDE.md): badges, stat tiles, numbered labels, glows.

const Model = DIAGRAMS['admission-control'];
const SCHEDULER_POST = '/writing/scheduling-10m-cron-jobs';

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
  const { intro, zoho } = PROFILE.bio;
  return (
    <>
      {/* Hero: name, one line, one sentence, two ways to reach me. Nothing else competes. */}
      <section className="mx-auto flex min-h-[92svh] w-full max-w-[1120px] flex-col justify-center px-5 pb-16 pt-28">
        <h1 className="text-display">
          {PROFILE.name}
          {/* the logo's orange dot, as a full stop: things get finished */}
          <span className="text-highlight">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-h3 font-normal text-muted-foreground">{PROFILE.line}</p>
        <p className="mt-6 max-w-[56ch] text-lead">
          <LinkedText text={intro} />
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href={LINKS.email} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
            <Mail className="h-4 w-4" /> Email me
          </a>
          <a
            href={LINKS.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-1.5 rounded-full border px-6 font-semibold transition-colors hover:border-foreground/40"
          >
            Résumé <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* One real thing I built, running, with the paragraph that explains it. */}
      <section id="scheduler" className="mx-auto grid w-full max-w-[1120px] gap-10 px-5 py-16 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <Reveal>
          <h2 className="text-h2">The scheduler, live</h2>
          <p className="mt-5 max-w-[56ch]">
            <LinkedText text={zoho.before} />
            <Marker delay={0.3}>{zoho.mark}</Marker>
            {zoho.after}
          </p>
          <p className="mt-4 max-w-[56ch] text-muted-foreground">Flip between before and after: same workers, same jobs, one if.</p>
          <Link to={SCHEDULER_POST} className="zen-link mt-6 inline-flex items-center gap-1.5 font-semibold">
            How it works <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <Suspense fallback={<div className="zen-card h-[420px]" aria-hidden />}>
            <Model className="mt-0" />
          </Suspense>
        </Reveal>
      </section>

      {/* The sky: the dots from the site's first hero, a full screen of their own. They follow the cursor. */}
      <section className="dark relative overflow-hidden bg-background text-foreground">
        <HeroSky />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(45% 55% at 50% 50%, hsl(var(--background) / .75), transparent 80%)' }}
        />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[880px] flex-col items-center justify-center px-5 py-24 text-center">
          <h2 className="text-title">
            <Rich text={SKY.title} />
          </h2>
          <p className="mt-5 max-w-xl text-lead text-muted-foreground">{SKY.line}</p>
          <p className="mt-8 hidden font-mono text-small text-muted-foreground md:block">move your cursor · press ` for the shell</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1120px] px-5 py-16 md:py-24">
        <Reveal>
          <h2 className="mb-8 text-h2">Outside the day job</h2>
        </Reveal>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-10">
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
      </section>

      {POSTS.length > 0 && (
        <section className="mx-auto w-full max-w-[1120px] px-5 pb-12">
          <Reveal>
            <h2 className="mb-6 text-h2">Writing</h2>
            <PostList posts={POSTS} />
          </Reveal>
        </section>
      )}
    </>
  );
};

export default Home;
