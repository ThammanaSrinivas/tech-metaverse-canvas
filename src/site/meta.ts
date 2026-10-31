// SOURCE OF TRUTH: what each URL says about itself: <title>, description, address, social card.
// Used twice, from this one place:
//   runtime  usePageMeta applies it on every navigation (browser tabs, and Google, which runs the JS)
//   build    the prerender plugin (scripts/prerender.ts) writes one HTML file per URL with it baked
//            in, because link previews (LinkedIn, WhatsApp, Slack, X) read the HTML and never run JS
import { EDUCATION, JOBS, LINKS, PROFILE, SITE_URL, SPEAKING, ZENMODE } from '@/data/profile';
import { PUBLISHED_ARTICLES, type Article } from '@/content/writing';
import { plain } from '@/lib/rich';
import { ACTIVE_PALETTE, PALETTES } from '@/theme/palettes';
import { PAGES, type SitePage } from './pages';

export interface Meta {
  /** Path on this site, e.g. /writing/scheduling-10m-cron-jobs */
  path: string;
  title: string;
  description: string;
  /** Absolute URL of the 1200×630 social card. */
  image: string;
  type: 'website' | 'article';
  /** Articles: when it was published (ISO yyyy-mm-dd), for search engines' article cards. */
  published?: string;
  /** Pages that must not be indexed (the not-found page). */
  noindex?: boolean;
  /** The page's largest image, fetched from the HTML before the app renders it (its LCP). */
  preload?: { href: string; srcset?: string; sizes?: string };
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
/** Pages whose largest paint is an image the app would otherwise only discover after it renders. */
const PRELOAD: Record<string, Meta['preload']> = {
  '/zenmode': { href: ZENMODE.hero.src, srcset: ZENMODE.hero.srcset, sizes: ZENMODE.hero.sizes },
  '/about': { href: SPEAKING.photo },
};

export const pageMeta = (p: SitePage): Meta => ({ ...meta(p.path, p.title, p.lead), preload: PRELOAD[p.path] });
export const articleMeta = (a: Article): Meta => ({ ...meta(`/writing/${a.slug}`, a.title, a.summary, a.image, 'article'), published: a.date });
export const notFoundMeta = (path: string): Meta => ({ ...meta(path, 'Not found', PROFILE.intro), noindex: true });

/** What the social card shows, for people who can't see it (public/og-image.png: name, line, roles). */
const SITE_CARD_ALT = `${PROFILE.name}. ${PROFILE.line} Software engineer at PayPal, co-founder of ZenMode OS.`;
const imageAlt = (m: Meta) => (m.image.endsWith(SITE_CARD) ? SITE_CARD_ALT : m.title);

/** The browser chrome's colour on phones: the palette's dark, as the runtime sets it. */
const THEME_COLOR = (PALETTES.find((p) => p.name === ACTIVE_PALETTE) ?? PALETTES[0]).dark;

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
  { tag: 'meta', key: 'property', id: 'og:image:alt', attr: 'content', value: imageAlt },
  { tag: 'meta', key: 'name', id: 'twitter:title', attr: 'content', value: (m) => m.title },
  { tag: 'meta', key: 'name', id: 'twitter:description', attr: 'content', value: (m) => m.description },
  { tag: 'meta', key: 'name', id: 'twitter:image', attr: 'content', value: (m) => m.image },
  { tag: 'meta', key: 'name', id: 'twitter:image:alt', attr: 'content', value: imageAlt },
  { tag: 'meta', key: 'name', id: 'theme-color', attr: 'content', value: () => THEME_COLOR },
  { tag: 'link', key: 'rel', id: 'canonical', attr: 'href', value: (m) => `${SITE_URL}${m.path}` },
];

/** schema.org BlogPosting for an article: headline, date, author, card. */
const articleLd = (m: Meta) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: m.title.split(' · ')[0],
  description: m.description,
  datePublished: m.published,
  image: m.image,
  url: `${SITE_URL}${m.path}`,
  mainEntityOfPage: `${SITE_URL}${m.path}`,
  author: { '@type': 'Person', name: PROFILE.name, url: `${SITE_URL}/` },
});

/** A JSON data block (never executed, so the CSP's script-src does not apply); < escaped for safety. */
const ldBlock = (data: object) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Runtime: point the live document at this page. */
export function applyMetaToDocument(m: Meta) {
  document.title = m.title;
  // the theme colour is the runtime's to set (it follows the live palette)
  for (const t of TAGS) if (t.id !== 'theme-color') document.querySelector(`${t.tag}[${t.key}="${t.id}"]`)?.setAttribute(t.attr, t.value(m));
  // a not-found page tells crawlers that render JS not to index it
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (m.noindex && !robots) {
    robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.appendChild(robots);
  } else if (!m.noindex) robots?.remove();
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
  const extra = [
    m.path === '/' && ldBlock(PERSON_LD),
    m.type === 'article' && m.published && `<meta property="article:published_time" content="${m.published}" />${ldBlock(articleLd(m))}`,
    m.noindex && '<meta name="robots" content="noindex" />',
    m.preload &&
      `<link rel="preload" as="image" href="${m.preload.href}"${m.preload.srcset ? ` imagesrcset="${m.preload.srcset}" imagesizes="${m.preload.sizes}"` : ''} fetchpriority="high" />`,
  ].filter(Boolean);
  if (extra.length) out = swap(out, /<\/head>/g, `${extra.join('')}</head>`);
  for (const t of TAGS) {
    const head = `<${t.tag} ${t.key}="${t.id}" ${t.attr}="`;
    out = swap(out, new RegExp(`${escRe(head)}[^"]*"`, 'g'), `${head}${escHtml(t.value(m))}"`);
  }
  // a page that must not be indexed shouldn't name a canonical address either
  if (m.noindex) out = out.replace(/\s*<link rel="canonical"[^>]*>/, '');
  return out;
}
