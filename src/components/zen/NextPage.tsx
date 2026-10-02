import React from 'react';
import { Link } from './Link';
import { ArrowRight } from 'lucide-react';
import { NAV_PAGES, type PageId } from '@/site/pages';

/** End-of-page hand-off to the next page in the menu: one quiet line, so every page leads on. */
const NextPage: React.FC<{ after: PageId }> = ({ after }) => {
  const i = NAV_PAGES.findIndex((p) => p.id === after);
  // pages outside the menu (e.g. the Time Machine) hand off to the first menu page
  const next = NAV_PAGES[(i + 1) % NAV_PAGES.length];
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pb-4 pt-8">
      <Link to={next.path} className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
        Next: <span className="font-semibold text-foreground">{next.label}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
};

export default NextPage;
