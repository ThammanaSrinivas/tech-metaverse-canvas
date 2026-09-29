import React from 'react';
import { Github, Play, Globe } from 'lucide-react';
import { LINKS, ZENMODE } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

type IconKind = (typeof ZENMODE.features)[number]['icon'];

const FeatureIcon: React.FC<{ kind: IconKind }> = ({ kind }) => {
  if (kind === 'score')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" className="stroke-border" strokeWidth="5" />
        <circle cx="20" cy="20" r="15" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round"
          strokeDasharray="66 94" transform="rotate(-90 20 20)" />
      </svg>
    );
  if (kind === 'streak')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <path className="fill-primary" d="M20 4c2 9 13 13 13 24a13 13 0 0 1-26 0c0-7 5-11 7-16 2 5 4 7 6 7-1-5-2-10 0-15Z" />
      </svg>
    );
  if (kind === 'circle')
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="fill-primary">
        <circle cx="12" cy="25" r="9" opacity=".55" />
        <circle cx="28" cy="25" r="9" opacity=".8" />
        <circle cx="20" cy="13" r="9" />
      </svg>
    );
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="16" fill="#FFC800" />
      <circle cx="20" cy="20" r="10.5" fill="none" stroke="#7A5A00" strokeOpacity=".45" strokeWidth="2" />
    </svg>
  );
};

const ZenModeSection: React.FC = () => (
  <Section id="zenmode">
    <SectionHeader index="01" title="What I'm building" />

    <Reveal>
      <a href={LINKS.zenmode} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[22px] border">
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
        <p className="text-lg leading-relaxed text-muted-foreground">{ZENMODE.pitch}</p>
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
              <p className="mt-8 font-display text-xl md:text-2xl">{f.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </Reveal>
        );
      })}
    </div>

    <Reveal delay={0.1}>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <a href={LINKS.playstore} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
            <Play className="h-4 w-4" /> Get it on Google Play
          </a>
          <a href={LINKS.zenmode} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-6 font-semibold transition-colors hover:border-primary">
            <Github className="h-4 w-4" /> Star on GitHub
          </a>
          <a href={LINKS.zenmodeSite} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-6 font-semibold transition-colors hover:border-primary">
            <Globe className="h-4 w-4" /> zenmodeos.com
          </a>
        </div>
        <p className="zen-label text-muted-foreground">
          <span className="text-reward">{ZENMODE.award}</span> · GPLv3 · Kotlin + Compose
        </p>
      </div>
    </Reveal>
  </Section>
);

export default ZenModeSection;
