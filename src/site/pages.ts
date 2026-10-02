// SOURCE OF TRUTH: the site map.
//
// Every page is one entry here, and every entry implements the same contract (SitePage):
// site-map metadata AND what the page publishes to the zen shell. Everything else is derived:
//   nav, mobile menu, footer, ⌘K palette, routes (routes.tsx), "Next" links, page headers,
//   and the shell's ~/ filesystem (`ls`, `cd`, `cat`, `tree`, `grep`, `open`).
// To add a page: add an entry below (shell included, or it won't type-check), map its component
// in routes.tsx (also type-checked), done. The menu follows the order here; `nav: false` keeps a
// page out of the menu (still routed, in the sitemap, the shell and ⌘K).
import { BEYOND, JOBS, JOURNEY, LAB, LINKS, PRINCIPLES, PROFILE, SPEAKING, TOOLBOX, ZENMODE, formatDate } from '@/data/profile';
import { POSTS, PUBLISHED } from '@/content/writing';
import { plain } from '@/lib/rich';

export interface ShellFile {
  body: string;
  /** `open <file>` follows this link. */
  url?: string;
}

export interface ShellDir {
  /** Directory name under ~. */
  name: string;
  files: Record<string, ShellFile>;
  /** Route `cd <name>` opens. Defaults to the page itself. */
  route?: string;
}

