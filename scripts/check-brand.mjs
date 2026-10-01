#!/usr/bin/env node
// CLI for the brand linter (npm run lint:brand). Exits 1 on any colour or font defined outside
// src/theme/colors.json / src/theme/typography.json.
import { findBrandViolations } from './brandLint.mjs';

const hits = findBrandViolations();
if (hits.length) {
  for (const h of hits) console.error(`${h.file}:${h.line}  ${h.rule}: ${h.text}`);
  console.error(`\n${hits.length} brand violation(s). Colours belong in src/theme/colors.json, fonts in src/theme/typography.json.`);
  process.exit(1);
}
console.log('brand: every colour from colors.json, every font from typography.json ✓');
