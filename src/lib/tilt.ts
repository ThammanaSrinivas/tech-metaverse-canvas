/**
 * The ZenMode phone's turn at rest (ZenPhone.tsx, useTilt), in degrees about its two axes. Kept
 * here, apart from the effect that reads the screen and the pointer, so its rules can be tested:
 * square unless everything allows the turn, and never turned so far that the screen is hard to read.
 */

/** The resting pose, and how far the pointer can lean it. 8° of turn was too little to see. */
export const REST = { x: 5, y: -14 };
export const LEAN = { x: 3, y: 5 };

export interface TiltState {
  /** Nothing else is moving the phone: no feature is framed, no pause is running. */
  on: boolean;
  /** It has been on screen once (the page's HTML has it square; it settles when first seen). */
  seen: boolean;
  /** 1024px and wider: below that the phone is small and shares the screen with the cards. */
  wide: boolean;
  /** The visitor asked for reduced motion. */
  still: boolean;
  /** Where the mouse pointer is from the phone's centre, −1…1 across half the window each way. */
  nx: number;
  ny: number;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** The turn for a state: (0, 0) is square to the reader. */
export function tiltPose({ on, seen, wide, still, nx, ny }: TiltState): { x: number; y: number } {
  if (!on || !seen || !wide || still) return { x: 0, y: 0 };
  return { x: REST.x - clamp(ny) * LEAN.x, y: REST.y + clamp(nx) * LEAN.y };
}
