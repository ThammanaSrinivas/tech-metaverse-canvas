import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, type Plugin, type ResolvedConfig } from 'vite';

/**
 * After `vite build`: one HTML file per URL, the page itself rendered into it, so the first paint
 * doesn't wait for the app, and crawlers that don't run scripts read the page. Each file carries:
 *   - the page's body, rendered by src/entry-server.tsx (React Router's static handler and
 *     react-dom/server, waiting for every lazy chunk), which the browser then hydrates (main.tsx);
 *   - the brand's <style> blocks (fonts, palette, type scale) that the runtime would otherwise
 *     inject from JS (theme/runtime.ts brandStyles), so that first paint is on brand;
 *   - a preload for each font its content uses (see fontPreloads), so none waits for the CSS;
 *   - its own <title>, description, address and social card (src/site/meta.ts). Link previews
 *     (LinkedIn, WhatsApp, Slack, X) read only the HTML, so without this every shared link
 *     previewed as the home page.
 *
 * The entry is built for Node first (a Vite SSR build with this same config, so the server's HTML
 * comes from the same code and transforms as the browser's), then run once per URL.
 *
 * Files are written as dist/<path>.html (dist/work.html, dist/writing/<slug>.html), which Firebase
 * serves at /work and /writing/<slug> with `cleanUrls`. Unknown URLs get dist/404.html: the
 * not-found page with the not-found meta and `noindex`, served with a real 404 status. It answers
 * every unknown address, so the browser renders over it rather than hydrating it (`data-not-found`).
 */
export function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'prerender',
    // the client build (not the SSR build it starts below), and `vite preview` of its output
    apply: (_, env) => (env.command === 'build' && !env.isSsrBuild) || !!env.isPreview,
    configResolved(resolved) {
      config = resolved;
    },
    // Preview serves dist/ the way Firebase does: /work → work.html (Vite already does that), and
    // an address with no file → 404.html with a 404 status. Vite's own fallback is the home page,
    // which the browser would then try to hydrate as some other page.
    configurePreviewServer(server) {
      const outDir = path.resolve(config.root, config.build.outDir);
      const isFile = (p: string) => fs.statSync(path.join(outDir, p), { throwIfNoEntry: false })?.isFile() ?? false;
      server.middlewares.use((req, res, next) => {
        let p: string;
        try {
          p = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname).replace(/(.)\/$/, '$1');
        } catch {
          return next(); // a malformed address: Vite's own handling
        }
        if (p === '/' || isFile(p) || isFile(`${p}.html`) || isFile(`${p}/index.html`)) return next();
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(fs.readFileSync(path.join(outDir, '404.html')));
      });
    },
    async closeBundle() {
      const serverDir = path.resolve(config.root, 'node_modules/.prerender');
      await build({
        configFile: config.configFile,
        mode: config.mode,
        logLevel: 'warn',
        build: {
          ssr: 'src/entry-server.tsx',
          outDir: serverDir,
          emptyOutDir: true,
          copyPublicDir: false,
          rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
        },
      });
      const site = (await import(pathToFileURL(path.join(serverDir, 'entry-server.mjs')).href)) as Site;

      const outDir = path.resolve(config.root, config.build.outDir);
      const styles = site
        .brandStyles()
        .map(([id, css]) => `<style id="${id}">${css}</style>`)
        .join('');
      const shell = swapOnce(fs.readFileSync(path.join(outDir, 'index.html'), 'utf8'), '</head>', `${styles}</head>`);
      const page = (meta: Meta, body: string, root = '<div id="root">') =>
        swapOnce(
          swapOnce(site.applyMetaToHtml(shell, meta), PRELOAD_SLOT, fontPreloads(body, site.fontFileFor)),
          '<div id="root"></div>',
          `${root}${body}</div>`
        );

      for (const m of site.ROUTE_META) {
        const file = path.join(outDir, m.path === '/' ? 'index.html' : `${m.path.slice(1)}.html`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, page(m, await site.render(m.path)));
      }
      fs.writeFileSync(path.join(outDir, '404.html'), page(site.notFoundMeta('/404'), await site.render('/404'), '<div id="root" data-not-found>'));
      fs.rmSync(serverDir, { recursive: true, force: true });
      config.logger.info(`prerender: ${site.ROUTE_META.length} pages rendered with their own title, description and social card, plus 404.html`);
    },
  };
}

/** A page's meta (src/site/meta.ts); the prerender only reads its path. */
type Meta = { path: string };
type FontRole = 'display' | 'accent' | 'sans' | 'mono';

/** What the prerender uses from the server build of src/entry-server.tsx. */
interface Site {
  render(path: string): Promise<string>;
  ROUTE_META: Meta[];
  applyMetaToHtml(html: string, meta: Meta): string;
  notFoundMeta(path: string): Meta;
  brandStyles(): [id: string, css: string][];
  fontFileFor(role: FontRole): string | undefined;
}

/** Where index.html wants the font preloads. */
const PRELOAD_SLOT = '<!-- font preloads: each built page gets the fonts its content uses (scripts/prerender.ts) -->';

/**
 * Preloads for the fonts a page's HTML uses, so each starts with the page rather than after the
 * CSS has arrived and laid the text out. Every page sets its headings and text in the display and
 * body fonts (and the hero is anchored to the bottom of the screen: a body font arriving late
 * re-wrapped its text and pushed the name up). The accent voice is preloaded where an `*accent*`
 * word is drawn, the mono where the page's own content (not the header's keycap) uses it.
 */
function fontPreloads(body: string, fileFor: Site['fontFileFor']) {
  const main = body.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
  const roles: FontRole[] = ['display', 'sans'];
  if (/\bzen-accent\b/.test(body)) roles.push('accent');
  if (/\b(?:font-mono|zen-label)\b|<(?:code|kbd|pre)\b/.test(main)) roles.push('mono');
  return roles.map((role) => `<link rel="preload" href="${fileFor(role)}" as="font" type="font/woff2" crossorigin />`).join('');
}

/** Replace the one `find` in `html`; throws if index.html no longer has exactly one. */
function swapOnce(html: string, find: string, to: string) {
  const at = html.indexOf(find);
  if (at < 0 || html.indexOf(find, at + 1) >= 0) throw new Error(`prerender: expected one ${find} in index.html`);
  return html.slice(0, at) + to + html.slice(at + find.length);
}
