import React from 'react';
import { Link } from '@/components/zen/Link';
import { LINKS, PROFILE } from '@/data/profile';
import { NAV_PAGES } from '@/site/pages';

const ELSEWHERE = [
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'GitHub', href: LINKS.github },
  { label: 'Résumé', href: LINKS.resume },
];

/** One quiet block: how to reach me, the pages, and the shell for the curious. */
const Footer: React.FC = () => (
  <footer className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-10">
    <div className="flex flex-col gap-6 border-t pt-8 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="font-semibold">{PROFILE.name}</p>
        <a href={LINKS.email} className="zen-link mt-1 inline-block text-muted-foreground">
          {PROFILE.email}
        </a>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
        {NAV_PAGES.map((p) => (
          <Link key={p.id} to={p.path} className="transition-colors hover:text-foreground">
            {p.label}
          </Link>
        ))}
        {ELSEWHERE.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
            {s.label} ↗
          </a>
        ))}
      </nav>
    </div>
    <p className="mt-8 flex flex-wrap justify-between gap-2 text-small text-muted-foreground">
      <span>
        © {new Date().getFullYear()} · {PROFILE.location}
      </span>
      <span className="hidden font-mono md:inline">press ` for the shell</span>
    </p>
  </footer>
);

export default Footer;
