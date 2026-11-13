import React from 'react';
import { Link } from './Link';
import { ArrowRight } from 'lucide-react';
import { NAV_PAGES, type PageId } from '@/site/pages';

/** End-of-page hand-off to the next page in the menu, on the chapter grid: every page leads on. */
const NextPage: React.FC<{ after: PageId }> = ({ after }) => {
  const i = NAV_PAGES.findIndex((p) => p.id === after);
  // pages outside the menu (e.g. the Time Machine) hand off to the first menu page
  const next = NAV_PAGES[(i + 1) % NAV_PAGES.length];
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pb-6 pt-10 md:pt-16">
      <Link to={next.path} className="group grid gap-3 border-t pt-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 md:pt-8">
        <span className="flex items-center gap-2.5 self-start text-small font-semibold md:pt-4">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
          Next
        </span>
        <span className="flex items-center gap-[0.35em] font-display text-title">
          <span className="zen-draw">{next.label}</span>
          <ArrowRight aria-hidden className="h-[0.62em] w-[0.62em] transition-transform duration-500 ease-out group-hover:translate-x-[0.18em]" />
        </span>
      </Link>
    </div>
  );
};

export default NextPage;
