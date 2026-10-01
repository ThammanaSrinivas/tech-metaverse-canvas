import React from 'react';
import { Link } from '@/components/zen/Link';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import Hero from '@/components/Hero';
import { Reveal, Rich, SectionHeader } from '@/components/zen/primitives';
import { LINKS, PROFILE } from '@/data/profile';
import { PAGES, type PageId } from '@/site/pages';
import { BRAND } from '@/theme/palettes';
import { usePageMeta } from '@/lib/usePageMeta';

// Home is the index: who I am (hero), what I stand for (values), and doors to every page.
// Details live on their own pages, the way zenmodeos.com splits product, story and docs.

const page = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** One door to a page. `ink` tiles are dark; `art` sits behind the text. */
const Door: React.FC<{ id: PageId; className?: string; ink?: boolean; art?: React.ReactNode }> = ({ id, className = '', ink, art }) => {
  const p = page(id);
  return (
    <Link
      to={p.path}
      data-cursor="open"
      className={`zen-tile group relative flex min-h-[240px] flex-col overflow-hidden p-6 md:p-7 ${
        ink ? 'dark border-transparent bg-background text-foreground' : ''
      } ${className}`}
    >
      {art}
      <div className="relative flex items-center justify-between">
        <span className="zen-label text-muted-foreground">
          <span className="text-primary">{p.index}</span> · {p.label}
        </span>
        <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-card transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
      <div className={`relative mt-auto pt-10 ${art && id === 'zenmode' ? 'lg:max-w-[42%]' : art && id === 'beyond' ? 'lg:max-w-[52%]' : ''}`}>
        <p className="font-mono text-small text-primary">{p.proof}</p>
        <h3 className="mt-2 text-h2">
          <Rich text={p.title} />
        </h3>
        <p className="mt-2 max-w-md text-small text-muted-foreground">{p.lead}</p>
      </div>
    </Link>
  );
};

/** A static scatter of brand-coloured dots: a teaser for /explore, not the sky itself. */
const DotsArt = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
    style={{
      backgroundImage: [
        'radial-gradient(circle at 20% 30%, hsl(var(--foreground)) 0 1px, transparent 1.5px)',
        'radial-gradient(circle at 70% 20%, hsl(var(--primary)) 0 1.5px, transparent 2px)',
        'radial-gradient(circle at 45% 65%, hsl(var(--highlight)) 0 1.5px, transparent 2px)',
        'radial-gradient(circle at 85% 70%, hsl(var(--foreground) / .6) 0 1px, transparent 1.5px)',
      ].join(','),
      backgroundSize: '53px 47px, 89px 71px, 113px 97px, 37px 41px',
    }}
  />
);

const Home: React.FC = () => {
  usePageMeta(null, PROFILE.intro);
  return (
    <>
      <Hero />

      {/* What I stand for: the three brand values, each with the proof behind it. */}
      <section className="mx-auto w-full max-w-[1120px] px-5 py-20 md:py-28">
        <Reveal>
          <p className="max-w-4xl font-display text-h1">
            <Rich text="I build cloud platforms by day and a *calmer phone* by night." />
            <span className="text-muted-foreground"> Three things show up in all of it.</span>
          </p>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[22px] border bg-border md:grid-cols-3">
          {BRAND.values.map((v, i) => (
            <Reveal key={v.name} delay={0.08 * i} className="h-full">
              <div className="flex h-full flex-col bg-card p-6 md:p-7">
                <span className="zen-label text-muted-foreground">0{i + 1}</span>
                <h2 className="mt-6 text-h3">{v.name}</h2>
                <p className="mt-2 text-muted-foreground">{v.means}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Doors to every page. */}
      <section className="mx-auto w-full max-w-[1120px] px-5 pb-20 md:pb-28">
        <SectionHeader title="Where to *next*" />
        <div className="grid gap-3 md:grid-cols-6 md:gap-4">
          <Reveal className="md:col-span-4">
            <Door
              id="zenmode"
              className="h-full md:min-h-[360px]"
              art={
                <img
                  src="/zenmode-hero.webp"
                  alt=""
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-6 -right-10 hidden w-[56%] rounded-2xl border shadow-2xl transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.02] lg:block"
                />
              }
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.05}>
            <Door id="work" className="h-full" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.05}>
            <Door
              id="beyond"
              className="h-full md:min-h-[300px]"
              art={
                <img
                  src="/beyond/toastmasters-club-win.webp"
                  alt=""
                  loading="lazy"
                  className="pointer-events-none absolute -right-4 bottom-0 hidden h-[86%] rounded-t-2xl border object-cover shadow-xl transition-transform duration-700 group-hover:-translate-y-1 lg:block"
                />
              }
            />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.05}>
            <Door id="lab" className="h-full md:min-h-[300px]" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.1}>
            <Door id="time-machine" ink className="h-full" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.15}>
            <Door id="explore" ink className="h-full" art={<DotsArt />} />
          </Reveal>
        </div>
      </section>

      {/* Contact band. */}
      <section className="mx-auto w-full max-w-[1120px] px-5 pb-16">
        <Reveal>
          <div className="dark relative overflow-hidden rounded-[28px] bg-background p-8 text-foreground md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(50% 80% at 100% 0%, hsl(var(--primary) / .22), transparent 70%)' }}
            />
            <p className="relative zen-label text-primary">Open to conversations</p>
            <p className="relative mt-4 max-w-3xl font-display text-h1">
              <Rich text="Building something that has to *scale*? Let’s talk." />
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <a
                href={LINKS.email}
                data-magnet
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
              >
                <Mail className="h-4 w-4" /> Email me
              </a>
              <Link
                to="/contact"
                data-magnet
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 font-semibold transition-colors hover:bg-white/5"
              >
                All the ways <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
