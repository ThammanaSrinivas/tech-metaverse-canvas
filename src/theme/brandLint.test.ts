import { describe, expect, it } from 'vitest';
// plain ESM script shared with the CLI (scripts/check-brand.mjs)
import { findBrandViolations } from '../../scripts/brandLint.mjs';

describe('brand linter', () => {
  it('finds no colour outside colors.json and no font outside typography.json', () => {
    const hits = findBrandViolations() as { file: string; line: number; rule: string; text: string }[];
    expect(hits.map((h) => `${h.file}:${h.line} ${h.rule}: ${h.text}`)).toEqual([]);
  });
});
