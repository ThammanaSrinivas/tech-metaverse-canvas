// Applies a palette to the live page and lets canvas/JS consumers follow changes.
// Production uses ACTIVE_PALETTE. URL params (work on the live site too):
//   ?lab                         open the palette lab panel (for reviews; hidden otherwise)
//   ?palette=Calm                start from a named preset
//   ?p=EDEBE6-403B33-94C7B6-D6E1C7-FE5D26   a custom palette: light-dark-primary-secondary-highlight
import { useEffect, useState } from 'react';
import { ACTIVE_PALETTE, PALETTES, type Palette } from './palettes';
import { deriveTheme, themeCss, type Theme } from './tokens';
import { isHex, normalizeHex } from './color';
import { MONOGRAM_PATH } from '@/components/zen/monogramPath';

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

const params = () => new URLSearchParams(location.search);

/** The lab panel shows on localhost, or anywhere with ?lab. */
export const labEnabled = () => import.meta.env.DEV || params().has('lab');

/** The favicon is the monogram in the active palette. */
function setFavicon(t: Theme) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="230" fill="${t.monoTile}"/><path fill="${t.monoInk}" d="${MONOGRAM_PATH}"/></svg>`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ROLE_ORDER = ['light', 'dark', 'primary', 'secondary', 'highlight'] as const;

/** "EDEBE6-403B33-…" ↔ Palette, for share links. */
export function paletteToParam(p: Palette) {
  return ROLE_ORDER.map((k) => p[k].replace('#', '')).join('-');
}
export function paletteFromParam(v: string | null): Palette | undefined {
  const parts = v?.split('-') ?? [];
  if (parts.length !== 5 || !parts.every(isHex)) return undefined;
  const hex = parts.map(normalizeHex);
  return { name: 'Shared', light: hex[0], dark: hex[1], primary: hex[2], secondary: hex[3], highlight: hex[4] };
}

/** A link that opens the lab with this exact palette. */
export function shareLink(p: Palette) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('lab', '');
  url.searchParams.set('p', paletteToParam(p));
  return url.toString().replace('lab=&', 'lab&');
}

export function applyPalette(p: Palette, persist = false) {
  current = deriveTheme(p);
  styleEl().textContent = themeCss(current);
  setFavicon(current);
  if (persist) {
    try {
      localStorage.setItem(STORE, JSON.stringify(p));
    } catch {
      // storage blocked: the palette still applies for this visit
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Starting palette: ?p=…, then ?palette=Name, then (lab only) the last one you tried, then ACTIVE_PALETTE. */
export function initPalette() {
  const byName = (n: string | null) => PALETTES.find((p) => p.name.toLowerCase() === n?.toLowerCase());
  const fromUrl = paletteFromParam(params().get('p')) ?? byName(params().get('palette'));
  let saved: Palette | undefined;
  if (labEnabled()) {
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
