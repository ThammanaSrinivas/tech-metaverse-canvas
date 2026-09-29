// Command interpreter for the zen shell. Pure: takes a command line, returns
// lines to print and an optional side effect for the UI to perform.
import { JOBS, LAB, LINKS, PROFILE, SECTIONS, TOOLBOX, ZENMODE } from '@/data/profile';

export type LineKind = 'out' | 'accent' | 'muted' | 'reward' | 'error' | 'cmd';

export type Line =
  | { kind: LineKind; text: string }
  | { kind: 'neofetch' }
  | { kind: 'breathe' };

export type Effect =
  | { type: 'open'; url: string }
  | { type: 'scroll'; id: string }
  | { type: 'theme'; value: 'light' | 'dark' | 'toggle' }
  | { type: 'duel' }
  | { type: 'clear' }
  | { type: 'exit' };

export interface ShellResult {
  lines: Line[];
  effect?: Effect;
}

export interface ShellContext {
  history: string[];
  now?: Date;
}

const t = (kind: LineKind, text: string): Line => ({ kind, text });

const OPEN_TARGETS: Record<string, string> = {
  github: LINKS.github,
  linkedin: LINKS.linkedin,
  resume: LINKS.resume,
  zenmode: LINKS.zenmode,
  playstore: LINKS.playstore,
  site: LINKS.zenmodeSite,
  email: LINKS.email,
  ...Object.fromEntries(LAB.map((p) => [p.name, p.url])),
};

const SECTION_IDS = SECTIONS.map((s) => s.id);

interface Command {
  help: string;
  args?: string[];
  run: (args: string[], ctx: ShellContext) => ShellResult;
}

const COMMANDS: Record<string, Command> = {
  help: {
    help: 'list commands',
    run: () => ({
      lines: [
        t('muted', 'available commands:'),
        ...Object.entries(COMMANDS)
          .filter(([name]) => !HIDDEN.has(name))
          .map(([name, c]) => t('out', `  ${name.padEnd(12)}${c.help}`)),
        t('muted', 'tab completes · ↑/↓ history · ctrl+l clears · esc closes'),
      ],
    }),
  },
  whoami: {
    help: 'who is this',
    run: () => ({
      lines: [t('accent', PROFILE.name), t('out', PROFILE.tagline), t('muted', PROFILE.intro)],
    }),
  },
  neofetch: {
    help: 'system info, zen edition',
    run: () => ({ lines: [{ kind: 'neofetch' }] }),
  },
  work: {
    help: 'career stats  [paypal|zoho]',
    args: JOBS.map((j) => j.id),
    run: ([which]) => {
      const jobs = which ? JOBS.filter((j) => j.id === which.toLowerCase()) : JOBS;
      if (!jobs.length) return { lines: [t('error', `work: unknown company '${which}'. try: ${JOBS.map((j) => j.id).join(', ')}`)] };
      return {
        lines: jobs.flatMap((j) => [
          t('accent', `${j.company} · ${j.role} · ${j.period}`),
          ...j.stats.map((s) => t('out', `  ${s.value.padEnd(7)}${s.label} (${s.sub})`)),
          ...(which ? j.highlights.map((h) => t('muted', `  - ${h.title} ${h.body}`)) : []),
        ]).concat(which ? [] : [t('muted', 'details: work paypal · work zoho')]),
        effect: { type: 'scroll', id: 'work' },
      };
    },
  },
  zenmode: {
    help: 'the launcher I build',
    run: () => ({
      lines: [
        t('accent', 'ZenMode OS: quiet the noise, together.'),
        t('out', ZENMODE.pitch),
        t('reward', `★ ${ZENMODE.award}`),
        t('muted', 'open zenmode · open playstore'),
      ],
      effect: { type: 'scroll', id: 'zenmode' },
    }),
  },
  skills: {
    help: 'the toolbox',
    run: () => ({
      lines: TOOLBOX.map((g) => t('out', `${g.group.toLowerCase().padEnd(10)}${g.items.join(' · ')}`)),
    }),
  },
  ls: {
    help: 'list lab projects',
    run: () => ({
      lines: [t('accent', 'zenmode/'), ...LAB.map((p) => t('out', `${p.name}/`))],
    }),
  },
  open: {
    help: 'open a link  [github|linkedin|resume|zenmode|…]',
    args: Object.keys(OPEN_TARGETS),
    run: ([target]) => {
      if (!target) return { lines: [t('error', `open: which one? ${Object.keys(OPEN_TARGETS).slice(0, 6).join(', ')}…`)] };
      const url = OPEN_TARGETS[target.toLowerCase()];
      if (!url) return { lines: [t('error', `open: no such link '${target}'`)] };
      return { lines: [t('muted', `opening ${target}…`)], effect: { type: 'open', url } };
    },
  },
  cd: {
    help: 'jump to a section',
    args: SECTION_IDS,
    run: ([id]) => {
      if (!id || id === '~' || id === '..' || id === '/') return { lines: [t('muted', 'home.')], effect: { type: 'scroll', id: 'home' } };
      const match = SECTION_IDS.find((s) => s === id.toLowerCase().replace(/\/$/, ''));
      if (!match) return { lines: [t('error', `cd: no such section: ${id}`)] };
      return { lines: [], effect: { type: 'scroll', id: match } };
    },
  },
  theme: {
    help: 'switch theme  [light|dark]',
    args: ['light', 'dark'],
    run: ([v]) => {
      const value = v === 'light' || v === 'dark' ? v : 'toggle';
      return { lines: [t('muted', `theme → ${value}`)], effect: { type: 'theme', value } };
    },
  },
  breathe: {
    help: 'one calm breath (4-4-4)',
    run: () => ({ lines: [{ kind: 'breathe' }] }),
  },
  duel: {
    help: 'challenge me to a coding duel',
    run: () => ({ lines: [t('reward', '⚔ entering the arena…')], effect: { type: 'duel' } }),
  },
  timemachine: {
    help: 'fly through my commits in 3D',
    run: () => ({ lines: [t('muted', 'warming up the flux capacitor…')], effect: { type: 'scroll', id: 'time-machine' } }),
  },
  history: {
    help: 'what you typed',
    run: (_, ctx) => ({
      lines: ctx.history.length
        ? ctx.history.map((h, i) => t('out', `${String(i + 1).padStart(3)}  ${h}`))
        : [t('muted', 'nothing yet.')],
    }),
  },
  date: {
    help: 'current date',
    run: (_, ctx) => ({ lines: [t('out', (ctx.now ?? new Date()).toString())] }),
  },
  echo: {
    help: 'print text',
    run: (args) => ({ lines: [t('out', args.join(' '))] }),
  },
  clear: { help: 'clear the screen', run: () => ({ lines: [], effect: { type: 'clear' } }) },
  exit: { help: 'close the shell', run: () => ({ lines: [], effect: { type: 'exit' } }) },

  // Easter eggs, hidden from help.
  sudo: {
    help: '',
    run: () => ({ lines: [t('error', `${PROFILE.shortName.toLowerCase()} is not in the sudoers file. this incident will be reported to your zen score.`)] }),
  },
  doomscroll: {
    help: '',
    run: () => ({ lines: [t('reward', 'doomscroll detected. streak at risk.'), t('muted', 'try `breathe` instead.')] }),
  },
  rm: { help: '', run: () => ({ lines: [t('error', 'rm: permission denied. nothing here is disposable.')] }) },
  vim: { help: '', run: () => ({ lines: [t('muted', 'you are now trapped in vim. just kidding. :q')] }) },
  ':q': { help: '', run: () => ({ lines: [t('muted', 'freedom.')] }) },
  coffee: { help: '', run: () => ({ lines: [t('reward', '☕ brewing… 10M jobs/day do not schedule themselves.')] }) },
};

