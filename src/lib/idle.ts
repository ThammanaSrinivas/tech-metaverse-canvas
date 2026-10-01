import { useEffect, useState } from 'react';

/** Run when the browser is idle (or after `timeout` ms at the latest). Returns a cancel function. */
export function whenIdle(fn: () => void, timeout = 1200): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}

/**
 * True once the page has settled: after `delay` ms (let entrance animations finish) and an idle
 * slot. Heavy work (WebGL scenes) waits for this so it never stutters a page transition.
 */
export function useSettled(delay = 450): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let cancelIdle = () => {};
    const t = setTimeout(() => (cancelIdle = whenIdle(() => setSettled(true), 800)), delay);
    return () => {
      clearTimeout(t);
      cancelIdle();
    };
  }, [delay]);
  return settled;
}
