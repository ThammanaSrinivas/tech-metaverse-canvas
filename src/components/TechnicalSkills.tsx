import React from 'react';
import { TOOLBOX } from '@/data/profile';
import { SectionHeader } from '@/components/zen/primitives';

/** What I reach for: one plain line per kind of job. */
const TechnicalSkills: React.FC = () => (
  <section id="toolbox" className="mx-auto w-full max-w-[1120px] px-5 py-12 md:py-16">
    <SectionHeader title="Toolbox" />
    <dl className="divide-y border-y">
      {TOOLBOX.map(({ group, items }) => (
        <div key={group} className="grid gap-1 py-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
          <dt className="font-semibold">{group}</dt>
          <dd className="text-muted-foreground">{items.join(', ')}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default TechnicalSkills;
