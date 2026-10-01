import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/data/profile';
import { PAGES } from './pages';

describe('sitemap', () => {
  it('lists home and every page in the site map, and nothing else', () => {
    const xml = readFileSync('public/sitemap.xml', 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual([`${SITE_URL}/`, ...PAGES.map((p) => `${SITE_URL}${p.path}`)].sort());
  });
});
