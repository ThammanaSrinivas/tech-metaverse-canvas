import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/components/zen/Link';
import { minutesOf, type Post } from '@/content/writing';
import { formatDate } from '@/data/profile';
import { plain } from '@/lib/rich';

/** One line of facts under a title: when, how long, and where it lives if not here. */
const meta = (p: Post) =>
  [p.date && formatDate(p.date), `${minutesOf(p)} min read`, p.kind === 'external' && `on ${p.site}`, p.kind === 'external' && p.with && `with ${p.with}`]
    .filter(Boolean)
    .join(' · ');

/**
 * Write-ups as a plain list: title, one line on what it is, the facts. Hairlines between, no
 * cards or tags. Used on the home page and on /writing.
 */
const PostList: React.FC<{ posts: Post[]; inChapter?: boolean }> = ({ posts, inChapter }) => (
  // inside a Chapter the chapter's hairline is the top rule, so the list starts flush under it
  <ul className={`divide-y ${inChapter ? 'border-b [&>li:first-child>*]:pt-0' : 'border-y'}`}>
    {posts.map((p) => {
      const inner = (
        <>
          <span className="block font-display text-h3 transition-colors group-hover:text-primary">
            {plain(p.title)}
            {p.kind === 'external' && <ArrowUpRight className="ml-1 inline h-4 w-4 align-baseline text-muted-foreground" aria-hidden />}
          </span>
          <span className="mt-2 block max-w-2xl text-muted-foreground">{p.summary}</span>
          <span className="mt-3 block font-mono text-small text-muted-foreground">
            {meta(p)}
            {p.draft && <span className="ml-2 text-reward">draft · localhost only</span>}
          </span>
        </>
      );
      return (
        <li key={p.slug}>
          {p.kind === 'article' ? (
            <Link to={`/writing/${p.slug}`} className="group block py-6">
              {inner}
            </Link>
          ) : (
            // published elsewhere: open the original in a new tab
            <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block py-6">
              {inner}
            </a>
          )}
        </li>
      );
    })}
  </ul>
);

export default PostList;
