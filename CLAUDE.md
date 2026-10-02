# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
This repo is **public**: never write private details here or in the site (personal Gmail, phone, account IDs).

## Project Overview

The personal brand site of **Thammana Srinivas** (Software Engineer 2 at PayPal, founder of ZenMode OS),
built to read as a senior engineer and tech lead to Google-level companies. Live at
https://thammanasrinivas.com (also https://srinivas-t.web.app). React 18 + TypeScript + Vite 5 +
Tailwind + framer-motion, Firebase Hosting (project `srinivas-portfolio-1481f`, site `srinivas-t`).
Domain on Cloudflare Registrar, Cloudflare DNS (records DNS-only, not proxied), Cloudflare Email
Routing for the public address `srinivas@thammanasrinivas.com`.

## Commands

```bash
npm run dev              # dev server on port 8080 (shows the dev-only brand lab)
npm run build            # ALL tests + coverage, then vite build + prerender (fails on any test failure)
npm run lint             # ESLint (--max-warnings 0) + brand lint
npm run lint:brand       # colour/font literals outside the token files fail
npm run preview          # serve dist/ (serves work.html at /work, like Firebase)
npm run snapshot:commits # refresh public/gh-snapshot.json (Time Machine fallback)
npx vitest run src/site  # one folder / file
```

Deploy (after `npm run build`): `firebase deploy --only hosting --project srinivas-portfolio-1481f`,
with the Firebase account that owns the project (`firebase login:list`; pass `--account <it>` if
another account is the default, else it fails with "Failed to get Firebase project").

## Brand (decided; don't change without the owner)

- **Idea:** "I build innovative systems at scale." **Values:** Curiosity, Clarity, Ownership. Each
  value carries a design rule; `src/theme/brand.json` holds both (meaning lives there, not in code).
- **Palette: Calm Glow** (`active` in `src/theme/colors.json`, which wins over this mirror):
  light `#F4F2EC`, dark `#2B2722`, primary jade `#5DBF9F`, secondary `#D4E7C8`, highlight orange
  `#FE5D26`. One accent per screen; orange is the single "I built this" highlighter and the logo dot.
  Never PayPal/Google blue.
- **Type: Builder set** (`src/theme/typography.json`, modular scale ratio 1.25): Bricolage Grotesque
  700 for display, Instrument Serif italic as the accent voice (write `*word*`; `src/lib/rich.ts`),
  Manrope for body, Space Mono for numbers in data. All vendored in `public/fonts`.
- **Logo:** the "platform T" monogram (T carrying an S, orange dot), `src/components/zen/monogramPath.ts`.
- **Layout feel: editorial, not a template.** The owner found the earlier site "vibe coded"; the
  fix was subtraction. Paper, type and hairlines; roles in prose with numbers inline; lists, not
  card grids. Do NOT bring back: numbered kickers ("01 · WORK"), a rule after every heading,
  cards inside cards, stat tiles or count-ups, pill badges, glassy sheens or glows, a floating
  shell button, or the italic accent word on every heading (article titles only). One
  highlighter per page. Each fact or number appears once on the site, in its best place.
  But don't strip personality: the owner found the fully stripped version "too simple". Keep
  what is uniquely his: the dark hero over the star sky (`HeroSky`), the live scheduler model,
  real photos and screenshots, the zen shell, the sonic logo, motion that tells his story.
- **Name and links:** always "Thammana Srinivas" (short: "Srinivas"). LinkedIn `/in/thammanasrinivas`,
  GitHub `ThammanaSrinivas`. All links and facts come from `src/data/profile.ts`.

## Content rules

- Every fact (jobs, numbers, links, awards) lives in `src/data/profile.ts` or `src/content/writing/`;
  never hardcode copy in a component.
- **Never invent numbers, labels or claims.** Only use figures the owner gave (resume / LinkedIn /
  answers). If a visual needs a unit you don't have, say less rather than make one up.
