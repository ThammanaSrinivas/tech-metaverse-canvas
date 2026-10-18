import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ZenShell from '@/components/ZenShell';
import ZenCursor from '@/components/ZenCursor';
import { ScrollProgress } from '@/components/zen/primitives';
import { onZen } from '@/lib/zenEvents';
import { labEnabled } from '@/theme/runtime';
import { preloadPages } from '@/site/routes';
import { sound } from '@/lib/sound';

const CodingDuel = lazy(() => import('@/components/CodingDuel'));
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
    const back = navType === 'POP' ? leftAt.get(key) : undefined;
    if (back !== undefined) {
      // Back / Forward: where the reader was. Retry while the page is still too short to get there.
      let tries = 0;
      const restore = () => {
        window.scrollTo({ top: back, left: 0, behavior: 'instant' as ScrollBehavior });
        if (Math.abs(window.scrollY - back) > 1 && tries++ < 20) setTimeout(restore, 50);
      };
      restore();
      return;
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
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else if (tries++ < 20) setTimeout(seek, 50); // lazy pages land a moment later
    };
    seek();
  }, [pathname, hash, key, navType]);
}

/** Shared chrome for every page: nav, footer, shell, cursor, lab. */
const Layout: React.FC = () => {
  const [duelOpen, setDuelOpen] = useState(false);
  useEffect(() => onZen('duel', () => setDuelOpen(true)), []);
  useEffect(preloadPages, []);
  useScrollOnNavigate();
  usePageSound();

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navigation />
      <main id="main" className="flex-1">
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ZenShell />
      <ZenCursor />
      <Suspense fallback={null}>
        <CodingDuel isOpen={duelOpen} onClose={() => setDuelOpen(false)} />
        {PalettePanel && <PalettePanel />}
      </Suspense>
    </div>
  );
};

export default Layout;
