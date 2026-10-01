// Derives the full design-token set from a five-colour Palette. Every text pairing is
// pushed to WCAG AA (4.5:1) by adjusting lightness only, so any palette you try stays
// readable; raw brand colours are kept for fills (stars, tiles, highlights).
import { asEmitted, bestOn, contrast, hslChannels, mix, readableOn, rgbChannels, toHsl, type Hex } from './color';
import { SYSTEM, ZENMODE_COLORS, type Palette } from './palettes';

const WHITE = SYSTEM.white;
const RED = SYSTEM.danger;

/** One scope of tokens (light page or dark sections), as hex values. */
export interface Scope {
  background: Hex;
  foreground: Hex;
  card: Hex;
  popover: Hex;
  secondary: Hex;
  muted: Hex;
  mutedForeground: Hex;
  primary: Hex; // text-safe on background, card and tint
  primaryForeground: Hex;
  accent: Hex;
  accentForeground: Hex;
  destructive: Hex;
  destructiveForeground: Hex;
  border: Hex;
  tint: Hex;
  tintLine: Hex;
  reward: Hex; // text-safe highlight
  rewardSurface: Hex;
  highlight: Hex; // raw, for fills
}

export interface Theme {
  palette: Palette;
  light: Scope;
  dark: Scope;
  /** Raw colours for canvas/JS consumers. */
  sky: [Hex, Hex, Hex, Hex]; // bright, primary, secondary, highlight
  monoTile: Hex;
  monoInk: Hex;
  highlightInk: Hex; // text on a highlighter mark
  monoDot: Hex; // the logo's dot: the highlighter, unless it vanishes on the tile
}

function scope(p: Palette, mode: 'light' | 'dark'): Scope {
  const bg = mode === 'light' ? p.light : p.dark;
  const fg = mode === 'light' ? p.dark : p.light;
  // Surfaces step gently toward white on light pages, toward the text colour on dark ones.
  const card = mode === 'light' ? mix(bg, WHITE, 0.55) : mix(bg, fg, 0.05);
  const popover = mode === 'light' ? mix(bg, WHITE, 0.75) : mix(bg, fg, 0.08);
  const secondary = mix(bg, fg, mode === 'light' ? 0.06 : 0.07);
  const border = mix(bg, fg, mode === 'light' ? 0.13 : 0.16);
  const tint = mix(bg, p.secondary, mode === 'light' ? 0.55 : 0.16);
  const tintLine = mix(tint, fg, 0.12);
  const surfaces = [bg, card, tint];

  const primary = readableOn(p.primary, surfaces);
  const reward = readableOn(p.highlight, [bg, card]);
  const mutedForeground = readableOn(mix(fg, bg, 0.42), [bg, card, secondary]);
  const destructive = readableOn(mode === 'light' ? RED : mix(RED, WHITE, 0.45), [bg, card]);

  return {
    background: bg,
    foreground: readableOn(fg, [bg, card, tint], 7),
    card,
    popover,
    secondary,
    muted: secondary,
    mutedForeground,
    primary,
    primaryForeground: bestOn(primary, [p.light, p.dark]),
    accent: tint,
    accentForeground: primary,
    destructive,
    destructiveForeground: bestOn(destructive, [p.light, p.dark]),
    border,
    tint,
    tintLine,
    reward,
    rewardSurface: mix(bg, p.highlight, mode === 'light' ? 0.12 : 0.14),
    highlight: p.highlight,
  };
}

/**
 * Does the highlighter dot stand out on the logo tile? A dot isn't text: enough brightness
 * contrast works, and so does a clearly different, saturated hue (orange on jade is ~1.4:1 by
 * luminance yet unmistakable).
 */
export function dotReads(dot: Hex, tile: Hex): boolean {
  if (contrast(dot, tile) >= 1.6) return true;
  const [h1, s1] = toHsl(dot);
  const [h2, s2] = toHsl(tile);
  const hueGap = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  return contrast(dot, tile) >= 1.2 && hueGap >= 60 && s1 >= 0.35 && s2 >= 0.25;
}

