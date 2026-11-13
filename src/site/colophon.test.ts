import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';
import { COLOPHON } from '@/data/profile';
import { TEST_RESULTS, firstVisitBytes, fontSaving, testCount } from '../../scripts/colophon';

const ROOT = path.resolve(__dirname, '../..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'colophon-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const put = (rel: string, body: string | Buffer) => {
  const file = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};
const br = (b: string | Buffer) => zlib.brotliCompressSync(Buffer.from(b), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

describe('the colophon (About.tsx)', () => {
  it('weighs a first visit as the page and the files its own tags ask for, and nothing else', () => {
    const js = 'console.log("app");'.repeat(200);
    const css = 'body{margin:0}'.repeat(200);
    const font = Buffer.alloc(3000, 7);
    put('dist/assets/app.js', js);
    put('dist/assets/app.css', css);
    put('dist/fonts/body.core.woff2', font);
    put('dist/assets/later.js', 'a chunk loaded as the reader goes'.repeat(100));
    put('dist/favicon.svg', '<svg/>');
    const hero = Buffer.alloc(1400, 3);
    const logo = Buffer.alloc(500, 4);
    put('dist/about/hero.webp', hero);
    put('dist/logo.png', logo);
    put('dist/below.webp', Buffer.alloc(9000, 5));
    put('dist/later.webp', Buffer.alloc(9000, 6));
    const html = [
      '<html><head>',
      '<script type="module" crossorigin src="/assets/app.js"></script>',
      '<link rel="stylesheet" crossorigin href="/assets/app.css">',
      '<link rel="preload" href="/fonts/body.core.woff2" as="font" type="font/woff2" crossorigin />',
      '<link rel="icon" href="/favicon.svg">',
      '<script type="application/ld+json">{"@type":"Person"}</script>',
      '</head><body><a href="/assets/later.js">not a request</a>',
      // a picture that loads with the page counts, even one only wide screens fetch
      '<picture class="contents"><source media="(min-width: 1024px)" srcSet="/about/hero.webp"/><img alt="" width="384" height="480"/></picture>',
      '<img src="/logo.png" alt="">',
      // lazy pictures load as the reader goes
      '<picture><source srcset="/below.webp 640w"/><img alt="" loading="lazy"/></picture>',
      '<img src="/later.webp" alt="" loading="lazy">',
      '</body></html>',
    ].join('');
    // text is compressed as a server sends it; fonts and pictures are compressed already, so they count as they are
    expect(firstVisitBytes(path.join(tmp, 'dist'), html)).toBe(br(html) + br(js) + br(css) + font.length + hero.length + logo.length);
  });

  it('reads the test count only from a clean full run', () => {
    expect(testCount(path.join(tmp, 'no-run'))).toBeNull();
    put(`clean/${TEST_RESULTS}`, JSON.stringify({ success: true, numFailedTests: 0, numTotalTests: 42 }));
    expect(testCount(path.join(tmp, 'clean'))).toBe(42);
    put(`failed/${TEST_RESULTS}`, JSON.stringify({ success: false, numFailedTests: 1, numTotalTests: 42 }));
    expect(testCount(path.join(tmp, 'failed'))).toBeNull();
  });

  it('says how much the core font cuts save, from the files the site ships', () => {
    const saved = fontSaving(ROOT);
    expect(saved).toBeGreaterThan(0);
    expect(saved).toBeLessThan(100);
  });

  it('fills only the values About.tsx knows, and every value that can be missing has a fallback', () => {
    const known = ['pages', 'weight', 'fonts', 'fontSaving', 'palette', 'tests', 'source'];
    const mayBeMissing = ['fontSaving', 'tests'];
    for (const row of COLOPHON.rows) {
      const tokens = [...row.text.matchAll(/\{(\w+)\}/g)].map(([, k]) => k);
      for (const k of tokens) expect(known, `${row.term}: {${k}}`).toContain(k);
      if (tokens.some((k) => mayBeMissing.includes(k))) {
        expect(row.without, `${row.term} needs a without text`).toBeTruthy();
        for (const [, k] of row.without!.matchAll(/\{(\w+)\}/g)) expect(mayBeMissing, `${row.term}'s without still uses {${k}}`).not.toContain(k);
      }
    }
  });

  it('never claims the site was made by hand', () => {
    for (const row of COLOPHON.rows) expect(`${row.text} ${row.without ?? ''}`).not.toMatch(/by hand|hand-?(made|built|coded)/i);
  });
});
