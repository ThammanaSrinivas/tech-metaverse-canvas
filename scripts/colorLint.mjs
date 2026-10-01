// Colour linter: every colour must come from src/theme/brand.json.
// Flags, in source files: hex colours (#abc, #aabbcc, #aabbccdd), rgb()/hsl() with literal numbers,
// and raw HSL channel tokens ("48 16% 94%"). Read colours from brand.json (palettes.ts exports,
// CSS vars from tokens.ts, Tailwind classes) instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** The one colour file, plus code we vendor and don't own. */
const ALLOWED = [/^src\/theme\/brand\.json$/, /^src\/components\/ui\//, /\.test\.tsx?$/, /^src\/test\//];
const SCAN_DIRS = ['src'];
const SCAN_FILES = ['tailwind.config.ts', 'index.html'];
const EXT = /\.(tsx?|jsx?|css|html)$/;

const RULES = [
  { name: 'hex colour', re: /(?<![\w&/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g },
  { name: 'rgb()/hsl() with literal values', re: /\b(?:rgba?|hsla?)\(\s*\d/g },
  { name: 'raw HSL token', re: /:\s*\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%/g },
];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

/** Returns every violation as { file, line, rule, text }. */
export function findHardcodedColors(root = process.cwd()) {
  const files = [...SCAN_DIRS.flatMap((d) => walk(join(root, d))), ...SCAN_FILES.map((f) => join(root, f))]
    .filter((f) => EXT.test(f))
    .map((f) => ({ abs: f, rel: relative(root, f).split(sep).join('/') }))
    .filter(({ rel }) => !ALLOWED.some((a) => a.test(rel)));
  const out = [];
  for (const { abs, rel } of files) {
    readFileSync(abs, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('color-lint-ignore')) return;
        for (const { name, re } of RULES) {
          for (const m of line.matchAll(re)) out.push({ file: rel, line: i + 1, rule: name, text: m[0].trim() });
        }
      });
  }
  return out;
}
