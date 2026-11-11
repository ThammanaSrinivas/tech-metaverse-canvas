import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from '@/entry-server';
import { ROUTE_META } from './meta';

// What scripts/prerender.ts writes into each page's HTML (it runs on every build; this checks the
// render itself, quickly, without one).
describe('pages rendered to HTML', () => {
  // jsdom gives these tests a window, so Layout's browser-only layout effect is the real one here
  // and React's server renderer warns about it; the build renders without a window.
  beforeAll(() => {
    const error = console.error;
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (!String(args[0]).includes('useLayoutEffect does nothing on the server')) error(...args);
    });
  });

  it('renders every page whole: its header, its content, and no inline script (the CSP allows none)', async () => {
    for (const m of ROUTE_META) {
      const html = await render(m.path);
      expect(html, m.path).toContain('<h1');
      expect(html, m.path).toContain('id="main"');
      expect(html, m.path).not.toContain('<script');
    }
  });

  it('puts the article itself in its HTML, live diagram included', async () => {
    const html = await render('/writing/scheduling-10m-cron-jobs');
    expect(html).toContain('Kafka messages per cycle');
    expect(html).toContain('Live model · admission control');
  });

  it('renders the not-found page for an unknown address', async () => {
    expect(await render('/404')).toContain('No such directory.');
  });
});
