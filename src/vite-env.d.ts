/// <reference types="vite/client" />

/** The year the site was built (vite.config.ts): what the prerendered footer says until the page is live. */
declare const __BUILD_YEAR__: number;

/** An article compiled at build time (scripts/markdownTree.ts). */
declare module '*.md?tree' {
  const tree: import('@/lib/markdown').MdNode[];
  export default tree;
}
