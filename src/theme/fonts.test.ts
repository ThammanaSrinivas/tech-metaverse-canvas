import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACTIVE_TYPE, FONT_CORE_RANGE, FONT_FACES, findType } from './palettes';
import { fontFacesCss, fontFileFor } from './runtime';

describe('fonts cut to the core characters', () => {
  const set = findType(ACTIVE_TYPE)!;
  const active = FONT_FACES.filter((f) => [set.display, set.accent, set.sans, set.mono].includes(f.family));

  it('has a core cut for every face of the active set, and every file ships (npm run fonts:subset)', () => {
    for (const f of active) {
      expect(f.core, `${f.file} has a core cut`).toBeTruthy();
      expect(existsSync(`public${f.core}`), f.core).toBe(true);
      expect(existsSync(`public${f.file}`), f.file).toBe(true);
    }
  });

  it('declares the core and the full file as one family, split by unicode-range', () => {
    const css = fontFacesCss();
    for (const f of active) {
      expect(css).toContain(`src: url("${f.core}") format("woff2");\n  font-weight: ${f.weight};\n  font-style: ${f.style ?? 'normal'};\n  font-display: swap;\n  unicode-range: ${FONT_CORE_RANGE};`);
      expect(css).toContain(`src: url("${f.file}") format("woff2");\n  font-weight: ${f.weight};\n  font-style: ${f.style ?? 'normal'};\n  font-display: swap;\n  unicode-range: ${f.rest};`);
    }
  });

  it('preloads the regular face of each voice, cut to the core', () => {
    for (const role of ['display', 'accent', 'sans', 'mono'] as const) expect(fontFileFor(role)).toMatch(/\.core\.woff2$/);
    expect(fontFileFor('mono')).toContain('Regular');
  });
});
