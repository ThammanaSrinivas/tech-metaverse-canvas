import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Page from '@/components/zen/Page';
import { Reveal, Rich, Section } from '@/components/zen/primitives';
import { POSTS, readMinutes } from '@/content/writing';
import { formatDate } from '@/data/profile';

const WritingPage: React.FC = () => (
  <Page id="writing">
    <Section id="posts" className="pt-8 md:pt-10">
      {POSTS.length === 0 && <p className="text-muted-foreground">First write-up coming soon.</p>}
      <ol className="grid gap-4">
        {POSTS.map((p, i) => (
          <Reveal key={p.slug} delay={0.05 * i}>
            <li>
              <Link to={`/writing/${p.slug}`} data-cursor="read" className="zen-tile group grid gap-4 p-6 md:grid-cols-[1fr_auto] md:p-8">
                <span>
                  <span className="zen-label flex flex-wrap items-center gap-x-2 text-muted-foreground">
                    <span className="text-primary">{formatDate(p.date)}</span> · {readMinutes(p.body)} min read
                    {p.draft && <span className="rounded-md bg-highlight/15 px-1.5 text-reward">draft · localhost only</span>}
                  </span>
                  <span className="mt-3 block font-display text-h2 transition-colors group-hover:text-primary">
                    <Rich text={p.title} />
                  </span>
                  <span className="mt-3 block max-w-2xl text-muted-foreground">{p.summary}</span>
                  <span className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="zen-chip font-mono text-xs">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="hidden h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground md:flex">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  </Page>
);

export default WritingPage;
