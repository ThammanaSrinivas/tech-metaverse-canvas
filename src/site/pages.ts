// SOURCE OF TRUTH: the site map.
//
// Every page is one entry here, and every entry implements the same contract (SitePage):
// site-map metadata AND what the page publishes to the zen shell. Everything else is derived:
//   nav, mobile menu, footer, ⌘K palette, routes (routes.tsx), "Next" links, page headers,
//   and the shell's ~/ filesystem (`ls`, `cd`, `cat`, `tree`, `grep`, `open`).
// To add a page: add an entry below (shell included, or it won't type-check), map its component
// in routes.tsx (also type-checked), done. Index numbers follow the order here.
import { BEYOND, JOBS, JOURNEY, LAB, LINKS, PRINCIPLES, PROFILE, SPEAKING, TOOLBOX, ZENMODE, formatDate } from '@/data/profile';
import { BRAND } from '@/theme/palettes';
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
  /** One proof point for the home page door. */
  proof: string;
  /** zen-cli: the directories this page adds under ~ (at least one: the page's own). */
  shell: readonly [ShellDir, ...ShellDir[]];
  /** Only on localhost (dev builds) until it is ready: hidden from nav, routes, shell, sitemap. */
  draft?: boolean;
  /** Has child routes (`<path>/:slug`), e.g. one per article. */
  nested?: boolean;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const md = (...lines: (string | false | undefined)[]) => lines.filter((l) => l !== false && l !== undefined).join('\n');

const DEFS = [
  {
    id: 'zenmode',
    path: '/zenmode',
    label: 'ZenMode',
    title: 'ZenMode OS',
    lead: 'What I build on my own time: a launcher that makes your phone calmer, kept together with friends.',
    proof: '1K+ installs',
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
    id: 'work',
    path: '/work',
    label: 'Work',
    title: 'Work',
    lead: 'Platforms that quietly run at scale: multi-tenancy and cloud migration at PayPal, schedulers at Zoho.',
    proof: '10M+ jobs a day',
    shell: [
      {
        name: 'work',
        files: Object.fromEntries(
          JOBS.map((j) => [
            `${j.id}.md`,
            {
              body: md(
                `# ${j.company}: ${j.role} (${j.period})`,
                '',
                ...j.stats.map((s) => `${s.value.padEnd(7)}${s.label} (${s.sub})`),
                '',
                ...j.highlights.map((h) => `- ${h.title} ${h.body}`),
                j.earlier && `\n${j.earlier}`
              ),
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
    ],
  },
  {
    id: 'writing',
    path: '/writing',
    label: 'Writing',
    title: '*Writing*',
    lead: 'Write-ups on what I build: the engineering, the trade-offs behind it, and the story of how it came to be.',
    proof: PUBLISHED.length ? `${PUBLISHED.length} write-up${PUBLISHED.length > 1 ? 's' : ''}` : 'drafts in progress',
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
    id: 'beyond',
    path: '/beyond',
    label: 'Beyond',
    title: 'Beyond the *code*',
    lead: 'Leading the team, speaking on stage, building in the open-source community.',
    proof: '1st place, Toastmasters',
    shell: [
      {
        name: 'beyond',
        files: {
          'toastmasters.md': {
            body: md(`# ${SPEAKING.org}: ${SPEAKING.mark} ${SPEAKING.title}`, SPEAKING.level, '', SPEAKING.body),
            url: SPEAKING.post,
          },
          ...Object.fromEntries(BEYOND.map((b) => [`${slug(b.title)}.md`, { body: md(`# ${b.title}`, b.label, '', b.body) }])),
          'journey.md': { body: md('# building in public', '', ...JOURNEY.map((m) => `${formatDate(m.date).padEnd(12)} ${m.kind}: ${m.title}`)) },
        },
      },
    ],
  },
  {
    id: 'lab',
    path: '/lab',
    label: 'Lab',
    title: 'The *lab*',
    lead: 'Smaller experiments, mostly around LLM agents and developer tooling.',
    proof: 'agents + dev tools',
    shell: [
      {
        name: 'lab',
        files: Object.fromEntries(
          LAB.map((p) => [`${p.name}.md`, { body: md(`# ${p.name}`, '', p.blurb, '', `[${p.tags.join(', ')}]`, p.url), url: p.url }])
        ),
      },
    ],
  },
  {
    id: 'time-machine',
    path: '/time-machine',
    label: 'Time Machine',
    title: 'Time Machine',
    lead: 'Fly through the last 30 commits of my public repos. Drag to orbit, click a node for the diff.',
    proof: '30 commits in 3D',
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
  {
    id: 'explore',
    path: '/explore',
    label: 'Explore',
    title: 'Explore',
    lead: 'The dots from the original hero, given a room of their own. Move your cursor; the sky follows.',
    proof: 'a sky of dots',
    shell: [
      {
        name: 'explore',
        files: {
          'sky.txt': { body: md('Every system starts as a dot.', '', 'three shells of points, rotating around you.', 'move your cursor to steer. `stars off` if you prefer it dark.') },
          'values.md': { body: md(`# ${BRAND.idea}`, '', ...BRAND.values.map((v) => `- ${v.name}: ${v.means}`)) },
        },
      },
    ],
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact',
    title: 'Say *hi*',
    lead: 'Email is the quickest way to reach me. LinkedIn and GitHub work too.',
    proof: 'open to conversations',
    shell: [
      {
        name: 'contact',
        files: {
          'email.txt': { body: PROFILE.email, url: LINKS.email },
          'linkedin.url': { body: LINKS.linkedin, url: LINKS.linkedin },
          'github.url': { body: LINKS.github, url: LINKS.github },
        },
      },
    ],
  },
] as const satisfies readonly PageDef[];

export type PageId = (typeof DEFS)[number]['id'];

export interface SitePage extends PageDef {
  id: PageId;
  /** "01", "02", … from the order above. */
  index: string;
}

/** The pages this build shows: drafts only on localhost. Index numbers follow what is shown. */
export const PAGES: readonly SitePage[] = (DEFS as readonly PageDef[])
  .filter((p) => import.meta.env.DEV || !p.draft)
  .map((p, i) => ({ ...(p as SitePage), index: String(i + 1).padStart(2, '0') }));

export const pageFor = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** Route for a page id; unknown ids go home. */
export const pathFor = (id: string) => PAGES.find((p) => p.id === id)?.path ?? '/';

/** Files that live in ~ itself rather than in a page's directory. */
export const SHELL_HOME: Record<string, ShellFile> = {
  'about.md': { body: md(`# ${PROFILE.name}`, '', BRAND.idea, '', PROFILE.intro) },
  'contact.txt': { body: md(`email     ${PROFILE.email}`, `linkedin  ${LINKS.linkedin}`, `github    ${LINKS.github}`), url: LINKS.email },
  'resume.pdf': { body: '', url: LINKS.resume },
};
