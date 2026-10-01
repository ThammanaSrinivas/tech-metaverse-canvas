import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { PageId } from './pages';
import { whenIdle } from '@/lib/idle';

/**
 * Page id → chunk loader. Typed as a full Record, so a page added to pages.ts without a component
 * here fails to compile. Each page is its own chunk.
 */
const LOADERS: Record<PageId, () => Promise<{ default: ComponentType }>> = {
  zenmode: () => import('@/pages/ZenModePage'),
  work: () => import('@/pages/WorkPage'),
  writing: () => import('@/pages/WritingPage'),
  beyond: () => import('@/pages/BeyondPage'),
  lab: () => import('@/pages/LabPage'),
  'time-machine': () => import('@/pages/TimeMachinePage'),
  explore: () => import('@/pages/ExplorePage'),
  contact: () => import('@/pages/ContactPage'),
};

export const PAGE_COMPONENTS = Object.fromEntries(
  Object.entries(LOADERS).map(([id, load]) => [id, lazy(load)])
) as Record<PageId, LazyExoticComponent<ComponentType>>;

/** Child routes of `nested` pages (`<path>/:slug`). */
export const CHILD_COMPONENTS: Partial<Record<PageId, LazyExoticComponent<ComponentType>>> = {
  writing: lazy(() => import('@/pages/WritingPost')),
};


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
