import { createBrowserRouter, matchRoutes, Navigate, type RouteObject } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PageError from "./pages/PageError";
import { PAGES, REDIRECTS } from "@/site/pages";
import { CHILDREN, LOADERS, lazyRoute } from "@/site/routes";

// Data router (rather than <BrowserRouter>): it supports view transitions between pages, and its
// route `lazy` loads a page's chunk before switching, so the old page stays until the new one is ready.
// The same routes render every page to HTML at build time (src/entry-server.tsx).
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <PageError />,
    children: [
      {
        // a page that throws (or whose chunk is gone after a deploy) keeps the header and footer
        errorElement: <PageError />,
        children: [
          { path: "/", element: <Home /> },
          ...PAGES.map(({ id, path }) => ({ path, lazy: lazyRoute(LOADERS[id]) })),
          ...PAGES.filter((p) => p.nested).flatMap(({ id, path }) =>
            (CHILDREN[id] ?? []).map((child) => ({ path: `${path}/${child.slug}`, lazy: lazyRoute(child.load) }))
          ),
          // retired addresses (firebase.json answers these with 301s too)
          ...Object.entries(REDIRECTS).map(([from, to]) => ({ path: from, element: <Navigate to={to} replace /> })),
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
];

export const ROUTER_FUTURE = { v7_relativeSplatPath: true } as const;

/**
 * The browser's router, once the routes for this address have loaded: a page's HTML already shows
 * it, so the first render must be the page itself, not a moment of nothing while its chunk loads.
 * `ready` is false if a chunk would not load (the site was deployed again since this HTML was
 * served): that route stays lazy, so the router meets the same failure and PageError reloads once.
 */
export async function createRouter() {
  const lazy = matchRoutes(routes, window.location)?.filter((m) => m.route.lazy) ?? [];
  const loaded = await Promise.all(
    lazy.map(({ route }) =>
      route.lazy!().then(
        (page) => {
          Object.assign(route, { ...page, lazy: undefined });
          return true;
        },
        () => false
      )
    )
  );
  return { router: createBrowserRouter(routes, { future: ROUTER_FUTURE }), ready: loaded.every(Boolean) };
}
