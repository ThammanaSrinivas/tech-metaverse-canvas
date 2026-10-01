import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Live diagrams that articles can embed with a fenced block:
 *
 *   ```diagram
 *   admission-control
 *   ```
 *
 * Each is its own chunk, loaded only by the article that uses it.
 */
export const DIAGRAMS: Record<string, LazyExoticComponent<ComponentType>> = {
  'admission-control': lazy(() => import('./AdmissionControl')),
};
