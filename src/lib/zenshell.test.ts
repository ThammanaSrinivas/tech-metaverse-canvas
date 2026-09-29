import { describe, expect, it } from 'vitest';
import { complete, resolvePath, runCommand } from './zenshell';
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

  it('lists, enters and reads the virtual filesystem', () => {
    expect(text('ls')).toContain('work/');
    expect(text('ls')).toContain('about.md');
    const cd = runCommand('cd work', ctx);
    expect(cd.cwd).toBe('~/work');
    expect(cd.effect).toEqual({ type: 'scroll', id: 'work' });
    const inWork = { history: [], cwd: '~/work' };
    expect(runCommand('ls', inWork).lines.map((l) => ('text' in l ? l.text : ''))).toEqual(['paypal.md', 'zoho.md']);
    expect(runCommand('cat paypal.md', inWork).lines[0]).toEqual({ kind: 'accent', text: expect.stringContaining('PayPal') });
    expect(runCommand('cat ../about.md', inWork).lines[0]).toEqual({ kind: 'accent', text: expect.stringContaining('Thammana') });
    expect(runCommand('cd ..', inWork).cwd).toBe('~');
    expect(text('cat work')).toContain('is a directory');
    expect(text('cat resume.pdf')).toContain('binary file');
  });

  it('refuses to leave home and resolves paths', () => {
    expect(resolvePath('~/lab', '../work')).toBe('~/work');
    expect(resolvePath('~', '..')).toBeNull();
    expect(text('cd ..')).toContain('nothing above ~');
  });

  it('greps across files and prints the tree', () => {
    expect(text('grep kafka')).toMatch(/work\/zoho\.md: .*Kafka/);
    expect(text('grep zzzz')).toContain('no matches');
    expect(text('tree')).toMatch(/4 directories, \d+ files/);
  });

  it('toggles stars and shows public ZenMode stats', () => {
    expect(runCommand('stars off', ctx).effect).toEqual({ type: 'stars', value: false });
    expect(runCommand('stars', ctx).effect).toEqual({ type: 'stars', value: 'toggle' });
    expect(text('stats')).toContain('of 711 on Product Hunt');
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
    expect(runCommand('cd', { history: [], cwd: '~/lab' })).toMatchObject({ cwd: '~', effect: { type: 'scroll', id: 'home' } });
    expect(text('cd nowhere')).toContain('no such directory');
  });

  it('filters work by company and reports unknown ones', () => {
    expect(text('work paypal')).toContain('PayPal');
    expect(text('work paypal')).not.toContain('Zoho');
    expect(text('work acme')).toContain("unknown company 'acme'");
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
    expect(complete('cat ab')).toBe('cat about.md');
    expect(complete('cat pay', { history: [], cwd: '~/work' })).toBe('cat paypal.md');
    expect(complete('t')).toBe('t'); // ambiguous: timemachine, top, tree
  });
});
