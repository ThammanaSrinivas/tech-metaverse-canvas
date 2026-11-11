import { useSyncExternalStore } from 'react';

// Night-sky toggle shared by the Starfield and the zen shell's `stars` command.
const KEY = 'stars';
const EVENT = 'zen:stars';

/** This visit's choice; null until read from storage (storage may be blocked). */
let current: boolean | null = null;

const read = () => {
  if (current === null) {
    try {
      current = localStorage.getItem(KEY) !== 'off';
    } catch {
      current = true;
    }
  }
  return current;
};

export const setStarsEnabled = (on: boolean) => {
  current = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // storage blocked: the toggle still applies for this visit
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
};

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
};

/** [on, set]. The page's HTML always has the sky; a reader who turned it off loses it once live. */
export const useStarsEnabled = () => [useSyncExternalStore(subscribe, read, () => true), setStarsEnabled] as const;