/** The contract every page implements. */
interface PageDef {
  id: string;
  path: string;
  label: string;
  title: string;
  lead: string;
  /** zen-cli: the directories this page adds under ~ (at least one: the page's own). */
  shell: readonly [ShellDir, ...ShellDir[]];
  /** Only on localhost (dev builds) until it is ready: hidden from nav, routes, shell, sitemap. */
  draft?: boolean;
  /** Has child routes (`<path>/:slug`), e.g. one per article. */
  nested?: boolean;
  /** false: reachable, but not in the menu (and skipped by "Next" links). */
  nav?: boolean;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const md = (...lines: (string | false | undefined)[]) => lines.filter((l) => l !== false && l !== undefined).join('\n');

const DEFS = [
  {
    id: 'work',
    path: '/work',
    label: 'Work',
    title: 'Work',
    lead: 'Platforms that quietly run at scale: multi-tenancy and cloud migration at PayPal, schedulers at Zoho.',
    shell: [
      {
        name: 'work',
        files: Object.fromEntries(
          JOBS.map((j) => [
            `${j.id}.md`,
            {
              body: md(`# ${j.company}: ${j.role} (${j.period})`, '', ...j.story.flatMap((para) => [para, '']), j.earlier),
            },
          ])
        ),
      },
      {
        name: 'how-i-build',
        route: '/work#how-i-build',
        files: Object.fromEntries(
          PRINCIPLES.map((p) => [`${slug(p.title)}.md`, { body: md(`# ${p.title}`, p.claim, '', ...p.seen.map((x) => `- ${x}`)) }])
        ),
      },
      {
        name: 'toolbox',
        route: '/work#toolbox',
        files: Object.fromEntries(TOOLBOX.map((g) => [`${slug(g.group)}.txt`, { body: g.items.join('\n') }])),
      },
      {
        name: 'lab',
        route: '/work#side-projects',
        files: Object.fromEntries(
          LAB.map((p) => [`${p.name}.md`, { body: md(`# ${p.name}`, '', p.blurb, '', `[${p.tags.join(', ')}]`, p.url), url: p.url }])
        ),
      },
    ],
  },
  {
    id: 'writing',
    path: '/writing',
    label: 'Writing',
    title: 'Writing',
    lead: 'Write-ups on what I build: the engineering, the trade-offs behind it, and the story of how it came to be.',
    // the page goes live with its first published post
    draft: PUBLISHED.length === 0,
    nested: true,
    shell: [
      {
        name: 'writing',
        files: Object.fromEntries(
          POSTS.map((p) =>
            p.kind === 'article'
              ? [`${p.slug}.md`, { body: md(`# ${plain(p.title)}`, p.summary, '', p.body) }]
              : [`${p.slug}.url`, { body: md(`# ${plain(p.title)}`, p.summary, '', `on ${p.site}: ${p.href}`), url: p.href }]
          )
        ),
      },
    ],
  },
  {
    id: 'zenmode',
    path: '/zenmode',
    label: 'ZenMode',
    title: 'ZenMode OS',
    lead: 'What I build on my own time: a launcher that makes your phone calmer, kept together with friends.',
    shell: [
      {
        name: 'zenmode',
        files: {
          'README.md': { body: md('# ZenMode OS', 'Quiet the noise, together.', '', ZENMODE.pitch, '', `★ ${ZENMODE.award}`), url: LINKS.zenmode },
          'stats.txt': {
            body: ZENMODE.stats.map((s) => `${`${s.prefix ?? ''}${s.value}${s.unit}`.padEnd(7)}${s.label} (${s.sub})`).join('\n'),
            url: LINKS.producthunt,
          },
          'features.txt': { body: ZENMODE.features.map((f) => `${f.name.padEnd(11)}${f.desc}`).join('\n') },
          'launch.md': {
            body: md(...ZENMODE.milestones.flatMap((m) => [`# ${formatDate(m.date)} · ${m.kind}: ${m.title}`, m.body, ...m.points.map((p) => `- ${p}`), ''])),
            url: ZENMODE.milestones[0].post,
          },
        },
      },
    ],
  },
  {
    id: 'about',
    path: '/about',
    label: 'About',
    title: 'About',
    lead: 'What I do beyond the day job, and the quickest ways to reach me.',
    shell: [
      {
        name: 'about',
        files: {
          'toastmasters.md': {
            body: md(`# ${SPEAKING.org}: ${SPEAKING.mark} ${SPEAKING.title}`, SPEAKING.level, '', SPEAKING.body),
            url: SPEAKING.post,
          },
          ...Object.fromEntries(BEYOND.map((b) => [`${slug(b.title)}.md`, { body: md(`# ${b.title}`, b.label, '', b.body) }])),
          'journey.md': { body: md('# building in public', '', ...JOURNEY.map((m) => `${formatDate(m.date).padEnd(12)} ${m.kind}: ${m.title}`)) },
        },
      },
      {
        name: 'contact',
        route: '/about#contact',
        files: {
          'email.txt': { body: PROFILE.email, url: LINKS.email },
          'linkedin.url': { body: LINKS.linkedin, url: LINKS.linkedin },
          'github.url': { body: LINKS.github, url: LINKS.github },
        },
      },
    ],
  },
  {
    id: 'time-machine',
    path: '/time-machine',
    label: 'Time Machine',
    title: 'Time Machine',
    nav: false,
    lead: 'Fly through the last 30 commits of my public repos. Drag to orbit, click a node for the diff.',
    shell: [
      {
        name: 'time-machine',
        files: {
          'README.md': {
            body: md('# Time Machine', 'The last 30 commits of my public repos, as a 3D timeline.', '', 'drag to orbit · click a node for the diff', 'tip: `timemachine` jumps straight there'),
            url: LINKS.github,
          },
        },
      },
    ],
  },
] as const satisfies readonly PageDef[];

export type PageId = (typeof DEFS)[number]['id'];

export interface SitePage extends PageDef {
  id: PageId;
}

/** The pages this build shows: drafts only on localhost. */
export const PAGES: readonly SitePage[] = (DEFS as readonly PageDef[]).filter((p) => import.meta.env.DEV || !p.draft) as SitePage[];

/** The menu: header, phone menu, footer and "Next" links. */
export const NAV_PAGES: readonly SitePage[] = PAGES.filter((p) => p.nav !== false);

/**
 * Retired addresses → where their content lives now. The router follows these in the app; the
 * same list must be in firebase.json `redirects` (301s), so search engines and old links follow too.
 */
export const REDIRECTS: Record<string, string> = {
  '/beyond': '/about',
  '/contact': '/about#contact',
  '/lab': '/work#side-projects',
  '/explore': '/',
};

export const pageFor = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** Route for a page id; unknown ids go home. */
export const pathFor = (id: string) => PAGES.find((p) => p.id === id)?.path ?? '/';

/** Files that live in ~ itself rather than in a page's directory. */
export const SHELL_HOME: Record<string, ShellFile> = {
  'about.md': { body: md(`# ${PROFILE.name}`, '', PROFILE.line, '', PROFILE.intro) },
  'contact.txt': { body: md(`email     ${PROFILE.email}`, `linkedin  ${LINKS.linkedin}`, `github    ${LINKS.github}`), url: LINKS.email },
  'resume.pdf': { body: '', url: LINKS.resume },
};
