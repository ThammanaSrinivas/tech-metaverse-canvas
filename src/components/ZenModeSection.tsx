import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { LINKS, ZENMODE } from '@/data/profile';
import { Chapter, Marker } from '@/components/zen/primitives';

type IconKind = (typeof ZENMODE.features)[number]['icon'];

const EASE = [0.22, 1, 0.36, 1] as const;

// Small glyphs in the site's primary. Two play their idea once as they scroll in (the score ring
// fills, the circle gathers); the flame and the coin are still. All static under reduced motion.
const FeatureIcon: React.FC<{ kind: IconKind }> = ({ kind }) => {
  const reduce = useReducedMotion();
  const view = { once: true, margin: '-40px' } as const;
  if (kind === 'score')
    return (
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" className="stroke-border" strokeWidth="5" />
        <motion.circle cx="20" cy="20" r="15" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round"
          transform="rotate(-90 20 20)"
          initial={{ pathLength: reduce ? 0.7 : 0 }} whileInView={reduce ? undefined : { pathLength: 0.7 }} viewport={view}
          transition={{ duration: 1.4, ease: EASE }} />
      </svg>
    );
  if (kind === 'streak')
    return (
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
        <path className="fill-primary" d="M20 4c2 9 13 13 13 24a13 13 0 0 1-26 0c0-7 5-11 7-16 2 5 4 7 6 7-1-5-2-10 0-15Z" />
      </svg>
    );
  if (kind === 'circle')
    return (
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden className="fill-primary">
        {[
          { cx: 12, cy: 25, o: 0.55, from: [-8, 6] },
          { cx: 28, cy: 25, o: 0.8, from: [8, 6] },
          { cx: 20, cy: 13, o: 1, from: [0, -8] },
        ].map((c, i) => (
          <motion.circle key={i} cx={c.cx} cy={c.cy} r="9" opacity={c.o}
            initial={reduce ? false : { x: c.from[0], y: c.from[1], scale: 0.4 }} whileInView={reduce ? undefined : { x: 0, y: 0, scale: 1 }}
            viewport={view} transition={{ duration: 0.7, delay: 0.1 * i, ease: EASE }} />
        ))}
      </svg>
    );
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="16" className="fill-primary" />
      <circle cx="20" cy="20" r="10.5" fill="none" className="stroke-background" strokeOpacity=".6" strokeWidth="2" />
    </svg>
  );
};

/** A number in running prose: mono, fixed-width digits, so figures read as data. */
// in a sentence, numbers keep the body face (mono's full-width period read "4 . 6"); tabular figures, semibold
const Num: React.FC<{ children: string }> = ({ children }) => <span className="font-semibold tabular-nums">{children}</span>;

/** "a 4.6★ rating from 24 reviews" → the figures (4.6★, 24, #14, 711, 1K+) set in mono, the words between them not. */
const Figures: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(#\d+|\d+(?:\.\d+)?(?:K\+|★)?)/).map((part, i) =>
      i % 2 ? <Num key={i}>{part}</Num> : <React.Fragment key={i}>{part}</React.Fragment>
    )}
  </>
);

/** The product: the screenshot, the pitch, and where to get it. */
const Product: React.FC = () => (
  <Chapter id="product" label="Product">
    {/* near the top of the page: fetch it first (React 18 only knows the lowercase attribute) */}
    <img
      src={ZENMODE.hero.src}
      srcSet={ZENMODE.hero.srcset}
      sizes={ZENMODE.hero.sizes}
      alt={ZENMODE.hero.alt}
      width={1094}
      height={647}
      loading="eager"
      {...{ fetchpriority: 'high' }}
      className="w-full rounded-[20px] border bg-secondary"
    />
    <p className="mt-8 max-w-[60ch] text-lead">{ZENMODE.pitch}</p>
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* the page's one filled button, in the site's primary: the .zen scope would pull in the
          product's own 165 KB font for this one label */}
      <a
        href={LINKS.playstore}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Play className="h-4 w-4" aria-hidden /> Get it on Google Play
      </a>
      {ZENMODE.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 font-semibold">
          {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      ))}
    </div>
    <p className="mt-4 text-small text-muted-foreground">{ZENMODE.source}</p>
  </Chapter>
);

/** What it does, one row per feature, and how it is put together. */
const HowItWorks: React.FC = () => (
  <Chapter id="how-it-works" label="How it works">
    <ul className="divide-y border-y">
      {ZENMODE.features.map((f) => (
        <li key={f.name} className="flex items-center gap-4 py-4 md:gap-5">
          <span className="shrink-0">
            <FeatureIcon kind={f.icon} />
          </span>
          <span className="grid min-w-0 gap-0.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-baseline md:gap-6">
            <span className="font-semibold">{f.name}</span>
            <span className="text-muted-foreground">{f.desc}</span>
          </span>
        </li>
      ))}
    </ul>
    <p className="mt-6 max-w-[60ch]">{ZENMODE.built}</p>
  </Chapter>
);

/** The public numbers, once each, in one sentence. The page's one highlighter is on the launch rank. */
const Traction: React.FC = () => {
  const { before, mark, after } = ZENMODE.traction;
  return (
    <Chapter id="traction" label="Traction">
      <p className="max-w-[60ch] text-lead">
        <Figures text={before} />
        <Marker>
          <Figures text={mark} />
        </Marker>
        <Figures text={after} />
      </p>
    </Chapter>
  );
};

const ZenModeSection: React.FC = () => (
  <>
    <Product />
    <HowItWorks />
    <Traction />
  </>
);

export default ZenModeSection;
