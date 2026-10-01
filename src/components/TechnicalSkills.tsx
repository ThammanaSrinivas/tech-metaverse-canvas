import React from 'react';
import { TOOLBOX } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

const TechnicalSkills: React.FC = () => (
  <Section id="toolbox">
    <SectionHeader title="Toolbox" kicker="What I reach for, grouped by the job it does." />
    <Reveal>
      <div className="zen-card divide-y px-5 md:px-7">
        {TOOLBOX.map(({ group, items }) => (
          <div key={group} className="grid gap-3 py-5 md:grid-cols-[140px_1fr] md:items-center">
            <p className="zen-label text-primary">{group}</p>
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => (
                <li key={item} className="zen-chip">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Reveal>
  </Section>
);

export default TechnicalSkills;
