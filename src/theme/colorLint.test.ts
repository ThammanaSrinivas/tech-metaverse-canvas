import { describe, expect, it } from 'vitest';
// plain ESM script shared with the CLI (scripts/check-colors.mjs)
import { findHardcodedColors } from '../../scripts/colorLint.mjs';

describe('colour linter', () => {
  it('finds no colour outside src/theme/brand.json', () => {
    const hits = findHardcodedColors() as { file: string; line: number; text: string }[];
    expect(hits.map((h) => `${h.file}:${h.line} ${h.text}`)).toEqual([]);
  });
});
