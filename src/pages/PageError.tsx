import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { ArrowRight, RotateCw } from 'lucide-react';
import { Link } from '@/components/zen/Link';

/** A page's code that is no longer there: the site was deployed again while this tab was open. */
const isStaleChunk = (error: unknown) =>
  /dynamically imported module|Importing a module script failed|module script/i.test(String((error as Error)?.message ?? error));

const RELOADED = 'zen-stale-reload';

/**
 * What a page that throws shows, inside the site's header and footer (React Router's own error
 * screen has neither). After a deploy an open tab asks for page code that is gone: reload once to
 * pick up the new version, and only stay on this page if that didn't help.
 */
const PageError = () => {
  const error = useRouteError();
  const stale = isStaleChunk(error);

  useEffect(() => {
    if (!stale) return;
    try {
      if (Date.now() - Number(sessionStorage.getItem(RELOADED)) < 10_000) return;
      sessionStorage.setItem(RELOADED, String(Date.now()));
    } catch {
      return; // no storage, no loop guard: let the visitor press Reload
    }
    location.reload();
  }, [stale]);

  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-40">
      <p className="zen-label text-muted-foreground">Error</p>
      <h1 className="mt-5 text-title">Something broke on this page.</h1>
      <p className="mt-5 max-w-xl text-lead text-muted-foreground">
        {stale ? 'The site was updated while you had it open. Reload to get the new version.' : 'That one is on me. Reloading usually fixes it.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => location.reload()} className="zen-pill transition-colors hover:border-primary hover:text-primary">
          Reload <RotateCw className="h-3 w-3" />
        </button>
        <Link to="/" className="zen-pill transition-colors hover:border-primary hover:text-primary">
          Home <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
};

export default PageError;
