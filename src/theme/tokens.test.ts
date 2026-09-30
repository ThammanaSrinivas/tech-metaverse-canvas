import { describe, expect, it } from 'vitest';
import { PALETTES, type Palette } from './palettes';
import { contrastReport, deriveTheme, themeCss } from './tokens';
import { contrast, readableOn } from './color';
import { autoAssign } from '@/components/PalettePanel';
import { paletteFromParam, paletteToParam } from './runtime';

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
    expect(contrast(readableOn('#2D63A5', ['#222725']), '#222725')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(readableOn('#E3884E', ['#FDFDFF']), '#FDFDFF')).toBeGreaterThanOrEqual(4.5);
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
    const calm = PALETTES[0];
    expect(paletteToParam(calm)).toBe('EDEBE6-403B33-94C7B6-D6E1C7-FE5D26');
    expect(paletteFromParam(paletteToParam(calm))).toEqual({ ...calm, name: 'Shared' });
  });

  it('ignores malformed params', () => {
    expect(paletteFromParam('EDEBE6-403B33')).toBeUndefined();
    expect(paletteFromParam('zzzzzz-403B33-94C7B6-D6E1C7-FE5D26')).toBeUndefined();
    expect(paletteFromParam(null)).toBeUndefined();
  });
});
