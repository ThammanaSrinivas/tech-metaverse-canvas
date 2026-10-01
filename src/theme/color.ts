// Small colour toolkit for the palette generator: hex ↔ rgb/hsl, mixing, WCAG contrast,
// and "shade until readable" searches that keep a colour's hue and saturation.

import { SYSTEM } from './palettes';

export type Hex = string;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function toRgb(hex: Hex): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

export function toHex([r, g, b]: [number, number, number]): Hex {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function isHex(v: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

export function normalizeHex(v: string): Hex {
  const h = v.trim().replace('#', '');
  return toHex(toRgb(h.length === 3 ? h : h.slice(0, 6)));
}

/** h in degrees, s/l in 0..1 */
export function toHsl(hex: Hex): [number, number, number] {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

export function fromHsl(h: number, s: number, l: number): Hex {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

/** CSS custom-property form used by the shadcn/Tailwind tokens: "161 28% 32%". */
export function hslChannels(hex: Hex): string {
  const [h, s, l] = toHsl(hex);
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function rgbChannels(hex: Hex): string {
  return toRgb(hex).join(' ');
}

/** Linear blend in sRGB: t=0 → a, t=1 → b. */
export function mix(a: Hex, b: Hex, t: number): Hex {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t) as [number, number, number]);
}

export function luminance(hex: Hex): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Hex, b: Hex): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const isDark = (hex: Hex) => luminance(hex) < 0.18;

/**
 * Move a colour's lightness (keeping hue/saturation) until it reaches `min` contrast
 * against every background. Darkens on light grounds, lightens on dark ones.
 */
export function readableOn(color: Hex, backgrounds: Hex[], min = 4.5): Hex {
  const passes = (c: Hex) => backgrounds.every((bg) => contrast(c, bg) >= min);
  if (passes(color)) return color;
  const [h, s, l] = toHsl(color);
  const lighten = backgrounds.every(isDark);
  for (let step = 1; step <= 100; step++) {
    const c = fromHsl(h, s, clamp01(l + (lighten ? 1 : -1) * step * 0.01));
    if (passes(c)) return c;
  }
  return lighten ? SYSTEM.white : SYSTEM.black;
}

/** Whichever of the candidates reads best on the background. */
export function bestOn(bg: Hex, candidates: Hex[]): Hex {
  return candidates.reduce((best, c) => (contrast(c, bg) > contrast(best, bg) ? c : best));
}
