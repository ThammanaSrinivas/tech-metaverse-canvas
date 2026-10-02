import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { LAB } from '@/data/profile';
import { pageFor } from '@/site/pages';
import { SectionHeader } from '@/components/zen/primitives';

const row = 'group grid gap-1 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-8';

/** Smaller things: the Time Machine on this site, then experiments on GitHub. */
const SideProjects: React.FC = () => {
  const tm = pageFor('time-machine');
  return (
    <section id="side-projects" className="mx-auto w-full max-w-[1120px] px-5 py-12 md:py-16">
      <SectionHeader title="Side projects" kicker="Smaller experiments, mostly around LLM agents and developer tooling." />
      <ul className="divide-y border-y">
        <li>
          <Link to={tm.path} className={row}>
            <span>
              <span className="font-semibold transition-colors group-hover:text-primary">{tm.title}</span>
              <span className="mt-1 block text-muted-foreground">{tm.lead}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-small text-muted-foreground">
              on this site <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </li>
        {LAB.map((p) => (
          <li key={p.name}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className={row}>
              <span>
                <span className="break-all font-mono transition-colors group-hover:text-primary">{p.name}</span>
                <span className="mt-1 block text-muted-foreground">{p.blurb}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-small text-muted-foreground">
                {p.tags.join(' · ')} <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SideProjects;
