#!/usr/bin/env node
// CLI for the colour linter (npm run lint:colors). Exits 1 on any hardcoded colour.
import { findHardcodedColors } from './colorLint.mjs';

const hits = findHardcodedColors();
if (hits.length) {
  for (const h of hits) console.error(`${h.file}:${h.line}  ${h.rule}: ${h.text}`);
  console.error(`\n${hits.length} hardcoded colour(s). Add the colour to src/theme/brand.json and read it from there.`);
  process.exit(1);
}
console.log('colours: all from src/theme/brand.json ✓');
