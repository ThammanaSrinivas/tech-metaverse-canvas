// SOURCE OF TRUTH for the brand lives in three JSON files next to this one:
//   colors.json      every colour: personal palettes, system colours, the ZenMode OS brand
//   typography.json  every font: font files, typography sets, ZenMode fonts, the type scale
//   brand.json       what the brand means: the one-line idea, the values, lab combos
// This module only types and indexes them. `npm run lint:brand` fails on a colour or font name
// written anywhere else.
//
// A palette is five colours in five roles; everything else (surfaces, borders, contrast-safe
// text, dark sections, stars, shell, cursor, logo) is derived in tokens.ts. A typography set is
// display / accent / body / mono; sizes come from one modular scale (base × ratio^step per role).
// The ZenMode section keeps the ZenMode OS brand (.zen scope), from the same two files.
import colors from './colors.json';
import typography from './typography.json';
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
export const SYSTEM = colors.system;

/** The ZenMode OS v3 brand: primitives + the semantic tokens of the .zen scope. */
export const ZENMODE_COLORS = colors.zenmode;

export const PALETTES: Palette[] = colors.palettes;
export const TYPOGRAPHY: Typography[] = typography.sets;
export const THEMES: Theme[] = brand.themes;
export const TYPE_SCALE: TypeScale = typography.scale as TypeScale;

export interface FontFace {
  family: string;
  /** Path under public/. */
  file: string;
  /** A weight or a variable range, e.g. "400" or "200 800". */
  weight: string;
  style?: 'italic' | 'normal';
}
/** Every vendored font file; @font-face rules are generated from these (runtime.ts). */
export const FONT_FACES: FontFace[] = typography.faces as FontFace[];

/** Generic families appended after each brand font, per role. */
export const FONT_FALLBACKS: { display: string; accent: string; sans: string; mono: string } = typography.fallbacks;

/** The ZenMode OS fonts for the .zen scope. */
export const ZENMODE_TYPE: { display: string; sans: string; mono: string; weight: number } = typography.zenmode;

/** What production ships with. */
export const ACTIVE_PALETTE = colors.active;
export const ACTIVE_TYPE = typography.active.set;
export const ACTIVE_RATIO = typography.active.ratio;

const byName = <T extends { name: string }>(list: T[], n: string | null | undefined) =>
  list.find((x) => x.name.toLowerCase() === n?.toLowerCase());

export const findPalette = (n: string | null | undefined) => byName(PALETTES, n);
export const findType = (n: string | null | undefined) => byName(TYPOGRAPHY, n);
export const findTheme = (n: string | null | undefined) => byName(THEMES, n);
