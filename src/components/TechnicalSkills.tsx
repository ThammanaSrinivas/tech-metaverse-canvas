import React from 'react';
import { TOOLBOX } from '@/data/profile';
import { Chapter } from '@/components/zen/primitives';

/** What I reach for: one plain line per kind of job. */
const TechnicalSkills: React.FC = () => (
  <Chapter id="toolbox" label="Toolbox">
    <dl className="divide-y border-b [&>*:first-child]:pt-0">
      {TOOLBOX.map(({ group, items }) => (
        <div key={group} className="grid gap-1 py-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8">
          <dt className="font-semibold">{group}</dt>
          <dd className="text-muted-foreground">{items.join(', ')}</dd>
        </div>
      ))}
    </dl>
  </Chapter>
);

export default TechnicalSkills;
