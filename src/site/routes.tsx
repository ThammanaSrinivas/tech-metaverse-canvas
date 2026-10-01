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
  beyond: () => import('@/pages/BeyondPage'),
  lab: () => import('@/pages/LabPage'),
  'time-machine': () => import('@/pages/TimeMachinePage'),
  explore: () => import('@/pages/ExplorePage'),
  contact: () => import('@/pages/ContactPage'),
};

export const PAGE_COMPONENTS = Object.fromEntries(
  Object.entries(LOADERS).map(([id, load]) => [id, lazy(load)])
) as Record<PageId, LazyExoticComponent<ComponentType>>;

/** Heavy pieces inside pages, warmed up the same way. */
const EXTRAS = [() => import('@/components/CommitTimeMachine/CommitTimelineScene')];

/**
 * After the first page has painted, fetch every other page (and the 3D scene) in idle time, one per
 * idle slot, so clicking a link never waits on the network.
 */
export function preloadPages() {
  const queue = [...Object.values(LOADERS), ...EXTRAS];
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
