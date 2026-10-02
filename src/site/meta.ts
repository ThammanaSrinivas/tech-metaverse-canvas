// SOURCE OF TRUTH: what each URL says about itself: <title>, description, address, social card.
// Used twice, from this one place:
//   runtime  usePageMeta applies it on every navigation (browser tabs, and Google, which runs the JS)
//   build    the prerender plugin (scripts/prerender.ts) writes one HTML file per URL with it baked
//            in, because link previews (LinkedIn, WhatsApp, Slack, X) read the HTML and never run JS
import { EDUCATION, JOBS, LINKS, PROFILE, SITE_URL } from '@/data/profile';
import { PUBLISHED_ARTICLES, type Article } from '@/content/writing';
import { plain } from '@/lib/rich';
import { PAGES, type SitePage } from './pages';

export interface Meta {
  /** Path on this site, e.g. /writing/scheduling-10m-cron-jobs */
  path: string;
  title: string;
  description: string;
  /** Absolute URL of the 1200×630 social card. */
  image: string;
  type: 'website' | 'article';
}

const SITE_CARD = '/og-image.png';

const meta = (path: string, title: string | null, description: string, image = SITE_CARD, type: Meta['type'] = 'website'): Meta => ({
  path,
  // the home page leads with who and where (it is what name searches and shared profile links show)
  title: title ? `${plain(title)} · ${PROFILE.name}` : `${PROFILE.name} · ${PROFILE.headline}`,
  description,
  image: `${SITE_URL}${image}`,
  type,
});

export const HOME_META = meta('/', null, PROFILE.intro);
export const pageMeta = (p: SitePage) => meta(p.path, p.title, p.lead);
export const articleMeta = (a: Article) => meta(`/writing/${a.slug}`, a.title, a.summary, a.image, 'article');
export const notFoundMeta = (path: string) => meta(path, 'Not found', PROFILE.intro);

const live = PAGES.filter((p) => !p.draft);

/** Every URL production serves (the same list as sitemap.xml). The build writes one HTML file each. */
export const ROUTE_META: Meta[] = [
  HOME_META,
  ...live.map(pageMeta),
  ...(live.some((p) => p.path === '/writing') ? PUBLISHED_ARTICLES.map(articleMeta) : []),
];

const current = JOBS.find((j) => j.current) ?? JOBS[0];

/**
 * Who the site is about, for search engines (schema.org Person, as JSON-LD on the home page): the
 * same facts the page shows, so a search for the name can show a photo, role and profiles.
 */
export const PERSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PROFILE.name,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}${PROFILE.portrait}`,
  jobTitle: current.role,
  worksFor: { '@type': 'Organization', name: current.company },
  alumniOf: { '@type': 'CollegeOrUniversity', name: EDUCATION.school.split(',')[0] },
  address: { '@type': 'PostalAddress', addressLocality: PROFILE.location.split(',')[0], addressCountry: 'IN' },
  email: LINKS.email,
  sameAs: [LINKS.linkedin, LINKS.github],
};

/** The tags in index.html that carry a page's meta, and which field fills each. */
const TAGS: { tag: 'meta' | 'link'; key: 'name' | 'property' | 'rel'; id: string; attr: 'content' | 'href'; value: (m: Meta) => string }[] = [
  { tag: 'meta', key: 'name', id: 'description', attr: 'content', value: (m) => m.description },
  { tag: 'meta', key: 'property', id: 'og:title', attr: 'content', value: (m) => m.title },
  { tag: 'meta', key: 'property', id: 'og:description', attr: 'content', value: (m) => m.description },
  { tag: 'meta', key: 'property', id: 'og:type', attr: 'content', value: (m) => m.type },
  { tag: 'meta', key: 'property', id: 'og:url', attr: 'content', value: (m) => `${SITE_URL}${m.path}` },
  { tag: 'meta', key: 'property', id: 'og:image', attr: 'content', value: (m) => m.image },
  { tag: 'meta', key: 'name', id: 'twitter:title', attr: 'content', value: (m) => m.title },
  { tag: 'meta', key: 'name', id: 'twitter:description', attr: 'content', value: (m) => m.description },
  { tag: 'meta', key: 'name', id: 'twitter:image', attr: 'content', value: (m) => m.image },
  { tag: 'link', key: 'rel', id: 'canonical', attr: 'href', value: (m) => `${SITE_URL}${m.path}` },
];

/** Runtime: point the live document at this page. */
export function applyMetaToDocument(m: Meta) {
  document.title = m.title;
  for (const t of TAGS) document.querySelector(`${t.tag}[${t.key}="${t.id}"]`)?.setAttribute(t.attr, t.value(m));
}

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build: the built index.html with this page's meta written in. Throws unless every tag is found
 * exactly once, so an edit to index.html can't silently ship pages with the home page's preview.
 */
export function applyMetaToHtml(html: string, m: Meta): string {
  const swap = (src: string, re: RegExp, to: string) => {
    const hits = src.match(re)?.length ?? 0;
    if (hits !== 1) throw new Error(`prerender: expected one ${re} in index.html, found ${hits}`);
    return src.replace(re, () => to);
  };
  let out = swap(html, /<title>[^<]*<\/title>/g, `<title>${escHtml(m.title)}</title>`);
  if (m.path === '/') {
    // a JSON data block (never executed, so the CSP's script-src does not apply); < escaped for safety
    const ld = JSON.stringify(PERSON_LD).replace(/</g, '\\u003c');
    out = swap(out, /<\/head>/g, `<script type="application/ld+json">${ld}</script></head>`);
  }
  for (const t of TAGS) {
    const head = `<${t.tag} ${t.key}="${t.id}" ${t.attr}="`;
    out = swap(out, new RegExp(`${escRe(head)}[^"]*"`, 'g'), `${head}${escHtml(t.value(m))}"`);
  }
  return out;
}
