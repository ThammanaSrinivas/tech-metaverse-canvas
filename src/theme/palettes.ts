// SOURCE OF TRUTH: personal brand palettes.
//
// A palette is five colours in five roles. Everything else on the site (surfaces, borders,
// muted text, contrast-safe text shades, the dark sections, stars, shell, cursor, monogram)
// is derived from these in tokens.ts. To try a new palette, add an entry here (or use the
// palette panel on localhost and "Copy as code"), then set ACTIVE_PALETTE.
//
// The ZenMode section is not affected: it keeps the ZenMode OS brand (.zen in index.css).

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
}

export const PALETTES: Palette[] = [
  { name: 'Calm', light: '#EDEBE6', dark: '#403B33', primary: '#94C7B6', secondary: '#D6E1C7', highlight: '#FE5D26' },
  { name: 'Bold', light: '#FDFDFF', dark: '#222725', primary: '#D44B00', secondary: '#E3884E', highlight: '#98C1D9' },
  { name: 'Bold · Baltic', light: '#FDFDFF', dark: '#222725', primary: '#D44B00', secondary: '#98C1D9', highlight: '#2D63A5' },
];

/** The palette production ships with. */
export const ACTIVE_PALETTE = 'Calm';
