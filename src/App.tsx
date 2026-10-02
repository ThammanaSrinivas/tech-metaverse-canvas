import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { PAGES, REDIRECTS } from "@/site/pages";
import { CHILD_LOADERS, LOADERS, lazyRoute } from "@/site/routes";

const queryClient = new QueryClient();

// Data router (rather than <BrowserRouter>): it supports view transitions between pages, and its
// route `lazy` loads a page's chunk before switching, so the old page stays until the new one is ready.
const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      ...PAGES.map(({ id, path }) => ({ path, lazy: lazyRoute(LOADERS[id]) })),
      ...PAGES.filter((p) => p.nested && CHILD_LOADERS[p.id]).map(({ id, path }) => ({
        path: `${path}/:slug`,
        lazy: lazyRoute(CHILD_LOADERS[id]!),
      })),
      // retired addresses (firebase.json answers these with 301s too)
      ...Object.entries(REDIRECTS).map(([from, to]) => ({ path: from, element: <Navigate to={to} replace /> })),
      { path: "*", element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes, { future: { v7_relativeSplatPath: true } });

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
