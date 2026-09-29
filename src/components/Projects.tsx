import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LAB } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

const Projects: React.FC = () => (
  <Section id="lab">
    <SectionHeader index="04" title="Lab" kicker="Smaller experiments, mostly around LLM agents and developer tooling." />
    <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
      {LAB.map((p, i) => (
        <Reveal key={p.name} delay={0.05 * i}>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="zen-tile group flex h-full flex-col p-6 hover:border-primary/50"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="break-all font-mono text-base">{p.name}</p>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-3 flex-1 text-muted-foreground">{p.blurb}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <li key={t} className="zen-label rounded-lg bg-tint px-2 py-1 text-primary">{t}</li>
              ))}
            </ul>
          </a>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Projects;
