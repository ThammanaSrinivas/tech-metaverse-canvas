import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/data/profile';
import { PERSON_LD, ROUTE_META, applyMetaToHtml, notFoundMeta, type Meta } from './meta';

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

  it('tells search engines who the site is about, on the home page only, with a photo that ships', () => {
    const home = applyMetaToHtml(indexHtml, ROUTE_META[0]);
    const block = home.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
    expect(JSON.parse(block!)).toMatchObject({ '@type': 'Person', name: PERSON_LD.name, sameAs: expect.arrayContaining([expect.stringContaining('linkedin.com')]) });
    expect(existsSync(`public${PERSON_LD.image.slice(SITE_URL.length)}`)).toBe(true);
    expect(applyMetaToHtml(indexHtml, ROUTE_META[1])).not.toContain('application/ld+json');
  });

  it('gives every article its publish date and a BlogPosting, and nothing else one', () => {
    const articles = ROUTE_META.filter((m) => m.type === 'article');
    expect(articles.length).toBeGreaterThan(0);
    for (const m of articles) {
      const html = applyMetaToHtml(indexHtml, m);
      expect(html).toContain(`<meta property="article:published_time" content="${m.published}"`);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((b) => JSON.parse(b[1]));
      expect(blocks).toContainEqual(expect.objectContaining({ '@type': 'BlogPosting', datePublished: m.published, url: `${SITE_URL}${m.path}` }));
    }
    for (const m of ROUTE_META.filter((m) => m.type !== 'article')) expect(applyMetaToHtml(indexHtml, m)).not.toContain('BlogPosting');
  });

  it('keeps the not-found page out of search results, and only that page', () => {
    const notFound = applyMetaToHtml(indexHtml, notFoundMeta('/404'));
    expect(notFound).toContain('<meta name="robots" content="noindex" />');
    expect(notFound).not.toContain('rel="canonical"');
    for (const m of ROUTE_META) expect(applyMetaToHtml(indexHtml, m)).not.toContain('noindex');
  });

  it('describes the social card for people who cannot see it, and colours the browser chrome', () => {
    for (const m of ROUTE_META) {
      const html = applyMetaToHtml(indexHtml, m);
      expect(html).toMatch(/<meta property="og:image:alt" content="[^"]+"/);
      expect(html).toMatch(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}"/);
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
