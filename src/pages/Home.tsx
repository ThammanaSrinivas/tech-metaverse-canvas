import React, { Suspense } from 'react';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { LinkedText, Marker, Reveal } from '@/components/zen/primitives';
import { DIAGRAMS } from '@/components/diagrams';
import HeroSky from '@/components/HeroSky';
import PostList from '@/components/PostList';
import { POSTS } from '@/content/writing';
import { LINKS, PROFILE, SPEAKING, ZENMODE } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { HOME_META } from '@/site/meta';

// Home: who I am in plain sentences, on the night sky the site started with, next to one real
// thing I built, running. Then two pictures of life outside the day job, then the writing.
// What it avoids on purpose (see CLAUDE.md): badges, stat tiles, numbered labels, glows.

const Model = DIAGRAMS['admission-control'];
const SCHEDULER_POST = '/writing/scheduling-10m-cron-jobs';

/** A picture and two lines, the whole block one link. Images keep their real proportions. */
const Feature: React.FC<{ to: string; image: string; alt: string; aspect: string; meta: string; title: React.ReactNode; body: string; className?: string }> = ({
  to,
  image,
  alt,
  aspect,
  meta,
  title,
  body,
  className = '',
}) => (
  <Link to={to} className={`group block ${className}`}>
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
  const { now, zoho, own } = PROFILE.bio;
  return (
    <>
      <section data-ink-top className="dark relative overflow-hidden bg-background text-foreground">
        <HeroSky />
        {/* a soft shade behind the words so they read over the stars; not a coloured glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 80% at 22% 50%, hsl(var(--background) / .8), transparent 78%)' }}
        />
        <div className="relative mx-auto grid w-full max-w-[1120px] gap-12 px-5 pb-20 pt-32 md:pt-40 lg:grid-cols-2 lg:gap-16 lg:pb-28">
          <div>
            <h1 className="text-title">{PROFILE.name}</h1>
            <p className="mt-4 text-lead text-muted-foreground">{PROFILE.line}</p>
            <div className="mt-8 grid max-w-[62ch] gap-4">
              <p>
                <LinkedText text={now} />
              </p>
              <p>
                <LinkedText text={zoho.before} />
                <Marker delay={0.6}>{zoho.mark}</Marker>
                {zoho.after}
              </p>
              <p>
                <LinkedText text={own} />
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={LINKS.email} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground">
                <Mail className="h-4 w-4" /> Email me
              </a>
              <a
                href={LINKS.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-full border px-5 font-semibold transition-colors hover:border-foreground/40"
              >
                Résumé <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* the scheduler from the second paragraph, running */}
          <div className="lg:pt-2">
            <Suspense fallback={<div className="zen-card h-[420px]" aria-hidden />}>
              <Model className="mt-0" />
            </Suspense>
            <p className="mt-3 text-small text-muted-foreground">
              That scheduler, live: flip between before and after.{' '}
              <Link to={SCHEDULER_POST} className="zen-link inline-flex items-center gap-1 font-semibold text-foreground">
                How it works <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
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
              meta="Founder · open source"
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
