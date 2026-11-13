/// <reference types="vite/client" />

/** The year the site was built (vite.config.ts): what the prerendered footer says until the page is live. */
declare const __BUILD_YEAR__: number;
/** Tests the last full run passed (vite.config.ts, scripts/colophon.ts); null without a clean run. For the colophon. */
declare const __TEST_COUNT__: number | null;
/** How much lighter the fonts' core cuts are than the full files, in whole percent; null if unmeasured. For the colophon. */
declare const __FONT_SAVING__: number | null;

/** An article compiled at build time (scripts/markdownTree.ts). */
declare module '*.md?tree' {
  const tree: import('@/lib/markdown').MdNode[];
  export default tree;
}