const HIDDEN = new Set(['sudo', 'doomscroll', 'rm', 'vim', ':q', 'coffee']);
const ALIASES: Record<string, string> = {
  projects: 'ls', lab: 'ls', goto: 'cd', skill: 'skills', toolbox: 'skills', about: 'whoami',
  resume: 'open resume', contact: 'cd contact', '?': 'help', man: 'help', scroll: 'doomscroll', q: 'exit', quit: 'exit',
};

export const COMMAND_NAMES = Object.keys(COMMANDS).filter((c) => !HIDDEN.has(c));

export const SUGGESTIONS = ['neofetch', 'work', 'zenmode', 'breathe', 'duel', 'help'];

function closest(input: string): string | undefined {
  const dist = (a: string, b: string) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  const best = COMMAND_NAMES.map((c) => [c, dist(input, c)] as const).sort((a, b) => a[1] - b[1])[0];
  return best && best[1] <= 2 ? best[0] : undefined;
}

export function runCommand(input: string, ctx: ShellContext): ShellResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const [rawName] = trimmed.split(/\s+/);
  const aliased = ALIASES[rawName.toLowerCase()];
  const expanded = aliased ? `${aliased} ${trimmed.slice(rawName.length)}`.trim() : trimmed;
  const [name, ...args] = expanded.split(/\s+/);
  const cmd = COMMANDS[name.toLowerCase()];

  if (!cmd) {
    const guess = closest(name.toLowerCase());
    return {
      lines: [t('error', `zsh: command not found: ${name}`), t('muted', guess ? `did you mean \`${guess}\`?` : 'try `help`')],
    };
  }
  return cmd.run(args, ctx);
}

/** Tab completion: completes the command name, then its first argument. */
export function complete(input: string): string {
  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    const hits = COMMAND_NAMES.filter((c) => c.startsWith(parts[0].toLowerCase()));
    return hits.length === 1 ? `${hits[0]} ` : input;
  }
  const cmd = COMMANDS[parts[0].toLowerCase()];
  const partial = parts[parts.length - 1].toLowerCase();
  const hits = (cmd?.args ?? []).filter((a) => a.startsWith(partial));
  return hits.length === 1 ? [...parts.slice(0, -1), hits[0]].join(' ') : input;
}
