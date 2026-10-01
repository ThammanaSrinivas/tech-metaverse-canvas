import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/data/profile';
import { PUBLISHED } from '@/content/writing';
import { PAGES } from './pages';

describe('sitemap', () => {
  it('lists exactly what production serves: home, published pages, published articles', () => {
    const xml = readFileSync('public/sitemap.xml', 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const live = PAGES.filter((p) => !p.draft).map((p) => p.path);
    const articles = live.includes('/writing') ? PUBLISHED.map((p) => `/writing/${p.slug}`) : [];
    expect(locs).toEqual(['/', ...live, ...articles].map((path) => `${SITE_URL}${path}`).sort());
  });
});
