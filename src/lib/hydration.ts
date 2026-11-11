import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';

// Every page ships as HTML rendered at build time (scripts/prerender.ts), and the browser hydrates
// it: its first render must produce exactly the server's markup, or React 18 throws the page away
// and renders it again (and attributes it can't match, like an inline opacity, stay wrong).
// Anything only the browser knows (the reader's motion preference, the clock, their keyboard,
// their saved settings) goes through these hooks: they answer as the server did while hydrating,
// and with the real value straight after.

const never = () => () => {};

/** True on the server and while hydrating its HTML; false after, and in anything mounted later. */
export const useHydrating = () => useSyncExternalStore(never, () => false, () => true);

/** A value only the browser knows, `server` while hydrating. `client` must return a stable value. */
export const useClientValue = <T>(client: () => T, server: T) => useSyncExternalStore(never, client, () => server);

const REDUCE = '(prefers-reduced-motion: reduce)';
const onReduceChange = (fn: () => void) => {
  const mq = matchMedia(REDUCE);
  mq.addEventListener('change', fn);
  return () => mq.removeEventListener('change', fn);
};

/**
 * The reader's reduced-motion preference: false while hydrating (the server can't know it), then
 * live. Use this, not framer-motion's, which answers during hydration and so mismatches the HTML.
 */
export const useReducedMotion = () => useSyncExternalStore(onReduceChange, () => matchMedia(REDUCE).matches, () => false);

/** True if this component was in the server's HTML (it mounted while hydrating). Fixed at mount. */
export function useFromServer() {
  const hydrating = useHydrating();
  const [fromServer] = useState(hydrating);
  return fromServer;
}

/** For effects: the preference right now (effects run only in the browser, after hydration). */
export const prefersReducedMotion = () => matchMedia(REDUCE).matches;

/** useLayoutEffect in the browser; on the server (where neither runs) without React's warning. */
export const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
