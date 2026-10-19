import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MENU_MOTION } from './menuMotion';

// The phone menu's rules, each one a flicker an iPhone showed (menuMotion.ts, Navigation.tsx).
const parts = Object.entries(MENU_MOTION);
const targets = (part: (typeof MENU_MOTION)[keyof typeof MENU_MOTION]) =>
  [part.initial, part.animate, part.exit].map(({ transition, ...values }: Record<string, unknown>) => values);

describe('phone menu', () => {
  it('animates only transform and opacity, which the compositor runs on its own', () => {
    for (const [name, part] of parts)
      for (const values of targets(part)) for (const key of Object.keys(values)) expect(`${name}.${key}`).toMatch(/\.(transform|opacity)$/);
  });

  it('exits from wherever it is: a target, never a keyframe list that restarts from fully open', () => {
    for (const [, part] of parts) for (const value of Object.values(targets(part)[2])) expect(Array.isArray(value)).toBe(false);
  });

  it('starts and ends the card fully hidden behind the bar', () => {
    const shift = (t: string) => Number(/^translateY\((-?[\d.]+)%\)$/.exec(t)?.[1]);
    expect(shift(MENU_MOTION.card.initial.transform)).toBeLessThanOrEqual(-100);
    expect(shift(MENU_MOTION.card.exit.transform)).toBeLessThanOrEqual(-100);
    expect(shift(MENU_MOTION.card.animate.transform)).toBe(0);
  });

  it('flashes no grey box over tapped buttons and links', () => {
    expect(readFileSync('src/index.css', 'utf8')).toMatch(/html\s*{[^}]*-webkit-tap-highlight-color:\s*transparent;/);
  });

  it('puts no fixed backdrop at the screen edges, where Safari 26 would paint its toolbars with it', () => {
    const nav = readFileSync('src/components/Navigation.tsx', 'utf8');
    const backdrop = /{\.\.\.MENU_MOTION\.backdrop}[\s\S]*?className="([^"]+)"/.exec(nav)?.[1].split(' ') ?? [];
    expect(backdrop).toContain('absolute');
    expect(backdrop).not.toContain('fixed');
  });
});
