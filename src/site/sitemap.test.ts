import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/data/profile';
import { PUBLISHED_ARTICLES } from '@/content/writing';
import { PAGES, REDIRECTS } from './pages';

describe('sitemap', () => {
  it('lists exactly what production serves: home, published pages, published articles', () => {
    const xml = readFileSync('public/sitemap.xml', 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const live = PAGES.filter((p) => !p.draft).map((p) => p.path);
    // external entries live on other sites, so only articles hosted here belong in our sitemap
    const articles = live.includes('/writing') ? PUBLISHED_ARTICLES.map((p) => `/writing/${p.slug}`) : [];
    expect(locs).toEqual(['/', ...live, ...articles].map((path) => `${SITE_URL}${path}`).sort());
  });
});

describe('redirects', () => {
  // firebase.json is local (gitignored); when it is present, its 301s must match the app's list
  it.runIf(existsSync('firebase.json'))('firebase.json answers every retired address with the same 301 as the app', () => {
    const hosting = JSON.parse(readFileSync('firebase.json', 'utf8')).hosting;
    const served = Object.fromEntries((hosting.redirects ?? []).map((r: { source: string; destination: string }) => [r.source, r.destination]));
    expect(served).toEqual(REDIRECTS);
  });

  it('never redirects a live page away', () => {
    const live = new Set(PAGES.filter((p) => !p.draft).map((p) => p.path));
    for (const from of Object.keys(REDIRECTS)) expect(live.has(from), from).toBe(false);
  });
});
