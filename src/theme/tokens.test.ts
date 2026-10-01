import { describe, expect, it } from 'vitest';
import { ACTIVE_PALETTE, ACTIVE_RATIO, ACTIVE_TYPE, FONT_FACES, PALETTES, THEMES, TYPE_SCALE, TYPOGRAPHY, findPalette, findType, type Palette } from './palettes';
import { contrastReport, deriveTheme, dotReads, themeCss } from './tokens';
import { asEmitted, contrast, readableOn } from './color';
import { autoAssign } from '@/components/PalettePanel';
import { googleFontsUrl, paletteFromParam, paletteToParam, scaleCss, typeCss } from './runtime';

// Deliberately awkward inputs: pale accents, a near-black primary, a mid-grey light neutral.
const AWKWARD: Palette[] = [
  { name: 'pastel', light: '#FFFFFF', dark: '#111111', primary: '#FFD1DC', secondary: '#E0F7FA', highlight: '#FFF59D' },
  { name: 'dark-primary', light: '#F5F5F5', dark: '#1A1A1A', primary: '#101820', secondary: '#C0C0C0', highlight: '#00FFFF' },
  { name: 'muddy', light: '#CFCBC4', dark: '#3A3A3A', primary: '#8A9A5B', secondary: '#B0A99F', highlight: '#FF7F50' },
];

