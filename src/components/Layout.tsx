import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ZenCursor from '@/components/ZenCursor';
import { onZen } from '@/lib/zenEvents';
import { whenIdle } from '@/lib/idle';
import { labEnabled } from '@/theme/runtime';
import { preloadPages } from '@/site/routes';
import { sound } from '@/lib/sound';

const CodingDuel = lazy(() => import('@/components/CodingDuel'));
// The shell is not on the first screen's critical path: it loads on first use (or when idle).
const loadShell = () => import('@/components/ZenShell');
const ZenShell = lazy(loadShell);

/**
 * True once the visitor asks for the shell (the ` key, or `emitZen('shell')` from the menu, ⌘K or
 * the duel). From then on the shell itself listens; this only stands in for it until it has loaded.
 */
function useShellWanted() {
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (wanted) return;
    const want = () => setWanted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[data-zen-modal]')) return;
      const el = e.target as HTMLElement;
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      e.preventDefault();
      want();
    };
    window.addEventListener('keydown', onKey);
    const off = onZen('shell', want);
    // fetch it while the reader is idle, so the first ` opens it at once
    const cancel = whenIdle(() => void loadShell().catch(() => {}), 4000);
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
      cancel();
    };
  }, [wanted]);
  return wanted;
}
// Brand lab: dev builds only. `labEnabled()` is a build-time constant, so production drops the chunk.
const PalettePanel = labEnabled() ? lazy(() => import('@/components/PalettePanel')) : null;

/** New page → top of the page, or to its #anchor once the page has rendered. */
/** A soft "air" sound on every page change (only when the visitor has turned sound on). */
function usePageSound() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sound.play('page');
  }, [pathname]);
}

/** Where the reader left each history entry, so Back returns there. */
const leftAt = new Map<string, number>();

function useScrollOnNavigate() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  // We restore position ourselves; the browser's own restoration fights it on iOS.
  const keyRef = useRef(key);
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const save = () => leftAt.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);
  // Layout effect: reset before the new page is painted, so it never shows at the old offset.
  useLayoutEffect(() => {
    keyRef.current = key; // before any scroll below, so it is saved against the new entry
    // retries stop when the reader moves on: a late retry must not yank the next page around
    let timer = 0;
    const stop = () => window.clearTimeout(timer);
    const back = navType === 'POP' ? leftAt.get(key) : undefined;
    if (back !== undefined) {
      // Back / Forward: where the reader was. Retry while the page is still too short to get there.
      let tries = 0;
      const restore = () => {
        window.scrollTo({ top: back, left: 0, behavior: 'instant' as ScrollBehavior });
        if (Math.abs(window.scrollY - back) > 1 && tries++ < 20) timer = window.setTimeout(restore, 50);
      };
      restore();
      return stop;
    }
    if (!hash) {
      // 'instant' overrides `scroll-behavior: smooth` on <html>: a new page should simply start at
      // the top, not animate the old page scrolling up (very visible on phones).
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const id = hash.slice(1);
    let tries = 0;
    const seek = () => {
      const el = document.getElementById(id);
      // an explicit 'smooth' overrides the CSS reduced-motion fallback, so ask the media query
      if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      else if (tries++ < 20) timer = window.setTimeout(seek, 50); // lazy pages land a moment later
    };
    seek();
    return stop;
  }, [pathname, hash, key, navType]);
}

/** Shared chrome for every page: nav, footer, shell, cursor, lab. */
const Layout: React.FC = () => {
  const [duelOpen, setDuelOpen] = useState(false);
  useEffect(() => onZen('duel', () => setDuelOpen(true)), []);
  useEffect(preloadPages, []);
  useScrollOnNavigate();
  usePageSound();
  const shellWanted = useShellWanted();

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {/* moves focus itself: a bare #main fragment adds a history entry the router reads as Back,
          and the scroll restore would then pull the page to an old position */}
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById('main');
          main?.focus({ preventScroll: true });
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navigation />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ZenCursor />
      <Suspense fallback={null}>
        {shellWanted && <ZenShell startOpen />}
        <CodingDuel isOpen={duelOpen} onClose={() => setDuelOpen(false)} />
        {PalettePanel && <PalettePanel />}
      </Suspense>
    </div>
  );
};

export default Layout;
