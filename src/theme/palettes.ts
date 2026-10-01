// SOURCE OF TRUTH: every colour on the site lives in brand.json (palettes, system colours, the
// ZenMode brand) and nowhere else; `npm run lint:colors` fails on a colour literal anywhere else.
// Personal brand palettes and typography live there too.
//
// A palette is five colours in five roles. Everything else on the site (surfaces, borders,
// muted text, contrast-safe text shades, the dark sections, stars, shell, cursor, monogram)
// is derived from these in tokens.ts. A typography set is three font families (display, body,
// mono); font sizes come from one modular type scale (typeScale: base × ratio^step per role).
// A theme is a named palette + typography combo. To try something new, add an entry to
// brand.json (or use the lab panel on localhost and "Copy as JSON"), then set "active".
//
// The ZenMode section is not affected: it keeps the ZenMode OS brand (.zen in index.css).
import brand from './brand.json';

export interface Palette {
  name: string;
  /** Page background: the light neutral most of the page sits on. */
  light: string;
  /** Text colour and the dark sections (hero, Time Machine): the dark neutral. */
  dark: string;
  /** Brand accent: buttons, links, section numbers, key stats. */
  primary: string;
  /** Soft companion: tinted cards and chips, secondary stars. */
  secondary: string;
  /** Rare pop: progress bar, live dots, one "look here" moment. */
  highlight: string;
  /** What the palette says about the brand (shown in the lab). */
  why?: string;
}

export interface Typography {
  name: string;
  /** Headlines (h1–h3, section titles). */
  display: string;
  /** Accent voice: a contrasting italic for the *marked* word in a heading. Defaults to display. */
  accent?: string;
  /** All readable text. */
  sans: string;
  /** Numbers, labels, the shell. */
  mono: string;
  /** Google Fonts css2 family specs; empty when the fonts are vendored in public/fonts. */
  google: string[];
  /** Heading weight (h1–h3, font-display). Contrast with the body weight drives the hierarchy. */
  weight?: number;
  /** Optical size correction for headings (a serif with a small x-height needs >1). */
  displayScale?: number;
  why?: string;
}

export interface TypeRole {
  /** Power of the ratio: size = base × ratio^step (fractional steps allowed). */
  step: number;
  /** Desktop cap in px. */
  max?: number;
  /** Phone cap in px. */
  mobileMax?: number;
  /** Floor in px, so small text stays legible at steep ratios. */
  min?: number;
  leading: number;
  tracking: string;
}

export type TypeRoleName = 'display' | 'title' | 'h1' | 'h2' | 'h3' | 'lead' | 'body' | 'small' | 'label';

export interface TypeScale {
  base: number;
  ratios: { name: string; ratio: number }[];
  roles: Record<TypeRoleName, TypeRole>;
}

export interface Theme {
  name: string;
  palette: string;
  type: string;
}

/** The one-line idea and the values every design decision traces back to. */
export const BRAND: { idea: string; values: { name: string; means: string; rule: string }[] } = brand.brand;

/** Fixed, palette-independent colours (pure white/black light, error red, the cursor ink). */
export const SYSTEM = brand.system;

/** The ZenMode OS v3 brand: primitives + the semantic tokens of the .zen scope. */
export const ZENMODE_COLORS = brand.zenmode;

export const PALETTES: Palette[] = brand.palettes;
export const TYPOGRAPHY: Typography[] = brand.typography;
export const THEMES: Theme[] = brand.themes;
export const TYPE_SCALE: TypeScale = brand.typeScale as TypeScale;

/** What production ships with. */
export const ACTIVE_PALETTE = brand.active.palette;
export const ACTIVE_TYPE = brand.active.type;
export const ACTIVE_RATIO = brand.active.ratio;

const byName = <T extends { name: string }>(list: T[], n: string | null | undefined) =>
  list.find((x) => x.name.toLowerCase() === n?.toLowerCase());

export const findPalette = (n: string | null | undefined) => byName(PALETTES, n);
export const findType = (n: string | null | undefined) => byName(TYPOGRAPHY, n);
export const findTheme = (n: string | null | undefined) => byName(THEMES, n);
