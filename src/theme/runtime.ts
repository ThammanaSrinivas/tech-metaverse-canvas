// Applies a palette and a typography set to the live page and lets canvas/JS consumers follow
// changes. Production always ships the "active" palette (colors.json) and type (typography.json): the lab and every override below are
// dev-only (npm run dev / localhost), so the deployed site can't be re-themed from a URL.
// URL params on localhost:
//   ?theme=Ultraviolet · Editorial   start from a named palette + type combo
//   ?palette=Calm                start from a named palette
//   ?type=Editorial              start from a named typography set
//   ?r=1.333                     start from a type-scale ratio
//   ?p=EDEBE6-403B33-94C7B6-D6E1C7-FE5D26   a custom palette: light-dark-primary-secondary-highlight
import { useEffect, useState } from 'react';
import { ACTIVE_PALETTE, ACTIVE_RATIO, ACTIVE_TYPE, FONT_FACES, FONT_FALLBACKS, PALETTES, TYPE_SCALE, TYPOGRAPHY, ZENMODE_TYPE, findPalette, findTheme, findType, type Palette, type TypeScale, type Typography } from './palettes';
import { deriveTheme, themeCss, type Theme } from './tokens';
import { isHex, normalizeHex } from './color';
import { MONOGRAM_DOT, MONOGRAM_PATH } from '@/components/zen/monogramPath';

const EVENT = 'zen:palette';
const STORE = 'palette:custom';
const TYPE_STORE = 'type:custom';
const RATIO_STORE = 'ratio:custom';

const activePalette = () => findPalette(ACTIVE_PALETTE) ?? PALETTES[0];
const activeType = () => findType(ACTIVE_TYPE) ?? TYPOGRAPHY[0];

let current: Theme = deriveTheme(activePalette());
let currentType: Typography = activeType();
let currentRatio = ACTIVE_RATIO;

const params = () => new URLSearchParams(location.search);

/** The brand lab exists only in dev builds; production never ships or shows it. */
export const labEnabled = () => import.meta.env.DEV;

/** The favicon is the monogram in the active palette. */
function setFavicon(t: Theme) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="230" fill="${t.monoTile}"/><path fill="${t.monoInk}" d="${MONOGRAM_PATH}"/><circle cx="${MONOGRAM_DOT.cx}" cy="${MONOGRAM_DOT.cy}" r="${MONOGRAM_DOT.r}" fill="${t.monoDot}"/></svg>`;
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

/** A link that opens the lab with this exact palette and typography. */
export function shareLink(p: Palette, t: Typography = currentType) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('p', paletteToParam(p));
  url.searchParams.set('type', t.name);
  url.searchParams.set('r', String(currentRatio));
  return url.toString();
}

const FALLBACK = FONT_FALLBACKS;

const FORMAT: Record<string, string> = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };

/** @font-face for every vendored font in typography.json (no font file is named anywhere else). */
export function fontFacesCss() {
  return FONT_FACES.map((f) => {
    const ext = f.file.split('.').pop() ?? '';
    return `@font-face {\n  font-family: "${f.family}";\n  src: url("${f.file}") format("${FORMAT[ext] ?? ext}");\n  font-weight: ${f.weight};\n  font-style: ${f.style ?? 'normal'};\n  font-display: swap;\n}`;
  }).join('\n');
}

/** The ZenMode OS fonts inside the .zen scope. */
function zenTypeCss() {
  const z = ZENMODE_TYPE;
  return `.zen {\n  --display-weight: ${z.weight};\n  --font-display: "${z.display}", "${z.sans}", ${FALLBACK.display};\n  --font-accent: var(--font-display);\n  --font-sans: "${z.sans}", ${FALLBACK.sans};\n  --font-mono: "${z.mono}", ${FALLBACK.mono};\n}`;
}

/** :root font variables read by tailwind's font-display / font-sans / font-mono, plus .zen fonts. */
export function typeCss(t: Typography) {
  return `:root {\n  --display-weight: ${t.weight ?? 600};\n  --font-display: "${t.display}", "${t.sans}", ${FALLBACK.display};\n  --font-accent: "${t.accent ?? t.display}", ${FALLBACK.accent};\n  --font-sans: "${t.sans}", ${FALLBACK.sans};\n  --font-mono: "${t.mono}", ${FALLBACK.mono};\n}\n${zenTypeCss()}`;
}

const PHONE = 375;
const DESKTOP = 1280;
const px = (v: number) => `${+(v / 16).toFixed(4)}rem`;

/**
 * --fs-<role> / --lh-<role> / --tr-<role> for every role of the modular scale. Sizes grow fluidly
 * from a gentler ratio on phones to the full ratio on desktop; headings get the typography's
 * optical correction so a small-x-height serif doesn't shrink the hierarchy.
 */
export function scaleCss(scale: TypeScale, ratio: number, t: Typography) {
  const phoneRatio = 1 + (ratio - 1) * 0.72;
  const lines = Object.entries(scale.roles).map(([role, r]) => {
    const optical = ['display', 'title', 'h1', 'h2'].includes(role) ? t.displayScale ?? 1 : 1;
    const fit = (v: number, cap = Infinity) => Math.max(Math.min(v, cap), r.min ?? 0);
    const hi = fit(scale.base * ratio ** r.step * optical, r.max);
    const lo = Math.min(fit(scale.base * phoneRatio ** r.step * optical, r.mobileMax), hi);
    const slope = (hi - lo) / (DESKTOP - PHONE);
    const size = hi - lo < 0.5 ? px(hi) : `clamp(${px(lo)}, ${px(lo - slope * PHONE)} + ${+(slope * 100).toFixed(4)}vw, ${px(hi)})`;
    return `  --fs-${role}: ${size};\n  --lh-${role}: ${r.leading};\n  --tr-${role}: ${r.tracking};`;
  });
  return `:root {\n${lines.join('\n')}\n}`;
}

export function applyRatio(ratio: number, persist = false) {
  currentRatio = ratio;
  head<HTMLStyleElement>('scale-tokens', 'style').textContent = scaleCss(TYPE_SCALE, ratio, currentType);
  if (persist) {
    try {
      localStorage.setItem(RATIO_STORE, String(ratio));
    } catch {
      // storage blocked: the scale still applies for this visit
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export const getRatio = () => currentRatio;

export const googleFontsUrl = (t: Typography) =>
  t.google.length ? `https://fonts.googleapis.com/css2?${t.google.map((f) => `family=${f}`).join('&')}&display=swap` : null;

