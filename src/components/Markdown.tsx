import React, { Suspense } from 'react';
import { DIAGRAMS } from '@/components/diagrams';
import { Link } from '@/components/zen/Link';
import type { MdNode } from '@/lib/markdown';

/**
 * Article typography on the site's type scale. Prose keeps a reading measure (about 66 characters a line); a live
 * diagram and a table may use the full content column. Blockquotes that start with ✏️ are author
 * notes for drafts: rendered as a highlighter callout so they are impossible to miss before publishing.
 *
 * The body arrives compiled (scripts/markdownTree.ts: Markdown → a small tree, at build time), so
 * no Markdown parser ships to the browser; each tag is drawn by the component for it below.
 */
const text = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((c) => (typeof c === 'string' ? c : React.isValidElement(c) ? text((c.props as { children?: React.ReactNode }).children) : ''))
    .join('');

/** Reading measure: ~66 characters a line (Manrope's 0 is wide, so 66ch would run to ~78). */
const MEASURE = 'max-w-[56ch]';

type Align = React.CSSProperties['textAlign'];
const alignOf = (align: Align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left');
/**
 * GFM column alignment: a right-aligned column (`--:`) holds numbers, so its cells are set as data,
 * in mono with tabular figures (a touch smaller: Space Mono runs large next to Manrope).
 */
const dataCell = (align: Align) => (align === 'right' ? 'font-mono text-[0.9375em] tabular-nums' : '');

interface Props {
  id?: string;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const COMPONENTS: Record<string, React.FC<Props>> = {
  // heading ids come from the build (the same as outline() gives the contents).
  // tabIndex -1: the contents move focus here after a jump, so the next Tab continues from the section
  h2: ({ id, children }) => (
    <h2 id={id} tabIndex={-1} className={`mt-16 scroll-mt-6 text-h2 focus:outline-none ${MEASURE}`}>
      {children}
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id} tabIndex={-1} className={`mt-12 scroll-mt-6 text-h3 focus:outline-none ${MEASURE}`}>
      {children}
    </h3>
  ),
  p: ({ children }) => <p className={`mt-6 text-lead text-foreground/90 ${MEASURE}`}>{children}</p>,
  ul: ({ children }) => <ul className={`mt-6 list-disc space-y-3 pl-6 text-lead text-foreground/90 marker:text-primary ${MEASURE}`}>{children}</ul>,
  ol: ({ children }) => (
    <ol className={`mt-6 list-decimal space-y-3 pl-6 text-lead text-foreground/90 marker:font-mono marker:text-primary ${MEASURE}`}>{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link to={href} className="zen-link">
        {children}
      </Link>
    ) : href.startsWith('#') ? (
      <a href={href} className="zen-link">
        {children}
      </a>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="zen-link">
        {children}
      </a>
    ),
  code: ({ className, children }) =>
    // fenced blocks keep their own look inside <pre>; only inline code gets the tint
    className?.startsWith('language-') ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
    ),
  pre: ({ children }) => {
    // ```diagram blocks embed a live component (src/components/diagrams) instead of code
    const child = React.Children.toArray(children)[0];
    const props = React.isValidElement(child) ? (child.props as { className?: string; children?: React.ReactNode }) : null;
    if (props?.className?.includes('language-diagram')) {
      const Diagram = DIAGRAMS[text(props.children).trim()];
      if (Diagram)
        return (
          <Suspense fallback={<div className="zen-card mt-10 h-[420px] motion-safe:animate-pulse" />}>
            <Diagram className="mt-10" />
          </Suspense>
        );
    }
    return <pre className="zen-card mt-8 overflow-x-auto p-5 font-mono text-small">{children}</pre>;
  },
  blockquote: ({ children }) => {
    const note = text(children).trim().startsWith('✏️');
    return note ? (
      <aside className={`mt-6 rounded-2xl border border-dashed border-highlight bg-highlight/10 p-5 text-small ${MEASURE}`}>
        <p className="zen-label mb-2 text-reward">Draft note · fill in before publishing</p>
        <div className="[&>p]:mt-0 [&>p]:text-small">{children}</div>
      </aside>
    ) : (
      <blockquote className={`mt-6 border-l-2 border-primary pl-5 italic text-muted-foreground ${MEASURE}`}>{children}</blockquote>
    );
  },
  // Results tables: hairlines only, the full content width, numbers in mono so their digits line up
  table: ({ children }) => (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full border-collapse text-body">{children}</table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-b">{children}</tr>,
  th: ({ style, children }) => (
    <th scope="col" className={`px-3 pb-2.5 text-small font-normal text-muted-foreground first:pl-0 last:pr-0 ${alignOf(style?.textAlign)}`}>
      {children}
    </th>
  ),
  td: ({ style, children }) => (
    <td className={`px-3 py-3 align-baseline first:pl-0 last:pr-0 ${alignOf(style?.textAlign)} ${dataCell(style?.textAlign)}`}>{children}</td>
  ),
  hr: () => <hr className="my-12" />,
};

/** A compiled node → React: text as is, an element through its component (or as plain HTML). */
const render = (node: MdNode, key: number): React.ReactNode => {
  if (typeof node === 'string') return node;
  const [tag, props, ...kids] = node;
  return React.createElement(COMPONENTS[tag] ?? tag, { key, ...props }, ...kids.map(render));
};

const Markdown: React.FC<{ tree: MdNode[] }> = ({ tree }) => (
  // the first block sits flush under whatever precedes the article; a heading pulls its first paragraph close
  <div className="[&>:first-child]:mt-0 [&>h2+*]:mt-5 [&>h3+*]:mt-4">{tree.map(render)}</div>
);

export default Markdown;