- **Claim only roles actually held.** On the Zoho scheduler, Srinivas designed it and *informally*
  led a small team: never write "led a team of three" or imply a formal lead title ("designed the
  scheduler and drove it through to production" and "mentored" are accurate).
- **Zoho internals:** publish only what is public (the Catalyst job-scheduling docs) or what the owner
  wrote for the article. The owner said Redis sorted sets must not be mentioned publicly.
- Use they/them for anyone whose pronouns aren't stated.

## Architecture

**Path alias:** `@/*` → `./src/*`. **Router:** React Router 6 data router (`createBrowserRouter` in
`src/App.tsx`), routes generated from the page registry, each page a lazy chunk.

- **Pages:** registered once in `src/site/pages.ts` (SOURCE OF TRUTH; each page also implements its
  zen-shell directory; `draft` = dev-only; `nested` = `/:slug` children; `nav: false` = routed but
  not in the menu) and mapped to components in `src/site/routes.tsx`. Nav, mobile menu, footer,
  ⌘K palette, routes, "Next" links, sitemap test, page meta and the shell's filesystem all derive
  from it. Menu: Work · Writing · ZenMode · About; Time Machine is `nav: false` (linked from
  Work's side projects); plus home and 404. Home = a dark hero over the star sky with the name,
  one line, a three-paragraph bio with inline links (`LinkedText`, `[label](/path)` in
  `PROFILE.bio`) and the live scheduler model (it draws in the dark palette when inside `.dark`);
  then "Outside the day job" (ZenMode screenshot, Toastmasters photo) and the writing list.
- **Retired addresses** (`/beyond`, `/contact`, `/lab`, `/explore`): `REDIRECTS` in `pages.ts`
  (the router follows them) and the same list as 301s in `firebase.json` `redirects` (a test
  checks they match whenever `firebase.json` is present).
- **Writing:** `src/content/writing/index.ts` (SOURCE OF TRUTH) lists articles (Markdown next to it,
  at `/writing/<slug>`) and external posts (open in a new tab). Drafts are dropped from production
  builds entirely (`import.meta.env.DEV || !DRAFT_X`, keep each flag a literal).
  Markdown renders in `src/components/Markdown.tsx`; a fenced ```` ```diagram <id> ```` block mounts a
  live diagram from `src/components/diagrams/index.ts` (lazy).
- **Brand tokens (three files):** `colors.json`, `typography.json`, `brand.json` in `src/theme/`.
  `tokens.ts` derives `:root` / `.dark` / `.zen` tokens with every text pairing pushed to WCAG AA,
  measured *as painted* (`asEmitted`: after the HSL rounding the CSS vars apply). `runtime.ts` injects
  font-face rules and `--font-*` / `--fs-*` vars before first paint. Components read
  `useBrandTheme()`, CSS vars or Tailwind token classes; `npm run lint:brand` (also a unit test) fails
  on any colour literal or font name elsewhere (`brand-lint-ignore` on a line opts out). The brand lab
  (`PalettePanel.tsx`, `?theme=`/`?palette=`/`?type=`) exists in dev builds only.
- **Zen shell** (`ZenShell.tsx` + pure interpreter `src/lib/zenshell.ts`): backtick key, ⌘K, the
  phone menu, or `emitZen('shell')`; no floating launcher. The coding duel is only in the shell. **Event bus** `src/lib/zenEvents.ts`. **Cursor** `src/lib/zenCursor.ts`
  (port of zenmodeos.com's; `data-cursor`, `data-magnet`).
- **Commit Time Machine** (`src/components/CommitTimeMachine/`): lazy three.js. GitHub calls via
  `getJson` in `src/lib/github.ts` (sessionStorage cache, fallback `public/gh-snapshot.json`); commit
  details fetched only on click/Enter to save the 60 req/hour budget.
- **CodingDuel** (`src/components/CodingDuel/`): lazy modal; code runs via `new Function()`, own browser only.

## SEO and link previews

- **`src/site/meta.ts` is the SOURCE OF TRUTH for every URL's title, description, canonical and
  social card.** Runtime: `usePageMeta(pageMeta(page) | articleMeta(post) | HOME_META | notFoundMeta(path))`.
  Build: the Vite plugin `scripts/prerender.ts` writes `dist/<path>.html` per URL in `ROUTE_META`
  with that meta baked into `<head>`, because LinkedIn / WhatsApp / Slack / X never run JS. The body
  is still client-rendered. `applyMetaToHtml` throws if `index.html` loses one of its tags: keep the
  tag shapes in `index.html` as they are.
- **Firebase must serve those files:** `firebase.json` is gitignored (local only) and needs
  `"cleanUrls": true`, `"trailingSlash": false`, the `redirects` above, the `** → /index.html`
  rewrite, immutable caching on
  `/assets/**`, and the security headers (CSP `default-src 'self'`, `script-src 'self'`,
  `connect-src 'self' https://api.github.com`, `frame-ancestors 'none'`; HSTS, nosniff, DENY,
  Referrer-Policy, Permissions-Policy, COOP). Any new third-party origin needs a CSP change.
- **`public/sitemap.xml` is hand-written**; tests fail unless it equals home + live pages + published
  articles, and unless `ROUTE_META` matches it.
- **Social cards:** 1200×630 PNG. Site default `public/og-image.png`; per article `public/og/<slug>.png`
  set as `image` on the article (a test checks the file exists). Dark espresso card, brand fonts,
  title with the accent word in Instrument Serif, one proof visual.
- **New article checklist:** entry in `src/content/writing/index.ts` → Markdown file → `<loc>` in
  sitemap.xml → social card in `public/og/` → build → deploy → refresh the preview at
  https://www.linkedin.com/post-inspector/ before posting (LinkedIn caches previews).
- Google Search Console is set up for thammanasrinivas.com with the sitemap submitted.

## Sound

- **`src/theme/sound.json` is the SOURCE OF TRUTH for the sonic brand:** one key (D major pentatonic,
  so overlapping sounds agree), three families (wood = actions, glass = things finishing, air =
  movement), and every cue. The logo motif is D3 → A3 → F#5 (the T, the S, the orange dot).
  `src/lib/sound/synth.ts` synthesises it with Web Audio (no audio files, so no CSP change);
  `src/lib/sound/index.ts` is the engine.
- **Off by default, opt-in only:** the speaker button (`SoundToggle`, in the header), the ⌘K action,
  or `sound on` in the shell. Remembered per device (`localStorage` `zen-sound`). No AudioContext
  exists until the visitor opts in; audio wakes on their next tap/key if it was left on; it
  suspends while the tab is hidden.
- `sound.play(cue, { step, pan, delay, gain })` is a no-op while off, so call it freely. Never add
  hover, scroll or page-load sounds, and keep simulated fast-forwards silent (see the diagram's
  `silent` flag). Tests check every cue's voice, gain, pitch range and length.
- Video soundtracks: dev builds expose `window.__zenSound` (`sound.tap`, `renderOffline`, `toWav`),
  so a frame-by-frame recorder can log the cues each frame asked for and render the same synth
  offline, in sync with the picture.

## Motion, accessibility, mobile (lessons already paid for)

- **Page transitions** use the View Transitions API through React Router: import `Link` / `NavLink` /
  `useGo` from `@/components/zen/Link`, never straight from react-router-dom. Persistent chrome has
  unique `view-transition-name`s in `index.css` (`[data-site-header]`, cursor, shell window);
  a duplicate name aborts every transition silently.
- **Reduced motion is respected everywhere:** transitions off, scroll storytelling static. Moving
  content that plays on its own needs a Pause control (WCAG 2.2.2); under reduced motion it starts
  paused with a Play button (see `AdmissionControl.tsx`).
- **Canvas:** no `ctx.roundRect` (iOS < 16 lacks it; use the arcTo helper), redraw after resize, pause
  off screen (IntersectionObserver), and show a text fallback if drawing throws.
- **Mobile menu** (`Navigation.tsx`): never lock body scroll with `overflow: hidden` (iOS Safari
  re-lays out the page, which looks like a reload); never fade an opaque panel in from opacity 0 over
  content (the page shows through); the menu's `AnimatePresence` is keyed by pathname so it leaves
  with the old page instead of flashing over the new one.
- Targets: Lighthouse accessibility, best practices and SEO at 100, performance 90+. Don't preload
  the three.js scene; idle preload skips data-saver / 2G.

## Tests and TypeScript

Vitest + jsdom (`src/test/setup.ts`). Brand, contrast, type-scale, sitemap and meta rules are unit
tests, so `npm run build` refuses to ship a broken brand or SEO. TypeScript is relaxed
(`noImplicitAny: false`, `strictNullChecks: false`); three unused shadcn files (`alert-dialog`,
`calendar`, `pagination`) have pre-existing `buttonVariants` errors under `tsc`; Vite builds regardless.