function head<T extends HTMLElement>(id: string, tag: string): T {
  let el = document.getElementById(id) as T | null;
  if (!el) {
    el = document.createElement(tag) as T;
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}

export function applyType(t: Typography, persist = false) {
  currentType = t;
  const url = googleFontsUrl(t);
  if (url) {
    const link = head<HTMLLinkElement>('type-fonts', 'link');
    link.rel = 'stylesheet';
    if (link.href !== url) link.href = url;
  } else {
    document.getElementById('type-fonts')?.remove();
  }
  head<HTMLStyleElement>('type-tokens', 'style').textContent = typeCss(t);
  head<HTMLStyleElement>('scale-tokens', 'style').textContent = scaleCss(TYPE_SCALE, currentRatio, t);
  if (persist) {
    try {
      localStorage.setItem(TYPE_STORE, t.name);
    } catch {
      // storage blocked: the fonts still apply for this visit
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export function applyPalette(p: Palette, persist = false) {
  current = deriveTheme(p);
  head<HTMLStyleElement>('palette-tokens', 'style').textContent = themeCss(current);
  setFavicon(current);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', current.palette.dark);
  if (persist) {
    try {
      localStorage.setItem(STORE, JSON.stringify(p));
    } catch {
      // storage blocked: the palette still applies for this visit
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Apply a named palette + typography combo (brand.json "themes"). */
export function applyCombo(name: string, persist = false) {
  const combo = findTheme(name);
  if (!combo) return;
  applyPalette(findPalette(combo.palette) ?? current.palette, persist);
  applyType(findType(combo.type) ?? currentType, persist);
}

/**
 * Starting brand: URL params first (?p / ?palette / ?type / ?theme), then (lab only) the last
 * one you tried, then the "active" palette and type.
 */
export function initPalette() {
  head<HTMLStyleElement>('font-faces', 'style').textContent = fontFacesCss();
  if (!labEnabled()) {
    applyPalette(current.palette);
    applyType(currentType);
    return;
  }
  const q = params();
  const combo = findTheme(q.get('theme'));
  let saved: Palette | undefined;
  let savedType: Typography | undefined;
  let savedRatio: number | undefined;
  if (labEnabled()) {
    try {
      saved = JSON.parse(localStorage.getItem(STORE) ?? 'null') ?? undefined;
      savedType = findType(localStorage.getItem(TYPE_STORE));
      savedRatio = Number(localStorage.getItem(RATIO_STORE)) || undefined;
    } catch {
      saved = undefined;
    }
  }
  applyPalette(paletteFromParam(q.get('p')) ?? findPalette(q.get('palette') ?? combo?.palette) ?? saved ?? current.palette);
  const urlRatio = Number(q.get('r'));
  currentRatio = TYPE_SCALE.ratios.some((r) => r.ratio === urlRatio) ? urlRatio : savedRatio ?? currentRatio;
  applyType(findType(q.get('type') ?? combo?.type) ?? savedType ?? currentType);
}

export const getTheme = () => current;
export const getType = () => currentType;

export function resetPalette() {
  try {
    localStorage.removeItem(STORE);
    localStorage.removeItem(TYPE_STORE);
    localStorage.removeItem(RATIO_STORE);
  } catch {
    // ignore
  }
  applyPalette(activePalette());
  currentRatio = ACTIVE_RATIO;
  applyType(activeType());
}

/** Re-renders when the typography or the scale changes. */
export function useBrandType(): Typography & { ratio: number } {
  const [type, setType] = useState({ ...currentType, ratio: currentRatio });
  useEffect(() => {
    const on = () => setType({ ...currentType, ratio: currentRatio });
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return type;
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
