import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useViewTransitionState } from 'react-router-dom';
import { Link, POST_TITLE } from '@/components/zen/Link';
import { minutesOf, type Post } from '@/content/writing';
import { formatDate } from '@/data/profile';
import { plain } from '@/lib/rich';

/** One line of facts under a title: when, how long, and where it lives if not here. */
const meta = (p: Post) =>
  [p.date && formatDate(p.date), `${minutesOf(p)} min read`, p.kind === 'external' && `on ${p.site}`, p.kind === 'external' && p.with && `with ${p.with}`]
    .filter(Boolean)
    .join(' · ');

/** What a row shows: the title (large; it underlines itself on hover), one line on what it is, the facts. */
const Row: React.FC<{ p: Post; titleStyle?: React.CSSProperties }> = ({ p, titleStyle }) => (
  <>
    <span className="block w-fit font-display text-h2" style={titleStyle}>
      <span className="zen-draw">{plain(p.title)}</span>
      {p.kind === 'external' && <ArrowUpRight className="ml-1.5 inline h-[0.7em] w-[0.7em] align-baseline text-muted-foreground" aria-hidden />}
    </span>
    <span className="mt-3 block max-w-2xl text-muted-foreground">{p.summary}</span>
    <span className="mt-3 block font-mono text-small text-muted-foreground">
      {meta(p)}
      {p.draft && <span className="ml-2 text-reward">draft · localhost only</span>}
    </span>
  </>
);

/**
 * An article on this site. While it is being opened (or come back from), its title carries the
 * article page's transition name, so the browser moves the title itself from the list to the page.
 */
const ArticleRow: React.FC<{ p: Post }> = ({ p }) => {
  const to = `/writing/${p.slug}`;
  const moving = useViewTransitionState(to);
  return (
    <Link to={to} className="group block py-7">
      <Row p={p} titleStyle={moving ? POST_TITLE : undefined} />
    </Link>
  );
};

/**
 * Write-ups as a plain list: title, one line on what it is, the facts. Hairlines between, no
 * cards or tags. Used on the home page and on /writing.
 */
const PostList: React.FC<{ posts: Post[]; inChapter?: boolean }> = ({ posts, inChapter }) => (
  // inside a Chapter the chapter's hairline is the top rule, so the list starts flush under it
  <ul className={`divide-y ${inChapter ? 'border-b [&>li:first-child>*]:pt-0' : 'border-y'}`}>
    {posts.map((p) => (
      <li key={p.slug}>
        {p.kind === 'article' ? (
          <ArticleRow p={p} />
        ) : (
          // published elsewhere: open the original in a new tab
          <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block py-7">
            <Row p={p} />
          </a>
        )}
      </li>
    ))}
  </ul>
);

export default PostList;
