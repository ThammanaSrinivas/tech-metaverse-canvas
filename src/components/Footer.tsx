import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/zen/Link';
import { CopyEmail } from '@/components/zen/primitives';
import { LINKS, PROFILE } from '@/data/profile';
import { NAV_PAGES } from '@/site/pages';

const ELSEWHERE = [
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'GitHub', href: LINKS.github },
  { label: 'Résumé', href: LINKS.resume },
];

const CLOCK = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
});

/** What time it is where I am, so a message from another time zone knows when I'll see it. */
const LocalTime: React.FC = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return <time dateTime={now.toISOString()}>{CLOCK.format(now)} IST</time>;
};

/**
 * The sign-off, on the chapter grid: the email large (one tap copies it), the pages, the rest. On
 * /about the email is the page's own last chapter, so the footer doesn't repeat it there.
 */
const Footer: React.FC = () => {
  const showEmail = useLocation().pathname !== '/about';
  return (
    <footer className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-10">
      <div className="grid gap-6 border-t pt-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
        <p className="flex items-center gap-2.5 text-small font-semibold">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
          {showEmail ? 'Say hello' : 'Elsewhere'}
        </p>
        <div className="min-w-0">
          {showEmail && (
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={LINKS.email}
                className="font-display text-h3 [overflow-wrap:anywhere] transition-colors hover:text-primary md:text-h2"
              >
                {PROFILE.email}
              </a>
              <CopyEmail />
            </div>
          )}
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
      </div>
      <p className="mt-10 flex flex-wrap justify-between gap-2 text-small text-muted-foreground">
        <span>
          © {new Date().getFullYear()} · {PROFILE.location.split(',')[0]}, <LocalTime />
        </span>
        <span className="hidden md:inline">
          press <kbd>`</kbd> for the shell
        </span>
      </p>
    </footer>
  );
};

export default Footer;
