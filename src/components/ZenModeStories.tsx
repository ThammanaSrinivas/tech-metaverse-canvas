import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ZENMODE, formatDate, type Milestone } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

const MilestoneCard: React.FC<{ m: Milestone }> = ({ m }) => (
  <article className="zen-tile flex flex-col overflow-hidden">
    {m.image && (
      <img src={m.image} alt={m.alt} width={1080} height={1080} loading="lazy" className="aspect-[4/3] w-full border-b object-cover object-top" />
    )}
    <div className="flex flex-1 flex-col p-6 md:p-7">
      <p className="zen-label text-muted-foreground">
        <span className="text-primary">{formatDate(m.date)}</span> · {m.kind}
      </p>
      <h3 className="mt-3 text-h2">{m.title}</h3>
      <p className="mt-3 text-muted-foreground">{m.body}</p>
      {m.points.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {m.points.map((p) => (
            <li key={p} className="zen-chip font-mono text-xs">
              {p}
            </li>
          ))}
        </ul>
      )}
      <a
        href={m.post}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="view"
        className="group mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-primary"
      >
        Read the post
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  </article>
);

/** ZenMode milestones. Product content, so it wears the ZenMode OS brand (.zen). */
const ZenModeStories: React.FC = () => {
  const featured = ZENMODE.milestones.filter((m) => m.featured);
  const rest = ZENMODE.milestones.filter((m) => !m.featured).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Section id="launch" className="pt-0 md:pt-0">
      <SectionHeader title="Milestones" kicker="What happened when we put it in front of people." />
      {/* featured on the left; the rest stacked on the right, newest first */}
      <div className="zen grid items-start gap-4 md:grid-cols-[1.25fr_1fr]">
        {featured.map((m) => (
          <Reveal key={m.title}>
            <MilestoneCard m={m} />
          </Reveal>
        ))}
        <div className="grid gap-4">
          {rest.map((m, i) => (
            <Reveal key={m.title} delay={0.08 * (i + 1)}>
              <MilestoneCard m={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ZenModeStories;
