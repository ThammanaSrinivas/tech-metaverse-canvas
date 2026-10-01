import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Article typography on the site's type scale. Blockquotes that start with ✏️ are author notes
 * for drafts: rendered as a highlighter callout so they are impossible to miss before publishing.
 */
const text = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((c) => (typeof c === 'string' ? c : React.isValidElement(c) ? text((c.props as { children?: React.ReactNode }).children) : ''))
    .join('');

const components: Components = {
  h2: ({ children }) => <h2 className="mt-14 text-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-10 text-h3">{children}</h3>,
  p: ({ children }) => <p className="mt-5 text-lead leading-[1.7] text-foreground/90">{children}</p>,
  ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-lead leading-[1.7] marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-lead leading-[1.7] marker:font-mono marker:text-primary">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.88em]">{children}</code>,
  pre: ({ children }) => <pre className="zen-card mt-6 overflow-x-auto p-5 font-mono text-small">{children}</pre>,
  blockquote: ({ children }) => {
    const note = text(children).trim().startsWith('✏️');
    return note ? (
      <aside className="mt-6 rounded-2xl border border-dashed border-highlight bg-highlight/10 p-5 text-small">
        <p className="zen-label mb-2 text-reward">Draft note · fill in before publishing</p>
        <div className="[&>p]:mt-0 [&>p]:text-small">{children}</div>
      </aside>
    ) : (
      <blockquote className="mt-6 border-l-2 border-primary pl-5 italic text-muted-foreground">{children}</blockquote>
    );
  },
  table: ({ children }) => (
    <div className="zen-card mt-8 overflow-x-auto">
      <table className="w-full text-left text-small">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b px-4 py-3 font-mono text-label uppercase text-muted-foreground">{children}</th>,
  td: ({ children }) => <td className="border-b px-4 py-3 last:font-medium">{children}</td>,
  hr: () => <hr className="my-12" />,
};

const Markdown: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {children}
  </ReactMarkdown>
);

export default Markdown;
