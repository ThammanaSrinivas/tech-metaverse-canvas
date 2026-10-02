// Single source for everything the page and the zen shell say about me.
// Edit here; sections and shell commands both read from it.

export const RESUME_URL =
  'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing';

/** The site's own address (custom domain on Firebase Hosting; srinivas-t.web.app still serves). */
export const SITE_URL = 'https://thammanasrinivas.com';

export const LINKS = {
  github: 'https://github.com/ThammanaSrinivas',
  linkedin: 'https://www.linkedin.com/in/thammanasrinivas/',
  email: 'mailto:srinivas@thammanasrinivas.com',
  zenmode: 'https://github.com/ThammanaSrinivas/zenmode',
  zenmodeSite: 'https://zenmodeos.com/',
  playstore: 'https://play.google.com/store/apps/details?id=com.zenlauncher.zenmode',
  producthunt: 'https://www.producthunt.com/products/zenmode-os-android-launcher',
  resume: RESUME_URL,
} as const;

export const PROFILE = {
  name: 'Thammana Srinivas',
  shortName: 'Srinivas',
  tagline: 'Software engineer. Building a calmer phone.',
  /** Who and where, for the home page's <title> and link previews. */
  headline: 'Software Engineer at PayPal, building ZenMode OS',
  /** The one line under my name on the home page. */
  line: 'I build systems that stay simple at scale.',
  /**
   * The home page copy, with inline [links](/path). `intro` is the hero's one sentence; `zoho`
   * sits beside the live scheduler model and carries the page's one highlighter.
   */
  bio: {
    intro: 'Software engineer at [PayPal](/work), working on multi-tenancy and cloud migration. Co-founder of [ZenMode OS](/zenmode).',
    zoho: {
      before: 'Before PayPal, at Zoho, I designed [the job scheduler behind Catalyst](/writing/scheduling-10m-cron-jobs), Zoho’s serverless platform. It took cron jobs from once an hour to every minute, for every user, and ',
      mark: 'one if-condition cut its Kafka traffic from 7,000 messages a cycle to 32',
      after: '.',
    },
  },
  intro:
    'I build cloud platforms by day and a calmer phone by night. At PayPal I work on multi-tenant platforms and cloud migration. On my own time I build ZenMode OS, an open-source Android launcher that helps people scroll less, together.',
  email: 'srinivas@thammanasrinivas.com',
  location: 'Chennai, India',
};

export interface Job {
  id: string;
  company: string;
  role: string;
  period: string;
  current: boolean;
  /** The role in plain prose, numbers inline. Each number appears once on the site. */
  story: string[];
  /** Slug of a write-up about this work, linked under the story. */
  writeup?: string;
  earlier?: string;
}

/** How I build: engineering principles, each with where it shows up. Shown on /work. */
export const PRINCIPLES = [
  {
    title: 'Change the contract, not the callers',
    claim: 'A major change should be 2–3 lines in a core interface plus a new implementation, not a rewrite.',
    seen: [
      'Zoho job scheduling: built around a small core interface, so a major change took 2–3 lines there plus an overloaded implementation, not edits across every caller.',
      'ZenMode OS: the app only knows core-api interfaces; the open-source build plugs in mocks, production plugs in Firebase, discovered at startup.',
      'Zoho: a log export service built on interceptors, so new export features took 2-line changes.',
    ],
  },
  {
    title: 'Write it once, generically',
    claim: 'Solve the general case with generic, typed building blocks and specialise by overloading, instead of copying code per case.',
    seen: [
      'This site: one typed page registry generates the nav, routes, sitemap and the shell; a page missing its component or shell directory fails to compile.',
      'This site: one palette-to-tokens function themes every page, the 3D scene, the cursor and the logo.',
    ],
  },
  {
    title: 'Make the wrong thing fail the build',
    claim: 'Rules nobody has to remember: the build rejects what a review would have to catch.',
    seen: [
      'This site: a brand linter fails on any colour or font defined outside its one source file.',
      'ZenMode OS: the build fails on a hardcoded colour outside the theme.',
    ],
  },
] as const;

/** The sky band on the home page: the dots the site started with, and what they stand for. */
export const SKY = {
  title: 'Every system starts as a *dot*.',
  line: 'One point at a time, until it holds a sky.',
} as const;

/** The featured story on /beyond. Details from the LinkedIn post; photo in public/beyond. */
export const SPEAKING = {
  date: '2026-09-11',
  org: 'Toastmasters',
  mark: '1st place',
  title: 'at the Humorous Speech Contest',
  level: 'Club level',
  body: 'Won at the club level. Toastmasters is where I practise the other half of engineering: explaining ideas clearly, and making a room laugh while doing it.',
  photo: '/beyond/toastmasters-club-win.webp',
  alt: 'Holding the 1st-place trophy at a Toastmasters club speech contest.',
  post: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7504140202756730880/',
  /** One line for the home page. */
  teaser: 'Toastmasters is where I practise the other half of engineering: explaining ideas clearly.',
} as const;

