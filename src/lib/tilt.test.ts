import { describe, expect, it } from 'vitest';
import { LEAN, REST, tiltPose, type TiltState } from './tilt';

const resting: TiltState = { on: true, seen: true, wide: true, still: false, nx: 0, ny: 0 };
const square = { x: 0, y: 0 };

describe('the ZenMode phone at rest (ZenPhone.tsx)', () => {
  it('stands turned once it has been seen on a wide screen', () => {
    expect(tiltPose(resting)).toEqual(REST);
  });

  it('is square while a feature is framed or the pause runs: one thing moves at a time', () => {
    expect(tiltPose({ ...resting, on: false })).toEqual(square);
    // and the pointer cannot turn it then
    expect(tiltPose({ ...resting, on: false, nx: 1, ny: -1 })).toEqual(square);
  });

  it('is square until it has been seen, so the page’s HTML and the first render agree', () => {
    expect(tiltPose({ ...resting, seen: false })).toEqual(square);
  });

  it('is square under 1024px, where the phone is small and shares the screen', () => {
    expect(tiltPose({ ...resting, wide: false, nx: 1 })).toEqual(square);
  });

  it('is square under reduced motion, whatever the pointer does', () => {
    expect(tiltPose({ ...resting, still: true })).toEqual(square);
    expect(tiltPose({ ...resting, still: true, nx: -1, ny: 1 })).toEqual(square);
  });

  it('leans toward the pointer, and no further than its limit however far the pointer goes', () => {
    expect(tiltPose({ ...resting, nx: 1 }).y).toBe(REST.y + LEAN.y);
    expect(tiltPose({ ...resting, nx: -1 }).y).toBe(REST.y - LEAN.y);
    expect(tiltPose({ ...resting, ny: -1 }).x).toBe(REST.x + LEAN.x);
    expect(tiltPose({ ...resting, ny: 1 }).x).toBe(REST.x - LEAN.x);
    expect(tiltPose({ ...resting, nx: 40, ny: -40 })).toEqual(tiltPose({ ...resting, nx: 1, ny: -1 }));
  });

  it('never turns far enough to make the screen hard to read, and never flips to its other side', () => {
    for (const nx of [-1, -0.5, 0, 0.5, 1])
      for (const ny of [-1, 0, 1]) {
        const { x, y } = tiltPose({ ...resting, nx, ny });
        expect(Math.abs(y)).toBeLessThanOrEqual(20);
        expect(Math.abs(x)).toBeLessThanOrEqual(8);
        // the same edge always faces the reader: the lean is smaller than the resting turn
        expect(y).toBeLessThan(0);
        expect(x).toBeGreaterThan(0);
      }
  });
});
