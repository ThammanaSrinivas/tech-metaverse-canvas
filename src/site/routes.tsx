import type { ComponentType } from 'react';
import type { PageId } from './pages';
import { whenIdle } from '@/lib/idle';
import { POSTS, type Article } from '@/content/writing';

/**
 * Page id → chunk loader. Typed as a full Record, so a page added to pages.ts without a component
 * here fails to compile. Each page is its own chunk, loaded by the router (route `lazy`).
 */
type Loader = () => Promise<{ default: ComponentType }>;

export const LOADERS: Record<PageId, Loader> = {
  work: () => import('@/pages/WorkPage'),
  writing: () => import('@/pages/WritingPage'),
  zenmode: () => import('@/pages/ZenModePage'),
  about: () => import('@/pages/AboutPage'),
  'time-machine': () => import('@/pages/TimeMachinePage'),
};

/**
 * Child routes of `nested` pages (`<path>/<slug>`), one per entry. Each loads everything it renders
 * (the page's chunk and the article's compiled body) before the router switches pages. Any other
 * address under the page is not found.
 */
export const CHILDREN: Partial<Record<PageId, { slug: string; load: Loader }[]>> = {
  writing: POSTS.filter((p): p is Article => p.kind === 'article').map((post) => ({
    slug: post.slug,
    load: async () => {
      const [{ default: WritingPost }, { default: tree }] = await Promise.all([import('@/pages/WritingPost'), post.tree()]);
      const ArticlePage = () => <WritingPost post={post} tree={tree} />;
      return { default: ArticlePage };
    },
  })),
};

/**
 * A route's `lazy` for React Router's data router: the router fetches the chunk *before* it
 * switches pages, so a view transition never captures a half-loaded page.
 */
export const lazyRoute = (load: Loader) => async () => ({ Component: (await load()).default });

/**
 * After the first page has painted, fetch every other page's (small) chunk in idle time, one per
 * idle slot, so clicking a link never waits on the network. The 3D scene (~200KB) is not preloaded:
 * it loads when the Time Machine opens, behind that page's own entrance animation.
 */
export function preloadPages() {
  // Respect data saver and slow connections; skip preloading entirely there.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return () => {};
  const queue = [...Object.values(LOADERS)];
  let cancel = () => {};
  const next = () => {
    const load = queue.shift();
    if (!load) return;
    cancel = whenIdle(() => {
      load().catch(() => {}).finally(next);
    }, 3000);
  };
  const start = setTimeout(next, 1500);
  return () => {
    clearTimeout(start);
    cancel();
  };
}
