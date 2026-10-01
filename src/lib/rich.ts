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
