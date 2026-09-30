// Derives the full design-token set from a five-colour Palette. Every text pairing is
// pushed to WCAG AA (4.5:1) by adjusting lightness only, so any palette you try stays
// readable; raw brand colours are kept for fills (stars, tiles, highlights).
import { bestOn, contrast, hslChannels, mix, readableOn, type Hex } from './color';
import type { Palette } from './palettes';

const WHITE = '#FFFFFF';
const RED = '#C0392B';

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

export function deriveTheme(p: Palette): Theme {
  return {
    palette: p,
    light: scope(p, 'light'),
    dark: scope(p, 'dark'),
    sky: [p.light, p.primary, p.secondary, p.highlight],
    monoTile: p.primary,
    monoInk: bestOn(p.primary, [p.dark, p.light]),
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
  ]
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${decl(t.light)}\n${shared}\n}\n.dark {\n${decl(t.dark)}\n}\n`;
}

/** Contrast report for the palette panel. */
export function contrastReport(t: Theme) {
  const rows: { label: string; ratio: number }[] = [];
  for (const [mode, s] of [['light', t.light], ['dark', t.dark]] as const) {
    rows.push({ label: `${mode}: text on page`, ratio: contrast(s.foreground, s.background) });
    rows.push({ label: `${mode}: accent text on page`, ratio: contrast(s.primary, s.background) });
    rows.push({ label: `${mode}: accent text on tint`, ratio: contrast(s.primary, s.tint) });
    rows.push({ label: `${mode}: muted text on card`, ratio: contrast(s.mutedForeground, s.card) });
    rows.push({ label: `${mode}: button label`, ratio: contrast(s.primaryForeground, s.primary) });
  }
  return rows;
}
