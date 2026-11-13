import fs from 'node:fs';
import type { Plugin } from 'vite';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import type { Element, ElementContent, Root } from 'hast';
import { outline, slug, type MdNode, type MdProps } from '../src/lib/markdown';

/** Whitespace between these is not text: React would refuse it (and hydration would trip on it). */
const TABLE = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr']);

const textOf = (n: ElementContent): string => (n.type === 'text' ? n.value : n.type === 'element' ? n.children.map(textOf).join('') : '');

/** hast's property names → React's: `className` as a string, `align` as a style, `dataFoo` → `data-foo`. */
function propsOf(el: Element): MdProps | null {
  const out: MdProps = {};
  for (const [k, v] of Object.entries(el.properties ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    const value = Array.isArray(v) ? v.join(' ') : v;
    if (k === 'align') out.style = { textAlign: String(value) };
    else if (/^(data|aria)[A-Z]/.test(k)) out[k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)] = value;
    else out[k] = value;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Markdown (GFM) → MdNode tree, as react-markdown read it before: the same parser and HTML, raw
 * HTML shown as text. `##`/`###` headings get the ids `outline()` gives them, so the article's
 * contents link to them.
 */
export function compileMarkdown(md: string): MdNode[] {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true });
  const root = processor.runSync(processor.parse(md)) as Root;
  const idAt = new Map(outline(md).map((h) => [h.line, h.id]));
  const walk = (n: Root['children'][number], parent: string): MdNode | null => {
    if (n.type === 'text') return TABLE.has(parent) && !n.value.trim() ? null : n.value;
    if (n.type === 'raw') return n.value;
    if (n.type !== 'element') return null;
    const props = propsOf(n);
    const kids = n.children.map((c) => walk(c, n.tagName)).filter((c): c is MdNode => c !== null);
    if (n.tagName === 'h2' || n.tagName === 'h3') {
      const id = idAt.get(n.position?.start.line ?? 0) ?? slug(textOf(n));
      return [n.tagName, { ...props, id }, ...kids];
    }
    return [n.tagName, props, ...kids];
  };
  return root.children.map((c) => walk(c, 'root')).filter((c): c is MdNode => c !== null);
}

const QUERY = '?tree';

/**
 * `import tree from './post.md?tree'`: the article compiled at build time (compileMarkdown), so
 * the page ships a small JSON tree instead of a Markdown parser.
 */
export function markdownTree(): Plugin {
  return {
    name: 'markdown-tree',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith(`.md${QUERY}`)) return null;
      const file = id.slice(0, -QUERY.length);
      this.addWatchFile(file);
      return `export default JSON.parse(${JSON.stringify(JSON.stringify(compileMarkdown(fs.readFileSync(file, 'utf8'))))});`;
    },
  };
}
