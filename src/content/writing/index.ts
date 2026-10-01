// SOURCE OF TRUTH: the Writing section. One entry per article; the body is the Markdown file
// next to this one. Drafts render only on localhost (dev builds) and never ship: not on the page,
// not in the shell, not in the sitemap, not in the JS bundle. Set the post's DRAFT_* to false to publish.
import scheduling10m from './scheduling-10m-cron-jobs.md?raw';

export interface Post {
  slug: string;
  title: string;
  /** ISO yyyy-mm-dd */
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  body: string;
}

/**
 * Drafts must not ship. `import.meta.env.DEV` is a build-time constant, so in a production build
 * `import.meta.env.DEV || !DRAFT_X` folds to `false` for a draft: its whole entry (title, summary,
 * and the Markdown import) is dropped from the bundle, not just hidden. Keep each flag a literal.
 * To publish: set the post's DRAFT_* constant to false.
 */
const DRAFT_SCHEDULING = true;

const ALL: Post[] = [
  ...(import.meta.env.DEV || !DRAFT_SCHEDULING
    ? [
        {
          slug: 'scheduling-10m-cron-jobs',
          title: 'Scheduling *10M* cron jobs a day',
          date: '2026-10-01',
          summary:
            'Taking a serverless platform’s scheduler from hourly to per-minute: Redis sorted sets to find due jobs, batching to cut Kafka messages by 99.5%, and dispatch from 50ms to 5ms.',
          tags: ['Distributed systems', 'Kafka', 'Redis'],
          draft: DRAFT_SCHEDULING,
          body: scheduling10m,
        },
      ]
    : []),
];

/** What this build shows: everything on localhost, published posts only in production. */
export const POSTS: Post[] = ALL.filter((p) => import.meta.env.DEV || !p.draft).sort((a, b) => b.date.localeCompare(a.date));
export const PUBLISHED: Post[] = ALL.filter((p) => !p.draft);

export const postFor = (slug: string | undefined) => POSTS.find((p) => p.slug === slug);

/** ~220 words a minute, rounded up. */
export const readMinutes = (body: string) => Math.max(1, Math.ceil(body.split(/\s+/).length / 220));
