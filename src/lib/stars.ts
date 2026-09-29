import { useEffect, useState } from 'react';

// Night-sky toggle shared by the Starfield and the zen shell's `stars` command.
const KEY = 'stars';
const EVENT = 'zen:stars';

const read = () => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};

export const setStarsEnabled = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // storage blocked: the toggle still applies for this visit
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
};

export const useStarsEnabled = () => {
  const [on, setOn] = useState(read);
  useEffect(() => {
    const handler = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);
  return [on, setStarsEnabled] as const;
};
