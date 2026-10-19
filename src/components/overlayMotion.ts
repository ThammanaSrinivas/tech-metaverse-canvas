/**
 * How the overlays move: the phone menu (Navigation.tsx), the zen shell (ZenShell.tsx) and the
 * modals (the coding duel, the ⌘K palette). Rules, each one a flicker an iPhone showed:
 * - Only transform and opacity animate: the compositor runs both on its own, on iOS too. The card
 *   used to unroll with an animated clip-path, which WebKit runs on the main thread, and the clip
 *   hid the card's shadow until the end, when it popped in a frame later.
 * - Panels are opaque from their first frame and leave at once: fading one in or out showed the
 *   page (or the menu) through it. Only the dim behind a panel fades. The menu card slides out from
 *   under the bar instead, starting fully hidden behind it (the bar is opaque and above it).
 * - Exits name only their target, never a keyframe list: closing mid-open then turns around from
 *   wherever the card is, instead of jumping to fully open first.
 * - Nothing `fixed` crosses Safari's sample lines, 4px inside the top and bottom of the screen:
 *   Safari 26 paints its toolbars in the colour of a fixed box there, at once (WebKit's
 *   fixedContainerEdges). The shell rests 8px above the bottom but used to rise 24px into place, so
 *   it crossed the line on the way in and out and the bottom bar flashed dark. Dims are `absolute`
 *   over the whole document (Layout's root), which Safari never samples.
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

/** The shell grows from its own bottom edge (`origin-bottom`), so that edge never moves. */
export const SHELL_MOTION = {
  initial: { transform: 'scale(0.97)' },
  animate: { transform: 'scale(1)' },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
} as const;

export const MODAL_MOTION = {
  backdrop: MENU_MOTION.backdrop,
  // Settles 16px up; it keeps 16px or more off every edge, so it stays clear of the sample lines.
  panel: {
    initial: { transform: 'translateY(16px)' },
    animate: { transform: 'translateY(0px)' },
    // gone in the dim's first frame
    exit: { opacity: 0, transition: { duration: 0 } },
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

/** Reduced motion: no slide, no fade; an overlay is simply there, and simply gone. */
export const STILL = { initial: false, exit: undefined } as const;
