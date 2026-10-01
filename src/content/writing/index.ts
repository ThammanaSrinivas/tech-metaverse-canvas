// SOURCE OF TRUTH: the Writing section. Two kinds of entry:
//   article   hosted here: the body is the Markdown file next to this one, at /writing/<slug>
//   external  published elsewhere (e.g. zenmodeos.com): listed here, opens the original in a new tab
// Drafts render only on localhost (dev builds) and never ship: not on the page, not in the shell,
// not in the sitemap, not in the JS bundle. Set the post's DRAFT_* to false to publish.
import scheduling10m from './scheduling-10m-cron-jobs.md?raw';

interface PostBase {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  draft: boolean;
}

export interface Article extends PostBase {
  kind: 'article';
  /** ISO yyyy-mm-dd */
  date: string;
  body: string;
  /** Social card for link previews, 1200×630, under public/. Without one, the site's card is used. */
  image?: string;
}

export interface ExternalPost extends PostBase {
  kind: 'external';
  href: string;
  /** Where it is published, shown instead of a read time from our own Markdown. */
  site: string;
  /** Approximate reading time of the original. */
  minutes: number;
  /** ISO yyyy-mm-dd, when known. */
  date?: string;
  /** Co-authors, if any. */
  with?: string;
}

export type Post = Article | ExternalPost;

/**
 * Drafts must not ship. `import.meta.env.DEV` is a build-time constant, so in a production build
 * `import.meta.env.DEV || !DRAFT_X` folds to `false` for a draft: its whole entry (title, summary,
 * and the Markdown import) is dropped from the bundle, not just hidden. Keep each flag a literal.
 */
const DRAFT_SCHEDULING = false;

const ALL: Post[] = [
  ...(import.meta.env.DEV || !DRAFT_SCHEDULING
    ? [
        {
          kind: 'article' as const,
          slug: 'scheduling-10m-cron-jobs',
          title: 'Scheduling *10M* cron jobs a day',
          date: '2026-10-01',
          summary:
            'Taking a serverless platform’s scheduler from hourly to per-minute for every user: one if-condition that cut Kafka messages by 99.5%, persistent queues so no job is lost, and code clean enough that a race-condition fix took two lines.',
          tags: ['Distributed systems', 'Kafka', 'Leadership'],
          draft: DRAFT_SCHEDULING,
          body: scheduling10m,
          image: '/og/scheduling-10m-cron-jobs.png',
        },
      ]
    : []),
  {
    kind: 'external',
    slug: 'zenmode-our-story',
    title: 'Our *story*: building ZenMode OS',
    summary:
      'Two strangers at FOSS United, one text message, and an Android launcher built on one idea: make the healthier choice easier than the impulsive one.',
    tags: ['Product', 'Android', 'Open source'],
    href: 'https://zenmodeos.com/story/index.html',
    site: 'zenmodeos.com',
    minutes: 5,
    with: 'Kamalraaj Senthilkumar',
    draft: false,
  },
];

const byDate = (a: Post, b: Post) => (b.date ?? '').localeCompare(a.date ?? '');

/** What this build lists: everything on localhost, published entries only in production. */
export const POSTS: Post[] = ALL.filter((p) => import.meta.env.DEV || !p.draft).sort(byDate);
export const PUBLISHED: Post[] = ALL.filter((p) => !p.draft);
/** Articles hosted on this site (each has its own /writing/<slug> page). */
export const PUBLISHED_ARTICLES: Article[] = PUBLISHED.filter((p): p is Article => p.kind === 'article');

/** An article hosted here, by slug (external entries have no page of their own). */
export const postFor = (slug: string | undefined): Article | undefined =>
  POSTS.find((p): p is Article => p.kind === 'article' && p.slug === slug);

/** ~220 words a minute, rounded up. */
export const readMinutes = (body: string) => Math.max(1, Math.ceil(body.split(/\s+/).length / 220));
export const minutesOf = (p: Post) => (p.kind === 'article' ? readMinutes(p.body) : p.minutes);
