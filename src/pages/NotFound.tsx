import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PAGES } from '@/site/pages';
import { usePageMeta } from '@/lib/usePageMeta';

const NotFound = () => {
  const { pathname } = useLocation();
  usePageMeta('Not found');
  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-40">
      <p className="zen-label text-muted-foreground">404</p>
      <h1 className="mt-5 text-title">
        <span className="font-mono text-primary">cd {pathname}</span>
        <br />
        no such directory.
      </h1>
      <p className="mt-5 max-w-xl text-lead text-muted-foreground">Try one of these instead:</p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {[{ path: '/', label: 'Home' }, ...PAGES].map((p) => (
          <li key={p.path}>
            <Link to={p.path} className="zen-pill transition-colors hover:border-primary hover:text-primary">
              {p.label} <ArrowRight className="h-3 w-3" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NotFound;
