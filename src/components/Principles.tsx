import React from 'react';
import { PRINCIPLES } from '@/data/profile';
import { Chapter } from '@/components/zen/primitives';

/** How I build: three principles, each with the places it actually shows up. */
const Principles: React.FC = () => (
  <Chapter id="how-i-build" label="How I build">
    <p className="max-w-[60ch] text-lead">Maintainable by design: the next big change should be small.</p>
    <div className="mt-8 divide-y border-y">
      {PRINCIPLES.map((p) => (
        <article key={p.title} className="grid gap-4 py-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
          <div>
            <h3 className="text-h3">{p.title}</h3>
            <p className="mt-2 text-muted-foreground">{p.claim}</p>
          </div>
          <ul className="grid list-disc gap-2 pl-5 text-small text-muted-foreground marker:text-primary">
            {p.seen.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </Chapter>
);

export default Principles;
