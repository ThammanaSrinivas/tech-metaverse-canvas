import React, { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { SECTIONS, PROFILE } from '@/data/profile';
import { ZenMark } from '@/components/zen/primitives';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // "scrolled" = past the ink hero; over it the bar stays transparent and light-on-dark.
    const onScroll = () => {
      const hero = document.getElementById('home');
      setScrolled(window.scrollY > (hero ? hero.offsetHeight - 64 : 24));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b bg-background/95' : 'dark border-b border-transparent text-foreground'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1120px] items-center gap-6 px-5" aria-label="Main">
          <a href="#home" className="flex items-center gap-2.5" aria-label={`${PROFILE.name}, home`}>
            <ZenMark size={28} title="" />
            <span className="font-display text-lg">{PROFILE.shortName}</span>
          </a>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active === id ? 'bg-tint text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="font-mono text-[10px] tracking-wider">⌘K</kbd>
            </button>
            <ThemeToggle />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-card lg:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t bg-background lg:hidden">
            <ul className="mx-auto grid max-w-[1120px] gap-1 px-5 py-3">
              {SECTIONS.map(({ id, label }, i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary"
                  >
                    <span className="zen-label text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};

export default Navigation;
