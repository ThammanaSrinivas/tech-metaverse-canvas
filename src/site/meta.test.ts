import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/data/profile';
import { ROUTE_META, applyMetaToHtml, type Meta } from './meta';

const indexHtml = readFileSync('index.html', 'utf8');

describe('page meta (link previews)', () => {
  it('prerenders exactly the URLs in sitemap.xml', () => {
    const sitemap = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(ROUTE_META.map((m) => `${SITE_URL}${m.path}`).sort()).toEqual(sitemap);
  });

  it('gives every URL its own title and description', () => {
    expect(new Set(ROUTE_META.map((m) => m.title)).size).toBe(ROUTE_META.length);
    expect(new Set(ROUTE_META.map((m) => m.description)).size).toBe(ROUTE_META.length);
  });

  it('points every social card at a file that ships', () => {
    for (const m of ROUTE_META) {
      expect(m.image.startsWith(`${SITE_URL}/`)).toBe(true);
      expect(existsSync(`public${m.image.slice(SITE_URL.length)}`), m.image).toBe(true);
    }
  });

  it('writes each page into the real index.html: title, description, address, card', () => {
    for (const m of ROUTE_META) {
      const html = applyMetaToHtml(indexHtml, m);
      expect(html).toContain(`<title>${m.title.replace(/&/g, '&amp;')}</title>`);
      expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${m.path}"`);
      expect(html).toContain(`<meta property="og:url" content="${SITE_URL}${m.path}"`);
      expect(html).toContain(`<meta property="og:image" content="${m.image}"`);
      expect(html).toContain(`<meta property="og:type" content="${m.type}"`);
      expect(html.match(/<title>/g)).toHaveLength(1);
    }
  });

  it('escapes text so a quote in a summary cannot break the HTML', () => {
    const m: Meta = { path: '/x', title: 'A "quoted" <b> & co', description: 'say "hi"', image: `${SITE_URL}/og-image.png`, type: 'article' };
    const html = applyMetaToHtml(indexHtml, m);
    expect(html).toContain('<title>A &quot;quoted&quot; &lt;b&gt; &amp; co</title>');
    expect(html).toContain('<meta name="description" content="say &quot;hi&quot;"');
  });

  it('fails loudly if index.html loses a tag, instead of shipping the home preview everywhere', () => {
    expect(() => applyMetaToHtml(indexHtml.replace(/<link rel="canonical"[^>]*>/, ''), ROUTE_META[0])).toThrow(/canonical/);
  });
});
