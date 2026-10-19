import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MENU_MOTION, MODAL_MOTION, SHELL_MOTION } from './overlayMotion';

// The overlays' rules, each one a flicker an iPhone showed (overlayMotion.ts).
type Target = Record<string, unknown>;
type Part = { initial: Target; animate: Target; exit?: Target };
const parts: [string, Part][] = [
  ['menu.backdrop', MENU_MOTION.backdrop],
  ['menu.card', MENU_MOTION.card],
  ['shell', SHELL_MOTION],
  ['modal.backdrop', MODAL_MOTION.backdrop],
  ['modal.panel', MODAL_MOTION.panel],
];
const panels: [string, Part][] = [
  ['menu.card', MENU_MOTION.card],
  ['shell', SHELL_MOTION],
  ['modal.panel', MODAL_MOTION.panel],
];
const values = ({ transition, ...rest }: Target) => rest;
const targets = (part: Part) => [part.initial, part.animate, part.exit].filter(Boolean).map(values);
const read = (path: string) => readFileSync(path, 'utf8');

/** Every .tsx file of the site's own, outside the unused shadcn primitives in components/ui. */
const siteFiles = (dir = 'src'): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return path === join('src', 'components', 'ui') ? [] : siteFiles(path);
    return path.endsWith('.tsx') ? [path] : [];
  });

describe('overlays', () => {
  it('animate only transform and opacity, which the compositor runs on its own', () => {
    for (const [name, part] of parts)
      for (const target of targets(part)) for (const key of Object.keys(target)) expect(`${name}.${key}`).toMatch(/\.(transform|opacity)$/);
  });

  it('exit from wherever they are: a target, never a keyframe list that restarts from fully open', () => {
    for (const [, part] of parts) if (part.exit) for (const value of Object.values(values(part.exit))) expect(Array.isArray(value)).toBe(false);
  });

  it('show panels opaque from their first frame (fading one in shows the page through it)', () => {
    for (const [name, part] of panels) expect(`${name}: ${Object.keys(part.initial)}`).not.toMatch(/opacity/);
  });

  it('start and end the menu card fully hidden behind the bar', () => {
    const shift = (t: string) => Number(/^translateY\((-?[\d.]+)%\)$/.exec(t)?.[1]);
    expect(shift(MENU_MOTION.card.initial.transform)).toBeLessThanOrEqual(-100);
    expect(shift(MENU_MOTION.card.exit.transform)).toBeLessThanOrEqual(-100);
    expect(shift(MENU_MOTION.card.animate.transform)).toBe(0);
  });

  it('grow the shell from its bottom edge, which stays 8px clear of Safari’s bottom sample line', () => {
    expect(SHELL_MOTION.initial.transform).toMatch(/^scale\([\d.]+\)$/);
    const shell = /aria-label="Zen shell"[\s\S]*?className="([^"]+)"/.exec(read('src/components/ZenShell.tsx'))?.[1].split(' ') ?? [];
    expect(shell).toContain('origin-bottom');
    expect(shell).toContain('bottom-2');
  });

  it('put no dim in a fixed layer at the screen edges, where Safari 26 would paint its toolbars with it', () => {
    const files = ['src/components/Navigation.tsx', 'src/components/CodingDuel/index.tsx', 'src/components/ui/command.tsx'];
    for (const file of files) {
      const dims = [...read(file).matchAll(/{\.\.\.(?:MENU|MODAL)_MOTION\.backdrop}[\s\S]*?className="([^"]+)"/g)];
      expect(dims.length, file).toBe(1);
      const classes = dims[0][1].split(' ');
      expect(classes, file).toContain('absolute');
      expect(classes, file).not.toContain('fixed');
    }
  });

  it('cover the screen with no fixed layer anywhere on the site', () => {
    for (const file of siteFiles()) expect(read(file), file).not.toMatch(/\bfixed inset-0\b/);
  });

  it('flash no grey box over tapped buttons and links', () => {
    expect(read('src/index.css')).toMatch(/html\s*{[^}]*-webkit-tap-highlight-color:\s*transparent;/);
  });
});