describe('palette → tokens', () => {
  it.each([...PALETTES, ...AWKWARD].map((p) => [p.name, p] as const))('%s: every text pairing passes AA', (_, p) => {
    for (const row of contrastReport(deriveTheme(p))) expect(row.ratio, row.label).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the raw brand colour for fills and only shades text uses', () => {
    const t = deriveTheme(PALETTES.find((p) => p.name === 'Calm')!);
    expect(t.monoTile).toBe('#94C7B6');
    expect(t.light.primary).not.toBe('#94C7B6'); // 1.6:1 on ivory, so text gets a deeper sage
    expect(contrast(t.light.primary, t.light.tint)).toBeGreaterThanOrEqual(4.5);
  });

  it('emits both scopes and the shell skins', () => {
    const css = themeCss(deriveTheme(PALETTES[0]));
    expect(css).toMatch(/^:root \{/);
    expect(css).toContain('.dark {');
    expect(css).toContain('--shell-dark-bg');
    expect(css).toContain('--shell-light-accent');
  });

  it('readableOn lightens on dark grounds and darkens on light ones', () => {
    // measured as painted (after HSL rounding), which is what readableOn guarantees
    const painted = (a: string, b: string) => contrast(asEmitted(a), asEmitted(b));
    expect(painted(readableOn('#2D63A5', ['#222725']), '#222725')).toBeGreaterThanOrEqual(4.5);
    expect(painted(readableOn('#E3884E', ['#FDFDFF']), '#FDFDFF')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('palette panel auto-assign', () => {
  it('maps a Coolors paste to roles by lightness and saturation', () => {
    const roles = autoAssign('d44b00,e3884e,222725,fdfdff,98c1d9');
    expect(roles).toEqual({ light: '#FDFDFF', dark: '#222725', primary: '#D44B00', highlight: '#E3884E', secondary: '#98C1D9' });
  });

  it('needs five colours', () => {
    expect(autoAssign('#fff000, #000fff')).toBeNull();
  });
});

describe('share links', () => {
  it('round-trips a palette through the ?p= param', () => {
    const { why: _, ...calm } = findPalette('Calm')!;
    expect(paletteToParam(calm)).toBe('EDEBE6-403B33-94C7B6-D6E1C7-FE5D26');
    expect(paletteFromParam(paletteToParam(calm))).toEqual({ ...calm, name: 'Shared' });
  });

  it('ignores malformed params', () => {
    expect(paletteFromParam('EDEBE6-403B33')).toBeUndefined();
    expect(paletteFromParam('zzzzzz-403B33-94C7B6-D6E1C7-FE5D26')).toBeUndefined();
    expect(paletteFromParam(null)).toBeUndefined();
  });
});

describe('brand files (colors / typography / brand)', () => {
  it('names are unique and every combo points at a real palette and typography', () => {
    for (const list of [PALETTES, TYPOGRAPHY, THEMES]) expect(new Set(list.map((x) => x.name)).size).toBe(list.length);
    for (const c of THEMES) {
      expect(findPalette(c.palette), c.name).toBeDefined();
      expect(findType(c.type), c.name).toBeDefined();
    }
    expect(findPalette(ACTIVE_PALETTE)).toBeDefined();
    expect(findType(ACTIVE_TYPE)).toBeDefined();
  });

  it('every palette colour is a hex', () => {
    for (const p of PALETTES) for (const k of ['light', 'dark', 'primary', 'secondary', 'highlight'] as const) expect(p[k], `${p.name}.${k}`).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('typography emits font vars and a Google Fonts URL only when needed', () => {
    const zen = findType('Zen')!;
    expect(typeCss(zen)).toContain('--font-display: "Clash Display"');
    expect(googleFontsUrl(zen)).toBeNull();
    expect(googleFontsUrl(findType('Editorial')!)).toBe(
      'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap'
    );
  });
});

describe('type scale', () => {
  const sizes = (ratio: number, type = findType('Zen')!) => {
    const css = scaleCss(TYPE_SCALE, ratio, type);
    // desktop size = the clamp max (or the fixed value)
    return Object.fromEntries(
      [...css.matchAll(/--fs-(\w+): (?:clamp\([^,]+,[^,]+, )?([\d.]+)rem/g)].map((m) => [m[1], parseFloat(m[2]) * 16])
    );
  };

  it('the active ratio is one of the offered ratios', () => {
    expect(TYPE_SCALE.ratios.map((r) => r.ratio)).toContain(ACTIVE_RATIO);
  });

  it.each(TYPE_SCALE.ratios.map((r) => [r.name, r.ratio] as const))('%s keeps a strict hierarchy display > title > h1 > h2 > h3 ≥ lead > body > small > label', (_, ratio) => {
    for (const t of TYPOGRAPHY) {
      const s = sizes(ratio, t);
      expect(s.display).toBeGreaterThan(s.title);
      expect(s.title).toBeGreaterThan(s.h1);
      expect(s.h1).toBeGreaterThan(s.h2);
      expect(s.h2).toBeGreaterThan(s.h3);
      expect(s.h3).toBeGreaterThanOrEqual(s.lead);
      expect(s.lead).toBeGreaterThan(s.body);
      expect(s.body).toBeGreaterThan(s.small);
      expect(s.small).toBeGreaterThan(s.label);
      expect(s.body).toBe(16);
    }
  });

  it('labels stay legible (≥ 11px) at every ratio', () => {
    for (const r of TYPE_SCALE.ratios) expect(sizes(r.ratio).label).toBeGreaterThanOrEqual(11);
  });
});

describe('logo dot', () => {
  it('keeps the highlighter dot when brightness or hue sets it apart, and falls back otherwise', () => {
    expect(deriveTheme(findPalette('Calm Glow')!).monoDot).toBe('#FE5D26'); // orange on jade: 1.4:1, 150° apart
    expect(deriveTheme(findPalette('Calm')!).monoDot).toBe('#FE5D26');
    expect(dotReads('#5DBF9F', '#5BBF9E')).toBe(false); // same colour: no dot
    expect(dotReads('#9A9A9A', '#8C8C8C')).toBe(false); // greys: no hue to lean on
  });
});

describe('active typography', () => {
  it('declares all four voices, and every one of them has a vendored font file', () => {
    const set = findType(ACTIVE_TYPE)!;
    const voices = [set.display, set.accent, set.sans, set.mono];
    expect(voices.every(Boolean), 'display, accent, sans and mono are all set').toBe(true);
    for (const family of voices) expect(FONT_FACES.some((f) => f.family === family), `${family} has a font file`).toBe(true);
  });
});

describe('contrast as painted', () => {
  it('the Calm Glow pill (accent on tint, dark scope) clears 4.5 after HSL rounding', () => {
    const d = deriveTheme(findPalette('Calm Glow')!).dark;
    expect(contrast(asEmitted(d.primary), asEmitted(d.tint))).toBeGreaterThanOrEqual(4.5);
  });
});

