import React, { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ZenShell from '@/components/ZenShell';
import ZenCursor from '@/components/ZenCursor';
import { ScrollProgress } from '@/components/zen/primitives';
import { onZen } from '@/lib/zenEvents';
import { labEnabled } from '@/theme/runtime';
import { mountSpotlight } from '@/lib/spotlight';
import { preloadPages } from '@/site/routes';

const CodingDuel = lazy(() => import('@/components/CodingDuel'));
// Brand lab: dev builds only. `labEnabled()` is a build-time constant, so production drops the chunk.
const PalettePanel = labEnabled() ? lazy(() => import('@/components/PalettePanel')) : null;

/** New page → top of the page, or to its #anchor once the page has rendered. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  // We restore position ourselves; the browser's own restoration fights it on iOS.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);
  // Layout effect: reset before the new page is painted, so it never shows at the old offset.
  useLayoutEffect(() => {
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
  }, [pathname, hash]);
}

/** Shared chrome for every page: nav, footer, shell, cursor, lab. */
const Layout: React.FC = () => {
  const [duelOpen, setDuelOpen] = useState(false);
  useEffect(() => onZen('duel', () => setDuelOpen(true)), []);
  useEffect(mountSpotlight, []);
  useEffect(preloadPages, []);
  useScrollOnNavigate();

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
