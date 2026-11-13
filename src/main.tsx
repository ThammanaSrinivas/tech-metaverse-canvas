import { RouterProvider } from 'react-router-dom'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createRouter } from './App.tsx'
import './index.css'
import { initPalette } from './theme/runtime'

// Tokens must exist before the first paint (the built pages carry them in <head> already).
initPalette();

const root = document.getElementById("root")!;

void createRouter().then(({ router, ready }) => {
  const app = <RouterProvider router={router} future={{ v7_startTransition: true }} />;
  // Built pages arrive rendered (scripts/prerender.ts): hydrate them. The dev server's page is
  // empty, and 404.html answers every unknown address, so its body (rendered for /404) can't match
  // the one being visited: those render from scratch, as does a page whose code didn't load.
  if (ready && root.hasChildNodes() && !root.hasAttribute('data-not-found')) hydrateRoot(root, app);
  else createRoot(root).render(app);
});
