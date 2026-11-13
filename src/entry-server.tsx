import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { ROUTER_FUTURE, routes } from './App';
import { SITE_URL } from '@/data/profile';

/**
 * Build only (scripts/prerender.ts): the HTML of the page at `path`, as the browser's first render
 * will draw it, so hydration takes it over as is. Everything a page loads lazily (its route's
 * chunk, a live diagram) is waited for: the HTML holds the whole page, not a loading state.
 */
export async function render(path: string): Promise<string> {
  const handler = createStaticHandler(routes, { future: ROUTER_FUTURE });
  const context = await handler.query(new Request(`${SITE_URL}${path}`));
  if (context instanceof Response) throw new Error(`prerender: ${path} answered ${context.status}, not a page`);
  const router = createStaticRouter(handler.dataRoutes, context, { future: ROUTER_FUTURE });
  return new Promise((resolve, reject) => {
    let failed: unknown;
    const stream = renderToPipeableStream(
      // hydrate={false}: no inline <script> with router state (the CSP allows none, and nothing here loads data)
      <StaticRouterProvider router={router} context={context} hydrate={false} />,
      {
        onAllReady() {
          if (failed) return reject(failed);
          const chunks: Buffer[] = [];
          const sink = new PassThrough();
          sink.on('data', (c: Buffer) => chunks.push(c));
          sink.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          stream.pipe(sink);
        },
        onShellError: reject,
        onError(error) {
          failed = error;
        },
      }
    );
  });
}

// what else the prerender needs, from the same build
export { ROUTE_META, applyMetaToHtml, notFoundMeta } from '@/site/meta';
export { brandStyles, fontFileFor } from '@/theme/runtime';
