import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, NavLink } from '@/components/zen/Link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, FileText, Menu, Search, Terminal, X } from 'lucide-react';
import { LINKS, PROFILE } from '@/data/profile';
import { NAV_PAGES } from '@/site/pages';
import { Monogram } from '@/components/zen/primitives';
import CommandPalette from './CommandPalette';
import { MENU_MOTION } from './menuMotion';
import SoundToggle from './SoundToggle';
import { sound } from '@/lib/sound';
import { emitZen } from '@/lib/zenEvents';

/**
 * Phone menu: a floating card that drops down under the bar, over a dimmed page. The page stays
 * visible behind it, so it reads as a menu, not as navigating somewhere. No body scroll lock:
 * toggling overflow on <body> makes iOS Safari resize its toolbars and re-lay out the whole page,
 * which looks like a reload. The backdrop swallows touches instead, and the card contains its own
 * scroll. Takes the bar's mode: ink over the hero, paper elsewhere.
 *
 * The card is opaque and shadowed from its first frame and slides out from under the bar; only
 * transform and opacity animate (menuMotion.ts has the rules and why). Picking a page does not
 * close it: it stays until the new page is ready, then leaves together with the old page (see the
 * AnimatePresence below).
 *
 * TOOLBARS: Safari on iOS 26+ paints the strips behind its own toolbars in the colour of any
 * `fixed` box that reaches the screen's edge, at once and then held (WebKit's fixedContainerEdges).
 * A fixed backdrop would turn the bottom strip solid dim a moment after the page dims, and keep it
 * dim while the page fades back on close. So no layer of the menu is a fixed box at an edge: the backdrop is `absolute` over the
 * whole document, and the card keeps 8px off the sides (and, upright, far off the bottom). The
 * toolbars just show the dimmed page through their glass.
 */
const STILL = { initial: false, exit: undefined } as const;

const MobileMenu: React.FC<{ onClose: () => void; ink: boolean; pathname: string }> = ({ onClose, ink, pathname }) => {
  // Reduced motion: no slide, no fade; the menu is simply there, and simply gone.
  const still = useReducedMotion() ? STILL : {};
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Covers the whole document (Layout's root), not `fixed`: see TOOLBARS above. One pixel
          past its end, as the root's height is fractional and the scroll range is rounded up. */}
      <motion.div
        aria-hidden
        onClick={onClose}
        {...MENU_MOTION.backdrop}
        {...still}
        className="absolute inset-x-0 top-0 -bottom-px z-[44] bg-foreground/25 will-change-[opacity] lg:hidden"
        style={{ touchAction: 'none' }}
      />
      {/* Starts hidden behind the bar (z-50, opaque) and slides out from under it. */}
      <motion.div
        id="mobile-menu"
        {...MENU_MOTION.card}
        {...still}
        className={`fixed inset-x-2 top-[3.75rem] z-[45] max-h-[calc(100svh-5.5rem)] overflow-y-auto overscroll-contain rounded-2xl border bg-background text-foreground shadow-2xl will-change-transform md:top-[4.25rem] lg:hidden ${
          ink ? 'dark' : ''
        }`}
      >
        <nav aria-label="Pages" className="px-2 py-2">
          <ul>
            {NAV_PAGES.map(({ id, label, path }) => (
              <li key={id}>
                <NavLink
                  to={path}
                  // tapping the page you are on just closes the menu; any other page closes it on arrival
                  onClick={() => path === pathname && onClose()}
                  className={({ isActive, isPending }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive || isPending ? 'bg-secondary' : 'active:bg-secondary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-1 font-display text-lead ${isActive ? '' : 'text-foreground/85'}`}>{label}</span>
                      {isActive ? (
                        <span className="h-2 w-2 rounded-full bg-highlight" aria-label="current page" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid grid-cols-2 gap-2 border-t p-3">
          <button
            onClick={() => {
              onClose();
              emitZen('shell');
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-full border font-mono text-xs uppercase tracking-[0.08em]"
          >
            <Terminal className="h-4 w-4 text-primary" /> zen shell
          </button>
          <a
            href={LINKS.resume}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
          >
            <FileText className="h-4 w-4" /> Resume
          </a>
        </div>
      </motion.div>
    </>
  );
};

/**
 * Top bar. Over an ink top (anything marked data-ink-top) it stays transparent and light-on-dark;
 * elsewhere, and once you scroll past the ink, it is solid.
 * The current page is marked twice: bold text, and a highlighter bar that slides between links.
 */
const Navigation: React.FC = () => {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  // The page the menu was opened on. Deriving "open" from it closes the menu in the same render
  // that shows a new page, never a frame later.
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const menuOpen = menuAt === pathname;
  const closeMenu = useCallback(() => {
    sound.play('menuClose');
    setMenuAt(null);
  }, []);
  const toggleMenu = () => {
    sound.play(menuOpen ? 'menuClose' : 'menuOpen');
    setMenuAt((at) => (at === pathname ? null : pathname));
  };
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setMenuAt(null);
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
        A plain full-width bar with a hairline under it: no floating pill, no shadow, no blur (blur
        costs a lot on phones while scrolling). Opaque, so the phone menu can wait behind it and
        slide out from under it. Over an ink top it goes transparent (and the menu would show as it
        slides; no page has an ink top today). Opening the phone menu never
        changes the bar (that morph read as a glitch).
      */}
      <header data-site-header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`border-b transition-[background-color,border-color] duration-300 ease-out ${
            solid ? 'bg-background' : 'dark border-transparent text-foreground'
          }`}
        >
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center gap-6 px-5 md:h-16" aria-label="Main">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={`${PROFILE.name}, home`}>
            <Monogram size={30} title="" className="transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-display text-lg">{PROFILE.shortName}</span>
          </Link>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV_PAGES.map(({ id, label, path }) => (
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
            <SoundToggle className="lg:h-9 lg:w-9" />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-card lg:hidden"
              onClick={toggleMenu}
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
      {/*
        Keyed by page: on navigation the menu goes in the same frame as the old page, so the view
        transition fades the two out together. Without the key, AnimatePresence replayed the menu's
        exit on top of the new page, and it flashed back for a moment.
      */}
      <AnimatePresence key={pathname}>
        {menuOpen && <MobileMenu onClose={closeMenu} ink={!solid} pathname={pathname} />}
      </AnimatePresence>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};

export default Navigation;
