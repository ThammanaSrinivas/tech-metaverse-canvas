import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ZENMODE, formatDate, type Milestone } from '@/data/profile';
import { Chapter } from '@/components/zen/primitives';

/** Newest first; on the same day, the featured one (the launch recap) above the rest. */
const MILESTONES = [...ZENMODE.milestones].sort(
  (a, b) => b.date.localeCompare(a.date) || Number(!!b.featured) - Number(!!a.featured)
);

/** One dated row: the date in its own column, as on /work; the featured one carries its card. */
const Row: React.FC<{ m: Milestone }> = ({ m }) => (
  <li className="grid gap-2 py-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
    <p className="font-mono text-small tabular-nums text-muted-foreground md:pt-0.5">{formatDate(m.date)}</p>
    <div className={m.image ? 'grid gap-5 sm:grid-cols-[minmax(0,1fr)_176px] sm:gap-8' : ''}>
      <div className="max-w-[60ch]">
        <h3 className="font-sans font-semibold">{m.title}</h3>
        <p className="mt-1 text-muted-foreground">{m.body}</p>
        <a
          href={m.post}
          target="_blank"
          rel="noopener noreferrer"
          className="zen-link mt-2 inline-flex items-center gap-1 text-small text-muted-foreground"
        >
          The LinkedIn post <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
      {m.image && (
        <img
          src={m.image}
          alt={m.alt}
          width={400}
          height={400}
          loading="lazy"
          className="w-full max-w-[176px] rounded-[12px]"
        />
      )}
    </div>
  </li>
);

/** What happened when ZenMode OS met people: a dated list on hairlines, like the roles on /work. */
const ZenModeStories: React.FC = () => (
  <Chapter id="milestones" label="Milestones">
    <ol className="divide-y border-y">
      {MILESTONES.map((m) => (
        <Row key={m.post} m={m} />
      ))}
    </ol>
  </Chapter>
);

export default ZenModeStories;
