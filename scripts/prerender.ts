import fs from 'node:fs';
import path from 'node:path';
import { createServer, type Plugin, type ResolvedConfig } from 'vite';

/**
 * After `vite build`: one HTML file per URL, each with its own <title>, description, address and
 * social card baked into <head> (from src/site/meta.ts). Link previews (LinkedIn, WhatsApp, Slack,
 * X) read only the HTML, so without this every shared link previewed as the home page.
 *
 * Files are written as dist/<path>.html (dist/work.html, dist/writing/<slug>.html), which Firebase
 * serves at /work and /writing/<slug> with `cleanUrls`. The body is unchanged: the app still
 * renders in the browser exactly as before. Unknown URLs still fall back to index.html (home).
 */
export function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'prerender-meta',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      // Load the site's own TypeScript (aliases, JSON, ?raw Markdown) through Vite rather than
      // duplicating the page list here.
      const server = await createServer({
        configFile: config.configFile,
        mode: config.mode,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, watch: { ignored: ['**/*'] } },
        // its own cache: sharing node_modules/.vite would re-optimise deps under a running dev
        // server, which then fails every request with "504 Outdated Optimize Dep"
        cacheDir: 'node_modules/.vite-prerender',
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      try {
        const { ROUTE_META, applyMetaToHtml } = (await server.ssrLoadModule('/src/site/meta.ts')) as typeof import('../src/site/meta');
        const outDir = path.resolve(config.root, config.build.outDir);
        const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
        for (const m of ROUTE_META) {
          const file = path.join(outDir, m.path === '/' ? 'index.html' : `${m.path.slice(1)}.html`);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, applyMetaToHtml(shell, m));
        }
        config.logger.info(`prerender: ${ROUTE_META.length} pages with their own title, description and social card`);
      } finally {
        await server.close();
      }
    },
  };
}
