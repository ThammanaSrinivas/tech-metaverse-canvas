import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileMarkdown } from '../../scripts/markdownTree';
import { outline, type MdNode } from './markdown';

const article = readFileSync('src/content/writing/scheduling-10m-cron-jobs.md', 'utf8');
const tree = compileMarkdown(article);

const all = (nodes: MdNode[]): Exclude<MdNode, string>[] =>
  nodes.flatMap((n) => (typeof n === 'string' ? [] : [n, ...all(n.slice(2) as MdNode[])]));
const text = (n: MdNode): string => (typeof n === 'string' ? n : (n.slice(2) as MdNode[]).map(text).join(''));

describe('article Markdown, compiled at build time', () => {
  it('gives every heading the id the contents link to', () => {
    const ids = all(tree)
      .filter(([tag]) => tag === 'h2' || tag === 'h3')
      .map(([, props]) => props?.id);
    expect(ids).toEqual(outline(article).map((h) => h.id));
  });

  it('keeps a ```diagram fence as a block the page mounts a live diagram for', () => {
    const fence = all(tree).find(([tag, props]) => tag === 'code' && props?.className === 'language-diagram');
    expect(fence && text(fence).trim()).toBe('admission-control');
  });

  it('sets table alignment as a style, with no whitespace text between table rows and cells', () => {
    const els = all(tree);
    expect(els.some(([tag, props]) => tag === 'td' && (props?.style as Record<string, string>)?.textAlign === 'right')).toBe(true);
    for (const [tag, , ...kids] of els.filter(([tag]) => ['table', 'thead', 'tbody', 'tr'].includes(tag)))
      expect(kids.every((k) => typeof k !== 'string'), `${tag} has only elements`).toBe(true);
  });

  it('shows raw HTML as text, as react-markdown did', () => {
    expect(compileMarkdown('a <b>bold</b> claim')).toEqual([['p', null, 'a ', '<b>', 'bold', '</b>', ' claim']]);
  });
});
