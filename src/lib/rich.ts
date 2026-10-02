/**
 * Tiny heading markup: `*word*` (or `*several words*`) marks the accent voice.
 * "Beyond the *code*" → [{ text: 'Beyond the', accent: false }, { text: 'code', accent: true }]
 */
export interface Segment {
  text: string;
  accent: boolean;
}

export function parseRich(text: string): Segment[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), accent: true } : { text: part, accent: false }));
}

/** The same text without markup: for <title>, the shell, aria labels. */
export const plain = (text: string) => text.replace(/\*([^*]+)\*/g, '$1');

export type LinkSegment = { text: string; href?: string };

/** Inline links in plain copy: "I build [ZenMode OS](/zenmode)." → text and link segments. */
export function parseLinks(text: string): LinkSegment[] {
  const out: LinkSegment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
