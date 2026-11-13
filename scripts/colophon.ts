import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * The colophon's numbers (the Colophon chapter on /about), measured from the build itself so they
 * can't go stale. vite.config.ts turns the first two into constants every bundle shares; the
 * prerender (scripts/prerender.ts) measures the last once the pages exist.
 */

/** Where `npm run test:coverage` writes its results (package.json): the full suite, run on every build. */
export const TEST_RESULTS = 'node_modules/.cache/vitest-results.json';

/** How many tests the last full run passed, or null without a clean run to read (a failing build never gets this far). */
export function testCount(root: string): number | null {
  try {
    const r = JSON.parse(fs.readFileSync(path.join(root, TEST_RESULTS), 'utf8'));
    return r.success && r.numFailedTests === 0 && r.numTotalTests > 0 ? r.numTotalTests : null;
  } catch {
    return null;
  }
}

/**
 * How much lighter the fonts' core cuts are than the full files, in whole percent: every face in
 * src/theme/fontSubsets.json (npm run fonts:subset), sizes as they sit in public/.
 */
export function fontSaving(root: string): number | null {
  try {
    const subsets = JSON.parse(fs.readFileSync(path.join(root, 'src/theme/fontSubsets.json'), 'utf8')) as Record<string, { core?: string } | string>;
    let full = 0;
    let core = 0;
    for (const [file, cut] of Object.entries(subsets)) {
      if (typeof cut !== 'object' || !cut.core) continue;
      full += fs.statSync(path.join(root, 'public', file)).size;
      core += fs.statSync(path.join(root, 'public', cut.core)).size;
    }
    return full > 0 ? Math.round((1 - core / full) * 100) : null;
  } catch {
    return null;
  }
}

const brotli = (b: Buffer) => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

/**
 * What a first visit to a page weighs, compressed: its HTML plus every file its own tags ask for
 * (scripts, stylesheets, module and font preloads, and the pictures that load with the page).
 * Text is Brotli-compressed as a server would send it; fonts and pictures are compressed already,
 * so they count at their size. A picture limited to some screens (`<source media>`, the home
 * hero's portrait) counts, so the figure is the most a first visit weighs: the widest layout.
 * Lazy pictures, and chunks the app fetches later as the reader goes, aren't counted.
 */
export function firstVisitBytes(outDir: string, html: string): number {
  const wanted = new Set<string>();
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    const url = tag.match(/\b(?:src|href)="(\/[^"#?]+)/)?.[1];
    if (!url) continue;
    if (tag.startsWith('<script') || /\brel="(?:stylesheet|modulepreload|preload)"/.test(tag)) wanted.add(url);
  }
  // pictures: a <picture> is lazy if its <img> is; outside one, each <img> speaks for itself
  const lazy = (s: string) => /\bloading="lazy"/.test(s);
  const first = (tag: string) => tag.match(/\b(?:src|srcset)="(\/[^"#?\s,]+)/i)?.[1];
  const rest = html.replace(/<picture\b[\s\S]*?<\/picture>/g, (block) => {
    if (!lazy(block)) for (const [tag] of block.matchAll(/<(?:source|img)\b[^>]*>/g)) if (first(tag)) wanted.add(first(tag)!);
    return '';
  });
  for (const [tag] of rest.matchAll(/<img\b[^>]*>/g)) if (!lazy(tag) && first(tag)) wanted.add(first(tag)!);

  let bytes = brotli(Buffer.from(html));
  for (const url of wanted) {
    const file = path.join(outDir, url);
    if (!fs.existsSync(file)) continue;
    bytes += /\.(?:woff2|webp|avif|png|jpe?g|gif)$/.test(url) ? fs.statSync(file).size : brotli(fs.readFileSync(file));
  }
  return bytes;
}
