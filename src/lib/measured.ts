import { useSyncExternalStore } from 'react';

/**
 * Numbers only the finished build knows: what a first visit to the home page weighs, measured by
 * the prerender (scripts/prerender.ts, scripts/colophon.ts) once the pages exist, for the colophon
 * on /about. The server render reads it from the global the prerender sets; the page's HTML carries
 * it in a `data-first-visit` attribute, which the browser reads back while hydrating, so both render
 * the same. A reader who reaches /about by a link has no such HTML: the number comes from
 * /colophon.json, fetched once. Snapshots are plain numbers (0 = not known yet), so they compare by
 * value. Use it in a leaf component: its one re-render (when the fetch lands) stays there.
 */
export const FIRST_VISIT_ATTR = 'data-first-visit';

type Measured = { weight: number };

let weight = 0;
let asked = false;
const listeners = new Set<() => void>();

/** The number in this page's HTML, if it was rendered with one. */
function fromPage() {
  if (typeof document === 'undefined') return 0;
  const n = Number(document.querySelector(`[${FIRST_VISIT_ATTR}]`)?.getAttribute(FIRST_VISIT_ATTR));
  return n > 0 ? n : 0;
}

function subscribe(changed: () => void) {
  listeners.add(changed);
  if (!weight && !asked) {
    asked = true;
    fetch('/colophon.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? (r.json() as Promise<Measured>) : null))
      .then((m) => {
        if (!m || !(m.weight > 0)) return;
        weight = m.weight;
        listeners.forEach((l) => l());
      })
      // the dev server has no colophon.json (it is written by the build): the row says so instead
      .catch(() => {});
  }
  return () => {
    listeners.delete(changed);
  };
}

const getSnapshot = () => weight || (weight = fromPage());
const getServerSnapshot = () =>
  typeof document === 'undefined' ? ((globalThis as { __COLOPHON__?: Measured }).__COLOPHON__?.weight ?? 0) : fromPage();

/** Bytes a first visit to the home page weighs, compressed; 0 until known. */
export const useFirstVisitWeight = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