export function deriveTheme(p: Palette): Theme {
  return {
    palette: p,
    light: scope(p, 'light'),
    dark: scope(p, 'dark'),
    sky: [p.light, p.primary, p.secondary, p.highlight],
    monoTile: p.primary,
    monoInk: bestOn(p.primary, [p.dark, p.light]),
    highlightInk: bestOn(p.highlight, [p.dark, p.light, SYSTEM.black, SYSTEM.white]),
    monoDot: dotReads(p.highlight, p.primary) ? p.highlight : bestOn(p.primary, [p.dark, p.light]),
  };
}

const VARS: [keyof Scope, string][] = [
  ['background', 'background'], ['foreground', 'foreground'],
  ['card', 'card'], ['foreground', 'card-foreground'],
  ['popover', 'popover'], ['foreground', 'popover-foreground'],
  ['primary', 'primary'], ['primaryForeground', 'primary-foreground'],
  ['secondary', 'secondary'], ['foreground', 'secondary-foreground'],
  ['muted', 'muted'], ['mutedForeground', 'muted-foreground'],
  ['accent', 'accent'], ['accentForeground', 'accent-foreground'],
  ['destructive', 'destructive'], ['destructiveForeground', 'destructive-foreground'],
  ['border', 'border'], ['border', 'input'], ['primary', 'ring'],
  ['tint', 'tint'], ['tintLine', 'tint-line'],
  ['reward', 'reward'], ['rewardSurface', 'reward-surface'],
  ['primary', 'node'], ['highlight', 'highlight'],
];

/** Shell skins: the terminal takes the opposite scope of the ground it floats over. */
const shellVars = (prefix: string, s: Scope) =>
  [
    [`--shell-${prefix}-bg`, s.popover],
    [`--shell-${prefix}-raised`, s.secondary],
    [`--shell-${prefix}-line`, s.border],
    [`--shell-${prefix}-text`, s.foreground],
    [`--shell-${prefix}-muted`, s.mutedForeground],
    [`--shell-${prefix}-accent`, s.primary],
    [`--shell-${prefix}-reward`, s.reward],
    [`--shell-${prefix}-error`, s.destructive],
  ] as const;

/** CSS text for the <style> that carries the active theme. */
export function themeCss(t: Theme): string {
  const decl = (s: Scope) => VARS.map(([k, name]) => `  --${name}: ${hslChannels(s[k])};`).join('\n');
  const shared = [
    ...shellVars('dark', t.dark),
    ...shellVars('light', t.light),
    ['--ink-hex', t.palette.dark],
    ['--paper-hex', t.palette.light],
    ['--highlight-ink', t.highlightInk],
    // pure light and shadow for the surface finish, the cursor's resting ink
    ['--white-rgb', rgbChannels(SYSTEM.white)],
    ['--black-rgb', rgbChannels(SYSTEM.black)],
    ['--cursor-hex', SYSTEM.cursor],
  ]
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${decl(t.light)}\n${shared}\n}\n.dark {\n${decl(t.dark)}\n}\n${zenCss()}`;
}

/** Contrast report for the palette panel. */
/** Every text pairing, measured on the colours as painted (rounded HSL), which is what users see. */
export function contrastReport(t: Theme) {
  const c = (a: Hex, b: Hex) => contrast(asEmitted(a), asEmitted(b));
  const rows: { label: string; ratio: number }[] = [];
  for (const [mode, s] of [['light', t.light], ['dark', t.dark]] as const) {
    rows.push({ label: `${mode}: text on page`, ratio: c(s.foreground, s.background) });
    rows.push({ label: `${mode}: accent text on page`, ratio: c(s.primary, s.background) });
    rows.push({ label: `${mode}: accent text on tint`, ratio: c(s.primary, s.tint) });
    rows.push({ label: `${mode}: muted text on card`, ratio: c(s.mutedForeground, s.card) });
    rows.push({ label: `${mode}: button label`, ratio: c(s.primaryForeground, s.primary) });
  }
  rows.push({ label: 'text on highlighter', ratio: c(t.highlightInk, t.palette.highlight) });
  return rows;
}

/** The ZenMode OS scope (.zen): fixed product brand, independent of the personal palette. */
export function zenCss(): string {
  const vars = Object.entries(ZENMODE_COLORS.tokens).map(([k, v]) => `  --${k}: ${hslChannels(v)};`);
  return `.zen {\n${vars.join('\n')}\n}\n`;
}
