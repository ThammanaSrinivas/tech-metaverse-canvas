import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Play, Globe, Trophy } from 'lucide-react';
import { LINKS, ZENMODE } from '@/data/profile';
import { Reveal, Section } from '@/components/zen/primitives';

type IconKind = (typeof ZENMODE.features)[number]['icon'];

// Each icon plays its own small idea once it scrolls in: the score ring fills, the streak flame
// flickers, the circle gathers, the gold coin catches the light.
const FeatureIcon: React.FC<{ kind: IconKind }> = ({ kind }) => {
  const reduce = useReducedMotion();
  const view = { once: true, margin: '-40px' } as const;
  if (kind === 'score')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" className="stroke-border" strokeWidth="5" />
        <motion.circle cx="20" cy="20" r="15" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round"
          transform="rotate(-90 20 20)"
          initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 0.7 }} viewport={view}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
    );
  if (kind === 'streak')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="zen-flicker origin-bottom">
        <path className="fill-primary" d="M20 4c2 9 13 13 13 24a13 13 0 0 1-26 0c0-7 5-11 7-16 2 5 4 7 6 7-1-5-2-10 0-15Z" />
      </svg>
    );
  if (kind === 'circle')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="fill-primary">
        {[
          { cx: 12, cy: 25, o: 0.55, from: [-8, 6] },
          { cx: 28, cy: 25, o: 0.8, from: [8, 6] },
          { cx: 20, cy: 13, o: 1, from: [0, -8] },
        ].map((c, i) => (
          <motion.circle key={i} cx={c.cx} cy={c.cy} r="9" opacity={c.o}
            initial={reduce ? false : { x: c.from[0], y: c.from[1], scale: 0.4 }} whileInView={{ x: 0, y: 0, scale: 1 }}
            viewport={view} transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }} />
        ))}
      </svg>
    );
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <defs>
        <clipPath id="coin"><circle cx="20" cy="20" r="16" /></clipPath>
      </defs>
      <circle cx="20" cy="20" r="16" className="fill-amber-500" />
      <circle cx="20" cy="20" r="10.5" fill="none" className="stroke-amber-800" strokeOpacity=".45" strokeWidth="2" />
      <g clipPath="url(#coin)">
        <rect className="zen-shine fill-amber-50" x="-20" y="0" width="8" height="40" opacity=".7" transform="skewX(-20)" />
      </g>
    </svg>
  );
};

const ZenModeSection: React.FC = () => (
  <Section id="zenmode" className="pt-8 md:pt-10">
    {/* Everything below the heading is the product, so it wears the ZenMode OS brand (.zen tokens). */}
    <div className="zen">

    <Reveal>
      <a href={LINKS.zenmode} target="_blank" rel="noopener noreferrer" data-cursor="view" className="block overflow-hidden rounded-[22px] border">
        <img
          src="/zenmode-hero.webp"
          alt="A phone running ZenMode OS: Zen Score 7/10, a 13-day streak, gold invested, and a ZenCircle comparing friends' screen time."
          width={1094}
          height={647}
          loading="lazy"
          className="w-full transition-transform duration-700 hover:scale-[1.015]"
        />
      </a>
    </Reveal>

    <Reveal delay={0.05}>
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-lead text-muted-foreground">{ZENMODE.pitch}</p>
      </div>
    </Reveal>

    <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {ZENMODE.features.map((f, i) => {
        const reward = f.icon === 'gold';
        return (
          <Reveal key={f.name} delay={0.05 * i}>
            <div
              className={`zen-tile h-full p-5 md:p-6 ${
                reward ? 'border-amber-500/40 bg-reward-surface' : 'hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <FeatureIcon kind={f.icon} />
                <span className={`zen-label ${reward ? 'text-reward' : 'text-primary'}`}>{f.stat}</span>
              </div>
              <p className="mt-8 font-display text-h3">{f.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </Reveal>
        );
      })}
    </div>

    <Reveal delay={0.05}>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" aria-label="ZenMode OS by the numbers">
        {ZENMODE.stats.map((st) => {
          const rating = st.unit === '★';
          return (
            <div key={st.label} className="rounded-[20px] border border-tint-line bg-tint p-5">
              <p className={`font-mono text-h2 ${rating ? 'text-reward' : 'text-primary'}`}>
                {st.prefix}
                {st.value}
                {st.unit}
              </p>
              <p className="mt-3 font-medium">{st.label}</p>
              <p className="text-sm text-muted-foreground">{st.sub}</p>
            </div>
          );
        })}
      </div>
    </Reveal>

    <Reveal delay={0.1}>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <a href={LINKS.playstore} target="_blank" rel="noopener noreferrer"
            data-magnet
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
            <Play className="h-4 w-4" /> Get it on Google Play
          </a>
          <a href={LINKS.zenmode} target="_blank" rel="noopener noreferrer"
            data-magnet
            className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-6 font-semibold transition-colors hover:border-primary">
            <Github className="h-4 w-4" /> Star on GitHub
          </a>
          <a href={LINKS.producthunt} target="_blank" rel="noopener noreferrer"
            data-magnet
            className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-6 font-semibold transition-colors hover:border-primary">
            <Trophy className="h-4 w-4" /> Product Hunt
          </a>
          <a href={LINKS.zenmodeSite} target="_blank" rel="noopener noreferrer"
            data-magnet
            className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-6 font-semibold transition-colors hover:border-primary">
            <Globe className="h-4 w-4" /> zenmodeos.com
          </a>
        </div>
        <p className="zen-label text-muted-foreground">
          <span className="text-reward">{ZENMODE.award}</span> · GPLv3 · Kotlin + Compose
        </p>
      </div>
    </Reveal>
    </div>
  </Section>
);

export default ZenModeSection;
