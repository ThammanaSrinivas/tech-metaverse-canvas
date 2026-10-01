import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PAGES, type PageId } from '@/site/pages';
import { Rich } from './primitives';

/** End-of-page hand-off to the next page in the site map, so every page has somewhere to go. */
const NextPage: React.FC<{ after: PageId }> = ({ after }) => {
  const i = PAGES.findIndex((p) => p.id === after);
  const next = PAGES[(i + 1) % PAGES.length];
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pb-8 pt-4">
      <Link
        to={next.path}
        data-cursor="open"
        className="group flex items-center justify-between gap-6 border-t pt-8"
      >
        <span>
          <span className="zen-label text-muted-foreground">Next · {next.index}</span>
          <span className="mt-2 block font-display text-h1 transition-colors group-hover:text-primary">
            <Rich text={next.title} />
          </span>
        </span>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
};

export default NextPage;