/** Where building in public started. */
export const FIRST_POST: Milestone = {
  date: '2024-11-17',
  kind: 'TechXConf',
  title: 'My first LinkedIn post',
  body: 'A post from TechXConf on networking and AI: the first time I shared what I was learning in public.',
  points: [],
  post: 'https://www.linkedin.com/feed/update/urn:li:share:7263876730933714944/',
};

/** Leadership and community, from LinkedIn: the signals beyond shipping code. */
export const BEYOND = [
  { label: 'Leads', title: 'Scrum master', body: 'Runs the agile ceremonies for my team at PayPal, on top of engineering work.' },
  { label: 'Certified', title: 'OCI 2025 Generative AI Professional', body: 'Oracle Cloud Infrastructure certification in applied generative AI.' },
  { label: 'Community', title: 'FOSS United', body: 'The open-source community where ZenMode OS was built in the open and shown at IndiaFOSS 2026.' },
  { label: 'Plays', title: 'Badminton', body: 'Record against my sister: undefeated. Rematches welcome. 🏸' },
] as const;

export const JOBS: Job[] = [
  {
    id: 'paypal',
    company: 'PayPal',
    role: 'Software Engineer 2',
    period: 'May 2025 — Present',
    current: true,
    story: [
      'I work on the Simplified Case Management (SCM) platform. I implemented multi-tenancy across it and built the SCM-Commons onboarding that cut new-tenant onboarding time by 40%. I took a mission-critical notification API up three levels on the Richardson Maturity Model without a single breaking change for its consumers, and moved data and workloads from on-prem to GCP, including onboarding a SaaS-native solution through RAMP.',
      'I also ran a Bigtable proof of concept, benchmarking 500K+ records with secondary indexes. It showed Bigtable didn’t fit our relational model, which saved a costly redesign. And I build LLM-powered tools that replace manual SOPs: a code-review agent, a parallel git-worktree feature processor and an integration-test agent.',
    ],
  },
  {
    id: 'zoho',
    company: 'Zoho',
    role: 'Member of Technical Staff',
    period: 'Jan 2022 — Apr 2025',
    current: false,
    story: [
      'I worked on Catalyst, Zoho’s serverless platform. I designed its distributed job scheduler on Kafka and Redis: it took the shortest cron interval from an hour to a minute for every user, handled 10M+ jobs a day, and brought job dispatch latency from 50 ms to 5 ms.',
      'I also built a HIPAA-compliant audit-log service in a month, which unblocked the European release and grew revenue by 17%; an adapter between Catalyst and Zoho Cron for custom cron expressions that reached 35% adoption in three months; and error alerting by feature context that cut issue resolution time by 30–40%. As a project trainee I added environment variables for functions, which addressed 60% of user tickets, and Node.js 16 support with 12% faster cold starts.',
    ],
    writeup: 'scheduling-10m-cron-jobs',
    earlier: 'Project Trainee Jan–May 2022 · Summer Intern May–Jun 2021',
  },
];

