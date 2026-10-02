import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { JOBS } from '@/data/profile';
import { postFor } from '@/content/writing';
import { plain } from '@/lib/rich';

/**
 * Each role as a few paragraphs of prose with the numbers inline, dates in the margin. Reads like
 * a letter from the engineer, not a dashboard.
 */
const WorkExperience: React.FC = () => (
  <section id="experience" className="mx-auto w-full max-w-[1120px] px-5 pb-8 pt-8">
    <div className="divide-y border-y">
      {JOBS.map((j) => {
        const post = j.writeup ? postFor(j.writeup) : undefined;
        return (
          <article key={j.id} className="grid gap-4 py-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
            <p className="font-mono text-small text-muted-foreground md:pt-2">{j.period}</p>
            <div className="max-w-[68ch]">
              <h2 className="text-h2">{j.company}</h2>
              <p className="mt-1 text-muted-foreground">{j.role}</p>
              <div className="mt-5 grid gap-4">
                {j.story.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
              {post && (
                <Link to={`/writing/${post.slug}`} className="zen-link mt-5 inline-flex items-center gap-1.5 font-semibold">
                  Read the write-up: {plain(post.title)} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {j.earlier && <p className="mt-5 text-small text-muted-foreground">Earlier: {j.earlier}</p>}
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

export default WorkExperience;
