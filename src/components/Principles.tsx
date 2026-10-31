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
          {/* the evidence, each with where it comes from ("Zoho: …") as a small label above it */}
          <ul className="grid gap-4">
            {p.seen.map((s) => {
              const at = s.indexOf(': ');
              return (
                <li key={s}>
                  {at > 0 && <span className="zen-label block text-muted-foreground">{s.slice(0, at)}</span>}
                  {/* after its label, the evidence reads as its own sentence */}
                  <span className="mt-1 block">{at > 0 ? s.charAt(at + 2).toUpperCase() + s.slice(at + 3) : s}</span>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  </Chapter>
);

export default Principles;
