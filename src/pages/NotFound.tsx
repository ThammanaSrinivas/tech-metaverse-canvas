import { useLocation } from 'react-router-dom';
import { Link } from '@/components/zen/Link';
import { NAV_PAGES } from '@/site/pages';
import { usePageMeta } from '@/lib/usePageMeta';
import { notFoundMeta } from '@/site/meta';

/** A wrong address, answered the way the shell would: the command, the error, then `ls ~`. */
const NotFound = () => {
  const { pathname } = useLocation();
  usePageMeta(notFoundMeta(pathname));
  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-40">
      {/* any-break: a long unknown address must wrap, not push the page sideways on a phone */}
      <p className="font-mono text-h3 text-muted-foreground [overflow-wrap:anywhere]">
        <span className="text-primary">$</span> cd {pathname}
      </p>
      <h1 className="mt-4 text-title">No such directory.</h1>
      <p className="mt-10 font-mono text-muted-foreground">
        <span className="text-primary">$</span> ls ~
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-3 font-mono text-lead">
        {[{ id: 'home', path: '/', label: '~' }, ...NAV_PAGES].map((p) => (
          <li key={p.id}>
            <Link to={p.path} className="zen-link">
              {p.path === '/' ? '~' : `${p.path.slice(1)}/`}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NotFound;
