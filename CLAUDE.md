# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive portfolio website built with React 18, TypeScript, and Three.js. Features 3D hero scene, particle effects, a floating developer workflow CLI terminal, and a dark/light theme system.

## Commands

```bash
npm run dev              # Start dev server on port 8080 (Vite HMR)
npm run build            # Production build (runs ALL tests first, fails on test failure)
npm run build:dev        # Dev build without running tests
npm run lint             # ESLint check (strict: --max-warnings 0)
npm run preview          # Preview production build

# Testing (Vitest)
npm run test             # Watch mode
npm run test:unit        # Unit tests only (verbose)
npm run test:functional  # Functional/integration tests
npm run test:performance # Performance tests
npm run test:all         # All test types sequentially
npm run test:coverage    # Coverage report (target: 90%+)
npm run test:ui          # Vitest UI dashboard
```

To run a single test file: `npx vitest run src/components/__tests__/FloatingCLI.test.tsx`

## Architecture

**Stack:** React 18 + TypeScript + Vite 5 + Tailwind CSS + Three.js + shadcn-ui + Firebase Hosting

**Path alias:** `@/*` maps to `./src/*`

**Provider hierarchy** (`src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`):
- `ThemeProvider` (in `main.tsx`) → `QueryClientProvider` + `BrowserRouter` (in `App.tsx`) → `ThemeProvider` again (in `Index.tsx`, redundant nesting)

**Key architectural patterns:**

- **Single-page app** with React Router. Main content is in `src/pages/Index.tsx` which composes all section components.
- **Theme system** via React Context (`src/contexts/ThemeContext.tsx`) with localStorage persistence and system preference detection.
- **3D rendering pipeline:** `Scene3D.tsx` → Three.js canvas via `@react-three/fiber`. `HeroScene.tsx` sets up the scene. `ParticleEffect.tsx` renders device-aware particle systems.
- **Mobile performance tiers:** Components detect device capability and adjust behavior — particle counts (150 mobile vs 300 desktop), frame rates (30fps vs 60fps), and 3D disabling on very low-end devices (<480px).
- **FloatingCLI:** Draggable/minimizable terminal component that animates through a 6-step developer workflow. Has its own responsive CSS overrides.
- **CommitTimeMachine** (`src/components/CommitTimeMachine/`): 3D Three.js timeline for browsing GitHub repo commits. Uses TanStack Query hooks in `src/hooks/useCommitHistory.ts` which wrap `src/lib/github.ts`. GitHub API calls are **unauthenticated** — hitting rate limits (60 req/hr) will cause fetch errors.
- **CodingDuel** (`src/components/CodingDuel/`): Lazy-loaded interactive coding challenge modal (triggered from `Hero`). User code is executed via `new Function()` in `useCodeExecution` — no sandbox. Leaderboard scores persist to `localStorage` under key `duel-leaderboard` via `useLeaderboard`.
- **Data fetching:** TanStack Query (`@tanstack/react-query`) is used for all GitHub API calls. GitHub username is hardcoded as `ThammanaSrinivas` in `src/lib/github.ts`.

**Test organization:**
- `src/components/__tests__/*.test.tsx` — unit tests
- `src/components/__tests__/*.functional.test.tsx` — functional tests
- `src/components/__tests__/*.performance.test.tsx` — performance tests
- `src/lib/utils.test.ts` — utility tests
- `src/contexts/__tests__/` — context tests
- Test setup with mocks for browser APIs (ResizeObserver, IntersectionObserver, matchMedia) in `src/test/setup.ts`

**TypeScript config:** Relaxed strictness — `noImplicitAny: false`, `strictNullChecks: false` in the app config.

**Tailwind theme:** Custom neon color palette (blue, purple, pink, green, orange) and custom keyframe animations (glow-pulse, float, slide-in-up, fade-in, grid-move) defined in `tailwind.config.ts`.

**Environment variables:** EmailJS integration requires `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. See `.env.example`. These are used in `src/components/Contact.tsx`.

**Deployment:** Firebase Hosting (site: srinivas-t). Deploy with `firebase deploy`. SPA rewrites configured. No-cache for HTML, long-lived cache for JS/CSS assets.
