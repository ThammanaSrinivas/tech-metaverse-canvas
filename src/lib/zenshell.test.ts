import { describe, expect, it } from 'vitest';
import { complete, runCommand } from './zenshell';
import { LINKS } from '@/data/profile';

const ctx = { history: [] as string[] };
const text = (cmd: string) =>
  runCommand(cmd, ctx).lines.map((l) => ('text' in l ? l.text : `<${l.kind}>`)).join('\n');

describe('zen shell', () => {
  it('lists visible commands in help and hides easter eggs', () => {
    const out = text('help');
    expect(out).toContain('neofetch');
    expect(out).toContain('breathe');
    expect(out).not.toContain('sudo');
  });

  it('ignores blank input', () => {
    expect(runCommand('   ', ctx)).toEqual({ lines: [] });
  });

  it('opens known links and rejects unknown ones', () => {
    expect(runCommand('open resume', ctx).effect).toEqual({ type: 'open', url: LINKS.resume });
    expect(runCommand('open ZenMode', ctx).effect).toEqual({ type: 'open', url: LINKS.zenmode });
    expect(runCommand('open nope', ctx).effect).toBeUndefined();
  });

  it('scrolls to sections, including via aliases', () => {
    expect(runCommand('cd lab', ctx).effect).toEqual({ type: 'scroll', id: 'lab' });
    expect(runCommand('goto contact', ctx).effect).toEqual({ type: 'scroll', id: 'contact' });
    expect(runCommand('cd ..', ctx).effect).toEqual({ type: 'scroll', id: 'home' });
    expect(text('cd nowhere')).toContain('no such section');
  });

  it('filters work by company and reports unknown ones', () => {
    expect(text('work paypal')).toContain('PayPal');
    expect(text('work paypal')).not.toContain('Zoho');
    expect(text('work acme')).toContain("unknown company 'acme'");
  });

  it('switches theme explicitly or toggles', () => {
    expect(runCommand('theme light', ctx).effect).toEqual({ type: 'theme', value: 'light' });
    expect(runCommand('theme', ctx).effect).toEqual({ type: 'theme', value: 'toggle' });
  });

  it('emits special blocks and effects', () => {
    expect(runCommand('neofetch', ctx).lines[0]).toEqual({ kind: 'neofetch' });
    expect(runCommand('breathe', ctx).lines[0]).toEqual({ kind: 'breathe' });
    expect(runCommand('duel', ctx).effect).toEqual({ type: 'duel' });
    expect(runCommand('clear', ctx).effect).toEqual({ type: 'clear' });
  });

  it('suggests the closest command for typos', () => {
    expect(text('neofetc')).toContain('did you mean `neofetch`');
    expect(text('xyzzyplugh')).toContain('try `help`');
  });

  it('prints history with 1-based numbering', () => {
    expect(runCommand('history', { history: ['ls', 'whoami'] }).lines).toEqual([
      { kind: 'out', text: '  1  ls' },
      { kind: 'out', text: '  2  whoami' },
    ]);
  });

  it('tab-completes command names and first arguments', () => {
    expect(complete('neo')).toBe('neofetch ');
    expect(complete('open lin')).toBe('open linkedin');
    expect(complete('work z')).toBe('work zoho');
    expect(complete('t')).toBe('t'); // ambiguous: theme, timemachine
  });
});
