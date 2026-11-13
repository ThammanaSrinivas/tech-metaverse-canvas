// Article Markdown, shared by the build (scripts/markdownTree.ts compiles each article to a tree)
// and the page (components/Markdown.tsx renders the tree; the contents list reads the outline).

/** A heading's anchor: lowercase words joined by hyphens ("Why per-minute…" → why-per-minute-…). */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');

export interface Heading {
  id: string;
  title: string;
  depth: 2 | 3;
  /** 1-based source line, so the compiled heading gets exactly the id the outline gave it. */
  line: number;
}

/**
 * The `##` and `###` headings of a Markdown body, in order, with stable unique ids. The article
 * page builds its table of contents from this; the compiled body gives each heading the same id.
 */
export const outline = (md: string): Heading[] => {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  let fence = '';
  md.split('\n').forEach((raw, i) => {
    const f = raw.match(/^ {0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (f[1][0] === fence[0] && f[1].length >= fence.length) fence = '';
      return;
    }
    if (fence) return;
    const m = raw.match(/^ {0,3}(#{2,3})\s+(.+?)(?:\s+#+)?\s*$/);
    if (!m) return;
    const title = m[2].replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '').trim();
    const base = slug(title) || 'section';
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.push({ id: n > 1 ? `${base}-${n}` : base, title, depth: m[1].length as 2 | 3, line: i + 1 });
  });
  return out;
};

/** Attributes of a compiled element, in React's names (`className`, `style`, `data-*`). */
export type MdProps = Record<string, string | number | boolean | Record<string, string>>;

/**
 * An article body compiled at build time: text, or [tag, attributes, ...children]. Compact JSON
 * that the page renders straight to React elements, with no Markdown parser in the browser.
 */
export type MdNode = string | [tag: string, props: MdProps | null, ...children: MdNode[]];
