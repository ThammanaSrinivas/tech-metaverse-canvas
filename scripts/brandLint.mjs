// Brand linter: every colour must come from src/theme/colors.json and every font from
// src/theme/typography.json. Flags, in source files:
//   colours: hex (#abc, #aabbcc, #aabbccdd), rgb()/hsl() with literal values, raw HSL tokens ("48 16% 94%")
//   fonts:   in CSS/HTML, @font-face rules and font-family set to anything but a var();
//            in code, fontFamily string literals and brand font names as strings ('Manrope', …)
// Read them through palettes.ts exports, the generated CSS variables, or Tailwind token classes.
// A line containing `brand-lint-ignore` is skipped.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** The brand files, plus code we vendor and don't own. */
const ALLOWED = [
  /^src\/theme\/(colors|typography|brand)\.json$/,
  /^src\/components\/ui\//,
  /\.test\.tsx?$/,
  /^src\/test\//,
];
const SCAN_DIRS = ['src'];
const SCAN_FILES = ['tailwind.config.ts', 'index.html'];
const EXT = /\.(tsx?|jsx?|css|html)$/;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function rules(root) {
  const typo = JSON.parse(readFileSync(join(root, 'src/theme/typography.json'), 'utf8'));
  const families = [
    ...new Set([
      ...typo.faces.map((f) => f.family),
      ...typo.sets.flatMap((s) => [s.display, s.sans, s.mono, s.accent].filter(Boolean)),
      typo.zenmode.display,
      typo.zenmode.sans,
      typo.zenmode.mono,
    ]),
  ];
  return [
    { name: 'hex colour', re: /(?<![\w&/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g },
    { name: 'rgb()/hsl() with literal values', re: /\b(?:rgba?|hsla?)\(\s*\d/g },
    { name: 'raw HSL token', re: /:\s*\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%/g },
    // In stylesheets: no hand-written @font-face or font names (runtime.ts generates them from data).
    { name: '@font-face rule', re: /@font-face/g, only: /\.(css|html)$/ },
    { name: 'font-family not from a variable', re: /font-family:\s*(?!var\()[^;}\s][^;}]*/g, only: /\.(css|html)$/ },
    // In code: no font names as strings (comments may still mention them).
    { name: 'fontFamily string literal', re: /fontFamily:\s*['"][^'"]+['"]/g, only: /\.[jt]sx?$/ },
    { name: 'brand font name in code', re: new RegExp(`['"\`](?:${families.map(escape).join('|')})['"\`]`, 'g'), only: /\.[jt]sx?$/ },
  ];
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

/** Returns every violation as { file, line, rule, text }. */
export function findBrandViolations(root = process.cwd()) {
  const RULES = rules(root);
  const files = [...SCAN_DIRS.flatMap((d) => walk(join(root, d))), ...SCAN_FILES.map((f) => join(root, f))]
    .filter((f) => EXT.test(f))
    .map((f) => ({ abs: f, rel: relative(root, f).split(sep).join('/') }))
    .filter(({ rel }) => !ALLOWED.some((a) => a.test(rel)));
  const out = [];
  for (const { abs, rel } of files) {
    readFileSync(abs, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('brand-lint-ignore')) return;
        for (const { name, re, only } of RULES) {
          if (only && !only.test(rel)) continue;
          for (const m of line.matchAll(re)) out.push({ file: rel, line: i + 1, rule: name, text: m[0].trim() });
        }
      });
  }
  return out;
}
