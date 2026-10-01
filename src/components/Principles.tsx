import React from 'react';
import { PRINCIPLES } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

/** How I build: three engineering principles, each with the places it shows up. */
const Principles: React.FC = () => (
  <Section id="how-i-build" className="pt-0 md:pt-0">
    <SectionHeader title="How I *build*" kicker="Maintainable by design: the next big change should be small." />
    <div className="grid gap-3 md:grid-cols-3 md:gap-4">
      {PRINCIPLES.map((p, i) => (
        <Reveal key={p.title} delay={0.06 * i} className="h-full">
          <article className="zen-tile flex h-full flex-col p-6">
            <span className="zen-label text-primary">0{i + 1}</span>
            <h3 className="mt-4 text-h3">{p.title}</h3>
            <p className="mt-2 text-muted-foreground">{p.claim}</p>
            <ul className="mt-5 space-y-2 border-t pt-4">
              {p.seen.map((s) => (
                <li key={s} className="flex gap-2 text-small text-muted-foreground">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Principles;
