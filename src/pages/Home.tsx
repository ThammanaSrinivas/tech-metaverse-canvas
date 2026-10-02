import React, { Suspense } from 'react';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { LinkedText, Marker } from '@/components/zen/primitives';
import { DIAGRAMS } from '@/components/diagrams';
import PostList from '@/components/PostList';
import { POSTS } from '@/content/writing';
import { LINKS, PROFILE } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { HOME_META } from '@/site/meta';

// Home says who I am in plain sentences and shows one real thing I built, running. Everything
// else is a link away. No badges, stat tiles or glows: the work is the proof.

const Model = DIAGRAMS['admission-control'];
const SCHEDULER_POST = '/writing/scheduling-10m-cron-jobs';

const Home: React.FC = () => {
  usePageMeta(HOME_META);
  const { now, zoho, own } = PROFILE.bio;
  return (
    <>
      <section className="mx-auto grid w-full max-w-[1120px] gap-12 px-5 pb-16 pt-32 md:pt-40 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1 className="text-title">{PROFILE.name}</h1>
          <p className="mt-4 text-lead text-muted-foreground">{PROFILE.line}</p>
          <div className="mt-8 grid max-w-[62ch] gap-4">
            <p>
              <LinkedText text={now} />
            </p>
            <p>
              <LinkedText text={zoho.before} />
              <Marker delay={0.4}>{zoho.mark}</Marker>
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
      </section>

      {POSTS.length > 0 && (
        <section className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-8">
          <h2 className="mb-6 text-h2">Writing</h2>
          <PostList posts={POSTS} />
        </section>
      )}
    </>
  );
};

export default Home;
