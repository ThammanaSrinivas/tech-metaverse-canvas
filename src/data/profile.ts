// Single source for everything the page and the zen shell say about me.
// Edit here; sections and shell commands both read from it.

export const RESUME_URL =
  'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing';

export const LINKS = {
  github: 'https://github.com/ThammanaSrinivas',
  linkedin: 'https://www.linkedin.com/in/evolvedaily/',
  email: 'mailto:sreenivast84@gmail.com',
  zenmode: 'https://github.com/ThammanaSrinivas/zenmode',
  zenmodeSite: 'https://zenmodeos.com/',
  playstore: 'https://play.google.com/store/apps/details?id=com.zenlauncher.zenmode',
  resume: RESUME_URL,
} as const;

export const PROFILE = {
  name: 'Thammana Srinivas',
  shortName: 'Srinivas',
  tagline: 'Software engineer. Building a calmer phone.',
  intro:
    'I build cloud platforms by day and a calmer phone by night. At PayPal I work on multi-tenant platforms and cloud migration. On my own time I build ZenMode OS, an open-source Android launcher that helps people scroll less, together.',
  email: 'sreenivast84@gmail.com',
  location: 'Chennai, India',
};

export interface Stat {
  value: string;
  label: string;
  sub: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  period: string;
  current: boolean;
  stats: Stat[];
  highlights: { title: string; body: string }[];
  earlier?: string;
}

export const JOBS: Job[] = [
  {
    id: 'paypal',
    company: 'PayPal',
    role: 'Software Engineer 2',
    period: 'May 2025 — Present',
    current: true,
    stats: [
      { value: '40%', label: 'faster tenant onboarding', sub: 'SCM multi-tenancy' },
      { value: '+3', label: 'API maturity levels', sub: 'zero breaking changes' },
      { value: '500K+', label: 'records benchmarked', sub: 'Bigtable POC' },
    ],
    highlights: [
      { title: 'Multi-tenancy', body: 'across the Simplified Case Management (SCM) platform, plus SCM-Commons onboarding that cut new-tenant onboarding time by 40%.' },
      { title: 'Notification API', body: 'raised 3 levels on the Richardson Maturity Model with zero breaking changes.' },
      { title: 'LLM-powered automation', body: 'replacing manual SOPs: an end-to-end code review agent, a parallel git-worktree feature processor and an integration-test agent.' },
      { title: 'On-prem → GCP', body: 'data migration, automated cloud migration and cloud bug fixes.' },
      { title: 'RAMP onboarding', body: 'of a SaaS-native solution to GCP, enabling cloud deployment for SCM workloads.' },
      { title: 'Bigtable POC', body: 'benchmarking 500K+ records with secondary indexes; showed it did not fit the relational model, avoiding a costly redesign.' },
    ],
  },
  {
    id: 'zoho',
    company: 'Zoho',
    role: 'Member of Technical Staff',
    period: 'Jan 2022 — Apr 2025',
    current: false,
    stats: [
      { value: '10M+', label: 'cron jobs a day', sub: 'Kafka + Redis scheduler' },
      { value: '1h→1m', label: 'min schedule interval', sub: 'fault-tolerant, distributed' },
      { value: '10x', label: 'faster job dispatch', sub: '50ms → 5ms latency' },
    ],
    highlights: [
      { title: 'Distributed cron scheduler', body: '(Kafka, Redis) running 10M+ jobs a day; minimum interval cut from 1 hour to 1 minute.' },
      { title: 'Dispatch latency 50ms → 5ms', body: 'with Redis counters and sorted sets; Kafka messages per cycle down 99.5% (7,000 → 32).' },
      { title: 'HIPAA-compliant audit log service', body: 'built in a month, unblocking the European release and contributing to a 43% revenue increase within 2 months.' },
      { title: 'Catalyst ↔ Zoho Cron adapter', body: 'for custom cron expressions, reaching 35% user adoption in 3 months.' },
      { title: 'Automated error alerting', body: 'by feature context, cutting issue resolution time by 30–40%.' },
      { title: 'FaaS platform', body: 'cold starts 15s → 12s with the Sparkler team; environment variables for functions, resolving 60% of user tickets.' },
    ],
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

export const ZENMODE = {
  pitch: 'ZenMode OS turns your home screen into a calm space built around intent. It doesn’t lock you out. It adds a small pause at the moments you tend to lose time, and makes keeping your screen-time promise something you do together with friends.',
  award: 'Top ~10% of ~780 at FOSS Hack 2026',
  features: [
    { name: 'Zen Score', stat: '07/10', desc: 'Your day, out of 10', icon: 'score' },
    { name: 'Streaks', stat: '13 DAYS', desc: 'Promises kept', icon: 'streak' },
    { name: 'ZenCircle', stat: '2 OF 5', desc: 'Accountability with friends', icon: 'circle' },
    { name: 'Gold Pay', stat: '+ GOLD', desc: 'Time saved becomes gold', icon: 'gold' },
  ] as const,
};

export const SECTIONS = [
  { id: 'zenmode', label: 'ZenMode' },
  { id: 'work', label: 'Work' },
  { id: 'toolbox', label: 'Toolbox' },
  { id: 'lab', label: 'Lab' },
  { id: 'time-machine', label: 'Time Machine' },
  { id: 'contact', label: 'Contact' },
] as const;
