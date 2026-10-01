import { describe, expect, it } from 'vitest';
import { parseRich, plain } from './rich';

describe('heading markup', () => {
  it('splits accent words out', () => {
    expect(parseRich('Beyond the *code*')).toEqual([
      { text: 'Beyond the ', accent: false },
      { text: 'code', accent: true },
    ]);
    expect(parseRich('Building *in public* daily').map((s) => s.accent)).toEqual([false, true, false]);
    expect(parseRich('No markup')).toEqual([{ text: 'No markup', accent: false }]);
  });

  it('strips markup for plain text', () => {
    expect(plain('Say *hi*')).toBe('Say hi');
  });
});
