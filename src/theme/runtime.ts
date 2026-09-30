// Applies a palette to the live page and lets canvas/JS consumers follow changes.
// Production uses ACTIVE_PALETTE; on localhost the palette panel can swap it (and a
// ?palette=Name URL param works anywhere, handy for sharing a preview).
import { useEffect, useState } from 'react';
import { ACTIVE_PALETTE, PALETTES, type Palette } from './palettes';
import { deriveTheme, themeCss, type Theme } from './tokens';

const EVENT = 'zen:palette';
const STORE = 'palette:custom';

let current: Theme = deriveTheme(PALETTES.find((p) => p.name === ACTIVE_PALETTE) ?? PALETTES[0]);

function styleEl(): HTMLStyleElement {
  let el = document.getElementById('palette-tokens') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'palette-tokens';
    document.head.appendChild(el);
  }
  return el;
}

export function applyPalette(p: Palette, persist = false) {
  current = deriveTheme(p);
  styleEl().textContent = themeCss(current);
  if (persist) {
    try {
      localStorage.setItem(STORE, JSON.stringify(p));
    } catch {
      // storage blocked: the palette still applies for this visit
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Pick the starting palette: ?palette=Name, then (dev only) the last one you tried, then ACTIVE_PALETTE. */
export function initPalette() {
  const byName = (n: string | null) => PALETTES.find((p) => p.name.toLowerCase() === n?.toLowerCase());
  const fromUrl = byName(new URLSearchParams(location.search).get('palette'));
  let saved: Palette | undefined;
  if (import.meta.env.DEV) {
    try {
      saved = JSON.parse(localStorage.getItem(STORE) ?? 'null') ?? undefined;
    } catch {
      saved = undefined;
    }
  }
  applyPalette(fromUrl ?? saved ?? current.palette);
}

export const getTheme = () => current;

export function resetPalette() {
  try {
    localStorage.removeItem(STORE);
  } catch {
    // ignore
  }
  applyPalette(PALETTES.find((p) => p.name === ACTIVE_PALETTE) ?? PALETTES[0]);
}

/** Re-renders when the palette changes; canvases use it to recolour. */
export function useBrandTheme(): Theme {
  const [theme, setTheme] = useState(current);
  useEffect(() => {
    const on = () => setTheme(current);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return theme;
}

/** For non-React code (the cursor). */
export function onPaletteChange(fn: (t: Theme) => void) {
  const on = () => fn(current);
  window.addEventListener(EVENT, on);
  return () => window.removeEventListener(EVENT, on);
}
