import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, FileText, Menu, Search, Terminal, X } from 'lucide-react';
import { LINKS, PROFILE } from '@/data/profile';
import { PAGES } from '@/site/pages';
import { Monogram } from '@/components/zen/primitives';
import CommandPalette from './CommandPalette';
import { emitZen } from '@/lib/zenEvents';

/**
 * Phone menu: a full-screen sheet under the bar. Big, thumb-sized page titles with their proof
 * line, the current page marked, quick actions at the bottom. Locks page scroll while open.
 */
const MobileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      id="mobile-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-background pt-[72px] lg:hidden"
    >
      <nav aria-label="Pages" className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-4">
        <ul>
          {PAGES.map(({ id, label, path, index, proof }, i) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="border-b"
            >
              <NavLink to={path} onClick={onClose} className="flex items-center gap-4 py-4">
                {({ isActive }) => (
                  <>
                    <span className="zen-label w-6 text-primary">{index}</span>
                    <span className="flex-1">
                      <span className={`block font-display text-h3 ${isActive ? '' : 'text-foreground/80'}`}>{label}</span>
                      <span className="font-mono text-small text-muted-foreground">{proof}</span>
                    </span>
                    {isActive ? (
                      <span className="zen-pill border-transparent bg-highlight text-[color:var(--highlight-ink)]">here</span>
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-2 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
        <button
          onClick={() => {
            onClose();
            emitZen('shell');
          }}
          className="flex h-12 items-center justify-center gap-2 rounded-full border font-mono text-xs uppercase tracking-[0.08em]"
        >
          <Terminal className="h-4 w-4 text-primary" /> zen shell
        </button>
        <a
          href={LINKS.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
        >
          <FileText className="h-4 w-4" /> Resume
        </a>
      </div>
    </motion.div>
  );
};

/**
 * Top bar. Over an ink top (the home hero, the explore sky: anything marked data-ink-top) it stays
 * transparent and light-on-dark; elsewhere, and once you scroll past the ink, it turns solid.
 * The current page is marked twice: bold text, and a highlighter bar that slides between links.
 */
const Navigation: React.FC = () => {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    const onScroll = () => {
      const ink = document.querySelector<HTMLElement>('[data-ink-top]');
      setSolid(!ink || window.scrollY > ink.offsetHeight - 64);
    };
    // Pages are lazy chunks: re-measure when the page content actually lands in <main>.
    const main = document.getElementById('main');
    const mo = new MutationObserver(onScroll);
    if (main) mo.observe(main, { childList: true, subtree: true });
    const settle = window.setTimeout(() => mo.disconnect(), 3000);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mo.disconnect();
      window.clearTimeout(settle);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return (
    <>
      {/*
        Over an ink top the bar is transparent and full-width. Once solid it floats: inset from the
        edges, rounded, with a soft shadow. No backdrop blur: it costs a lot on phones while scrolling.
      */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ease-out ${
          solid || menuOpen ? 'px-2 pt-2 md:px-4 md:pt-3' : 'px-0 pt-0'
        }`}
      >
        <div
          className={`mx-auto transition-[max-width,background-color,border-color,border-radius,box-shadow] duration-300 ease-out ${
            solid || menuOpen
              ? 'max-w-[1160px] rounded-2xl border bg-background/95 shadow-[0_10px_30px_-14px_hsl(var(--foreground)/0.3)]'
              : 'dark max-w-full rounded-none border border-transparent text-foreground'
          }`}
        >
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center gap-6 px-4 md:h-16 md:px-5" aria-label="Main">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={`${PROFILE.name}, home`}>
            <Monogram size={30} title="" className="transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-display text-lg">{PROFILE.shortName}</span>
          </Link>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {PAGES.map(({ id, label, path }) => (
              <li key={id}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `relative block px-3 py-2 text-sm transition-colors ${
                      isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-mark"
                          className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-highlight"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
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
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-card lg:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
        </div>
      </header>
      <AnimatePresence>{menuOpen && <MobileMenu onClose={closeMenu} />}</AnimatePresence>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};

export default Navigation;