export const TOOLBOX: { group: string; items: string[] }[] = [
  { group: 'Backend', items: ['Java', 'Spring Boot', 'Golang', 'Kafka', 'Redis', 'PostgreSQL', 'Distributed systems'] },
  { group: 'Cloud', items: ['GCP', 'Bigtable', 'Docker', 'Kubernetes', 'Serverless', 'Cloud migration', 'Multi-tenancy'] },
  { group: 'Android', items: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Cloud Functions'] },
  { group: 'AI + Web', items: ['LLM agents', 'RAG', 'MCP', 'TypeScript', 'React', 'Node.js', 'Python'] },
];

export interface LabProject {
  name: string;
  blurb: string;
  tags: string[];
  url: string;
}

export const LAB: LabProject[] = [
  { name: 'habitica-mcp-server', blurb: 'An MCP server that lets an AI assistant read and update your Habitica habits and tasks.', tags: ['Python', 'MCP'], url: 'https://github.com/ThammanaSrinivas/habitica-mcp-server' },
  { name: 'llm_worktree_orchestrator', blurb: 'Runs LLM coding agents in parallel, one git worktree per feature.', tags: ['LLM agents', 'Git'], url: 'https://github.com/ThammanaSrinivas/llm_worktree_orchestrator' },
  { name: 'RAG_experiment', blurb: 'Chat with PDF documents using retrieval-augmented generation and vector search.', tags: ['Python', 'RAG'], url: 'https://github.com/ThammanaSrinivas/RAG_experiment' },
  { name: 'tech-metaverse-canvas', blurb: 'This site. React, a 3D commit time machine, a coding duel and a tiny shell.', tags: ['React', 'Three.js'], url: 'https://github.com/ThammanaSrinivas/tech-metaverse-canvas' },
];

/** A dated moment with a public post behind it. `date` is ISO (yyyy-mm-dd). */
export interface Milestone {
  date: string;
  kind: string;
  title: string;
  body: string;
  points: string[];
  post: string;
  featured?: boolean;
  image?: string;
  alt?: string;
}

/** "26 Sep 2026" from "2026-09-26". */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const ZENMODE = {
  pitch: 'ZenMode OS turns your home screen into a calm space built around intent. It doesn’t lock you out. It adds a small pause at the moments you tend to lose time, and makes keeping your screen-time promise something you do together with friends.',
  award: 'Top ~10% of ~780 at FOSS Hack 2026',
  /** One line for the home page. */
  teaser: 'Quiet the noise, together: an Android launcher that adds a small pause at the moments you tend to lose time.',
  // Public numbers only (Play listing, Product Hunt leaderboard). Internal installs/DAU stay in zenmode-brain.
  stats: [
    { value: '4.6', unit: '★', label: 'Play Store rating', sub: '24 reviews' },
    { value: '1K', unit: '+', label: 'installs', sub: 'Google Play' },
    { value: '14', prefix: '#', unit: '', label: 'of 711 on Product Hunt', sub: 'launch day · 26 Sep 2026' },
    { value: '7', prefix: '#', unit: '', label: 'most discussed', sub: '16 comments · top 1% of the day' },
  ] as { value: string; prefix?: string; unit: string; label: string; sub: string }[],
  features: [
    { name: 'Zen Score', stat: '07/10', desc: 'Your day, out of 10', icon: 'score' },
    { name: 'Streaks', stat: '13 DAYS', desc: 'Promises kept', icon: 'streak' },
    { name: 'ZenCircle', stat: '2 OF 5', desc: 'Accountability with friends', icon: 'circle' },
    { name: 'Gold Invest', stat: '+ GOLD', desc: 'Time saved becomes gold', icon: 'gold' },
  ] as const,
  /** Milestones, from the LinkedIn posts. Shown on /zenmode, in the /beyond timeline and ~/zenmode/launch.md. */
  milestones: [
    {
      date: '2026-09-26',
      kind: 'Launch day · IndiaFOSS',
      title: 'We launched ZenMode OS',
      body: 'Your phone isn’t the problem. The loop is. We launched on Product Hunt while spending the day at IndiaFOSS. Kamal shaped what ZenMode is; I built most of how it works.',
      points: ['Open source, GPLv3', '1,100+ early installs', '24 comments'],
      post: 'https://www.linkedin.com/posts/thammanasrinivas_producthunt-indiafoss-opensource-ugcPost-7509503115826528256-2ypw/',
    },
    {
      date: '2026-09-26',
      featured: true,
      kind: 'Product Hunt launch',
      title: '#14 of 711 on launch day',
      body: 'Two people, one launch weekend, and a community that tried it and told us the truth. Built and launched with my co-founder, Kamalraaj Senthilkumar.',
      points: ['#1 in the Open Source topic', '#7 of 711 by comments, top 1%', 'Top 1.97% of launches'],
      image: '/zenmode/ph-launch-card.webp',
      alt: 'ZenMode OS Product Hunt stat card: #14 of 711 daily rank, #1 in the Open Source topic, top 1% by comments.',
      post: 'https://www.linkedin.com/feed/update/urn:li:activity:7510153630390595584/',
    },
    {
      date: '2026-04-22',
      kind: 'FOSS Hack 2026 · IIT Madras',
      title: 'Top ~10% of ~780 projects',
      body: 'FOSS Hack 2026, at IIT Madras in Chennai: ZenMode OS placed in the top ~10% of roughly 780 submissions.',
      points: [],
      post: 'https://www.linkedin.com/feed/update/urn:li:activity:7452726557782982656/',
    },
    {
      date: '2026-09-27',
      kind: 'IndiaFOSS',
      title: 'Kailash Nadh offered to help',
      body: 'At IndiaFOSS we met Kailash Nadh, CTO of Zerodha, again. He found the idea behind ZenMode interesting and offered to help us with the Kite API, which powers our Gold Invest feature.',
      points: [],
      post: 'https://www.linkedin.com/feed/update/urn:li:activity:7509812328322719744/',
    },
  ] as Milestone[],
};

/** Building in public, oldest first: every public moment with a post behind it. Shown on /beyond. */
export const JOURNEY: Milestone[] = [
  FIRST_POST,
  ...ZENMODE.milestones,
  { date: SPEAKING.date, kind: SPEAKING.org, title: `${SPEAKING.mark} ${SPEAKING.title}`, body: SPEAKING.level, points: [], post: SPEAKING.post },
].sort((a, b) => a.date.localeCompare(b.date));
