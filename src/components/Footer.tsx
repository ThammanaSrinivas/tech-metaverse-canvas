import React from 'react';
import { Link } from '@/components/zen/Link';
import { LINKS, PROFILE } from '@/data/profile';
import { PAGES } from '@/site/pages';
import { Monogram } from '@/components/zen/primitives';
import { BRAND } from '@/theme/palettes';

const SOCIAL = [
  { label: 'GitHub', href: LINKS.github },
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'Resume', href: LINKS.resume },
];

const Footer: React.FC = () => (
  <footer className="mx-auto w-full max-w-[1120px] px-5 pb-28 pt-12">
    <div className="grid gap-10 border-t pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-3" aria-label="Home">
          <Monogram size={40} title="" />
          <span className="font-display text-h3">{PROFILE.name}</span>
        </Link>
        <p className="mt-4 max-w-xs text-muted-foreground">{BRAND.idea}</p>
      </div>
      <nav aria-label="Pages">
        <p className="zen-label text-muted-foreground">Pages</p>
        <ul className="mt-4 grid gap-2">
          {PAGES.map((p) => (
            <li key={p.id}>
              <Link to={p.path} className="transition-colors hover:text-primary">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <p className="zen-label text-muted-foreground">Elsewhere</p>
        <ul className="mt-4 grid gap-2">
          {SOCIAL.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <p className="mt-12 flex flex-wrap justify-between gap-2 text-small text-muted-foreground">
      <span>
        © {new Date().getFullYear()} {PROFILE.name} · {PROFILE.location}
      </span>
      <span className="font-mono">press ` for the shell</span>
    </p>
  </footer>
);

export default Footer;
