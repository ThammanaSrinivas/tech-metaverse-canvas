/**
 * How the phone menu moves (Navigation.tsx). Rules, each one a flicker an iPhone showed:
 * - Only transform and opacity animate: the compositor runs both on its own, on iOS too. The card
 *   used to unroll with an animated clip-path, which WebKit runs on the main thread, and the clip
 *   hid the card's shadow until the end, when it popped in a frame later.
 * - The card is opaque and shadowed from its first frame (fading it in showed the page through it).
 *   It slides out from under the bar instead, starting fully hidden behind it (the bar is opaque
 *   and above it). Nothing clips it, so its shadow is never cut either.
 * - Exits name only their target, never a keyframe list: closing mid-open then turns around from
 *   wherever the card is, instead of jumping to fully open first.
 * The transform is a string rather than `y`, so framer-motion hands it to WAAPI (off the main thread).
 */
export const MENU_MOTION = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  card: {
    initial: { transform: 'translateY(-105%)' },
    animate: { transform: 'translateY(0%)' },
    // leaves with the backdrop, in the same 200ms
    exit: { transform: 'translateY(-105%)', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
    // An iOS sheet's curve: the whole card moves, so it must not start with a jump (the steeper
    // curve the clip used moved it ~75px in the first frame).
    transition: { duration: 0.34, ease: [0.32, 0.72, 0, 1] },
  },
} as const;
