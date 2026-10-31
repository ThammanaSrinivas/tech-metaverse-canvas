import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@/components/zen/Link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Markdown, { outline, type Heading } from '@/components/Markdown';
import { MaskWords, ScrollProgress, maskStagger } from '@/components/zen/primitives';
import { postFor, readMinutes } from '@/content/writing';
import { LINKS, PROFILE, formatDate } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { articleMeta, notFoundMeta } from '@/site/meta';
import NotFound from './NotFound';

/** The site's one grid: a 200px margin, the content column beside it (same as every Chapter). */
const GRID = 'grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10';
const FRAME = 'mx-auto w-full max-w-[1120px] px-5';

/**
 * The section the reader is in: the last heading above a reading line 30% down the screen.
 * The observer's root runs from far above the page down to that line, so a heading flips state
 * whenever it crosses the line, even on a jump (End key, Back, a link) that skips past it in one
 * frame. Nothing runs per scroll frame.
 */
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState('');
  const key = ids.join(' ');
  useEffect(() => {
    const els = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const pick = () => {
      const line = window.innerHeight * 0.3;
      let at = '';
      for (const el of els) if (el.getBoundingClientRect().top <= line) at = el.id;
      setCurrent(at);
    };
    const io = new IntersectionObserver(pick, { rootMargin: '100000px 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return [current, setCurrent] as const;
}

/**
 * Contents in the margin, sticky beside the text on wide screens. The section being read carries
 * the logo's dot, like a Chapter label. Phones read straight through, without it.
 */
const Contents: React.FC<{ headings: Heading[] }> = ({ headings }) => {
  const reduce = useReducedMotion();
  const [current, setCurrent] = useCurrentSection(useMemo(() => headings.map((h) => h.id), [headings]));

  // Scroll ourselves and replace the hash in place: a plain #link would add a history entry that
  // the router treats as Back/Forward and restores the old scroll position over.
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${id}`);
    setCurrent(id);
  };

  return (
    <nav aria-label="Contents" className="hidden md:block">
      <ol className="space-y-1 md:sticky md:top-24">
        {headings.map((h) => {
          const on = h.id === current;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => jump(e, h.id)}
                aria-current={on ? 'location' : undefined}
                className={`flex items-start gap-2.5 py-1 text-small transition-colors hover:text-foreground motion-reduce:transition-none ${
                  on ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-[calc(0.75em_-_3px)] h-1.5 w-1.5 shrink-0 rounded-full bg-primary transition-opacity duration-300 motion-reduce:transition-none ${
                    on ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {h.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/** Who wrote it and how to reach them: the portrait, the name and one line, two links. */
const SignOff: React.FC = () => (
  <footer className="mt-16 flex items-center gap-4 border-t pt-8">
    <img src={PROFILE.portraitSmall} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-full border object-cover" />
    <div className="min-w-0 leading-snug">
      <p className="font-semibold">{PROFILE.name}</p>
      <p className="text-muted-foreground">{PROFILE.headline}</p>
      <p className="mt-1 flex flex-wrap gap-x-4 text-small">
        <a href={LINKS.email} className="zen-link">
          Email
        </a>
        <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-0.5">
          LinkedIn <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </p>
    </div>
  </footer>
);

/** One article on the site's grid: contents in the margin, the text at a reading measure beside it. */
const WritingPost: React.FC = () => {
  const { slug } = useParams();
  const post = postFor(slug);
  const reduce = useReducedMotion();
  const headings = useMemo(() => (post ? outline(post.body).filter((h) => h.depth === 2) : []), [post]);
  usePageMeta(post ? articleMeta(post) : notFoundMeta(`/writing/${slug}`));
  if (!post) return <NotFound />;

  return (
    <article className="pb-16">
      <ScrollProgress />
      <header className={`${FRAME} pt-32 md:pt-40`}>
        <div className={GRID}>
          <div className="md:pt-3">
            <Link to="/writing" className="zen-label inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Writing
            </Link>
          </div>
          <div className="min-w-0">
            {post.draft && (
              <p className="mb-8 rounded-xl border border-dashed border-highlight bg-highlight/10 px-4 py-3 text-small">
                <span className="font-semibold">Draft.</span> Visible on localhost only; it ships when <code className="font-mono">draft</code> is
                set to <code className="font-mono">false</code> in <code className="font-mono">src/content/writing/index.ts</code>.
              </p>
            )}
            <motion.h1 className="max-w-4xl text-title" variants={maskStagger} initial={reduce ? false : 'hidden'} animate="show">
              <MaskWords text={post.title} />
            </motion.h1>
            <p className="mt-5 max-w-[56ch] text-lead text-muted-foreground">{post.summary}</p>
            <p className="mt-6 font-mono text-small text-muted-foreground">
              <time dateTime={post.date}>{formatDate(post.date)}</time> · {readMinutes(post.body)} min read
            </p>
          </div>
        </div>
      </header>

      <div className={`${FRAME} pt-12 md:pt-16`}>
        <div className={`${GRID} border-t pt-8 md:pt-10`}>
          {headings.length > 0 ? <Contents headings={headings} /> : <div aria-hidden className="hidden md:block" />}
          <div className="min-w-0">
            <Markdown>{post.body}</Markdown>
            <SignOff />
            <Link to="/writing" className="mt-10 inline-flex items-center gap-2 font-semibold text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All writing
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default WritingPost;
