# srinivas-t.web.app

Personal site of Thammana Srinivas, live at **https://srinivas-t.web.app**.
Styled with the ZenMode OS v3 design system (paper / ink, zen green, Clash Display · Geist · Departure Mono).

## What's on the page

| Section | Notes |
|---|---|
| Hero | Brand-green block, current role and ZenMode widgets |
| 01 ZenMode | The launcher I build: hero art, feature tiles, store links |
| 02 Day job | PayPal and Zoho stat cards with expandable highlights |
| 03 Toolbox | Grouped skill chips |
| 04 Lab | Smaller experiments |
| 05 Time Machine | 3D flight through a repo's last 30 commits (three.js, lazy-loaded) |
| 06 Say hi | Email and links |

Plus the **zen shell** (press <kbd>`</kbd>): a small terminal with `neofetch`, `work`, `breathe`, `duel`, `open`, `cd` and a few easter eggs. The **coding duel** opens from the shell or the <kbd>⌘K</kbd> palette.

All copy lives in `src/data/profile.ts`. Sections, the shell and the command palette read from it, so edit it there.

## Develop

```sh
npm install
npm run dev          # http://localhost:8080
npm run build        # runs the tests, then builds to dist/
npx vitest run       # tests only
```

## GitHub data

The Time Machine calls the GitHub API unauthenticated (60 requests/hour per visitor) and caches answers in `sessionStorage`. When the API is rate-limited it falls back to `public/gh-snapshot.json`. Refresh that snapshot before deploying:

```sh
npm run snapshot:commits   # uses $GITHUB_TOKEN or `gh auth token`
```

## Deploy

Firebase Hosting: project `srinivas-portfolio-1481f`, site `srinivas-t`. `firebase.json` and `.firebaserc` are gitignored, so they live only on the deploying machine.

```sh
npm run snapshot:commits && npm run build && firebase deploy --only hosting
```
