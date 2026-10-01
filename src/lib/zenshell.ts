// Command interpreter for the zen shell. Pure: takes a command line and the current
// directory, returns lines to print, an optional side effect, and the new directory.
import { JOBS, LAB, LINKS, PROFILE, TOOLBOX, ZENMODE } from '@/data/profile';
import { PAGES, SHELL_HOME, pathFor, type ShellFile } from '@/site/pages';

export type LineKind = 'out' | 'accent' | 'muted' | 'reward' | 'error' | 'cmd';

export type Line =
  | { kind: LineKind; text: string }
  | { kind: 'neofetch' }
  | { kind: 'breathe' };

export type Effect =
  | { type: 'open'; url: string }
  | { type: 'go'; to: string }
  | { type: 'stars'; value: boolean | 'toggle' }
  | { type: 'sound'; value: boolean | 'toggle' }
  | { type: 'duel' }
  | { type: 'clear' }
  | { type: 'exit' };

export interface ShellResult {
  lines: Line[];
  effect?: Effect;
  /** Set when the command changed directory. */
  cwd?: string;
}

export interface ShellContext {
  history: string[];
  cwd?: string;
  now?: Date;
}

const t = (kind: LineKind, text: string): Line => ({ kind, text });

// ---------------------------------------------------------------- virtual filesystem
// Built from the site map: every page publishes its own directories (SitePage.shell), so a new
// page shows up in ls/cd/cat/tree/grep without touching the shell.
type File = ShellFile;
interface Dir {
  files: Record<string, File>;
  dirs: string[];
  /** Route `cd` opens. */
  route: string;
}

const PAGE_DIRS = PAGES.flatMap((p) => p.shell.map((d) => ({ ...d, route: d.route ?? p.path })));

const FS: Record<string, Dir> = {
  '~': { dirs: PAGE_DIRS.map((d) => d.name), files: SHELL_HOME, route: '/' },
  ...Object.fromEntries(PAGE_DIRS.map((d) => [`~/${d.name}`, { dirs: [], files: d.files, route: d.route }])),
};

/** Resolve a path relative to cwd. Returns a normalised "~/…" path, or null if it escapes home. */
export function resolvePath(cwd: string, input = '~'): string | null {
  const raw = input.replace(/\/+$/, '') || '/';
  const base = raw === '/' || raw === '~' || raw.startsWith('~/') || raw.startsWith('/') ? [] : cwd.split('/').slice(1);
  const parts = raw.replace(/^~\/?|^\//, '').split('/').filter(Boolean);
  const out = [...base];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') {
      if (!out.length) return null;
      out.pop();
    } else out.push(p);
  }
  return ['~', ...out].join('/');
}

const splitFile = (path: string) => {
  const i = path.lastIndexOf('/');
  return { dir: path.slice(0, i), name: path.slice(i + 1) };
};

function findFile(cwd: string, arg: string): { path: string; file: File } | null {
  const path = resolvePath(cwd, arg);
  if (!path) return null;
  const { dir, name } = splitFile(path);
  const file = FS[dir]?.files[name];
  return file ? { path, file } : null;
}

const listing = (path: string, long: boolean): Line[] => {
  const d = FS[path];
  const dirs = d.dirs.map((n) => t('accent', long ? `drwxr-xr-x  ${n}/` : `${n}/`));
  const files = Object.entries(d.files).map(([n, f]) =>
    t('out', long ? `-rw-r--r--  ${String(f.body.length).padStart(5)}  ${n}` : n)
  );
  return [...dirs, ...files];
};

const allFiles = () =>
  Object.entries(FS).flatMap(([dir, d]) => Object.entries(d.files).map(([name, file]) => ({ path: `${dir}/${name}`, file })));

// ---------------------------------------------------------------- commands
interface Command {
  help: string;
  args?: (ctx: ShellContext) => string[];
  run: (args: string[], ctx: ShellContext) => ShellResult;
}

const cwdOf = (ctx: ShellContext) => ctx.cwd ?? '~';
const pathArgs = (ctx: ShellContext) => {
  const d = FS[cwdOf(ctx)];
  return [...d.dirs.map((n) => `${n}/`), ...Object.keys(d.files), '..', '~'];
};

const FORTUNES = [
  'the feed is infinite. your evening is not.',
  'a kept promise is worth more than a perfect streak.',
  'ship small, sleep well.',
  'the best notification is the one you never needed.',
  'scale the system, not the stress.',
  'put the phone down. the commit can wait until morning.',
];

const COMMANDS: Record<string, Command> = {
  help: {
    help: 'list commands',
    run: () => ({
      lines: [
        t('muted', 'files:    ls · cd · cat · tree · pwd · grep · open'),
        t('muted', 'me:       whoami · neofetch · work · stats · skills'),
        t('muted', 'calm:     breathe · fortune · stars'),
        t('muted', 'play:     duel · timemachine'),
        t('muted', 'shell:    history · man <cmd> · clear · exit'),
        t('out', 'tab completes · ↑/↓ history · ctrl+l clears · esc closes'),
      ],
    }),
  },
  man: {
    help: 'describe a command',
    args: () => COMMAND_NAMES,
    run: ([name]) => {
      const c = name && COMMANDS[name];
      return c ? { lines: [t('accent', name), t('out', `  ${c.help}`)] } : { lines: [t('error', 'man: which command? e.g. man cat')] };
    },
  },
  ls: {
    help: 'list files  [-l] [dir]',
    args: pathArgs,
    run: (args, ctx) => {
      const long = args.some((a) => /^-[la]+$/.test(a));
      const arg = args.find((a) => !a.startsWith('-'));
      const target = arg ? resolvePath(cwdOf(ctx), arg) : cwdOf(ctx);
      if (!target) return { lines: [t('error', 'ls: permission denied: nothing above ~')] };
      if (FS[target]) return { lines: listing(target, long) };
      if (arg && findFile(cwdOf(ctx), arg)) return { lines: [t('out', arg)] };
      return { lines: [t('error', `ls: ${arg}: no such file or directory`)] };
    },
  },
  cd: {
    help: 'change directory (opens that page)',
    args: pathArgs,
    run: ([arg], ctx) => {
      const target = resolvePath(cwdOf(ctx), arg ?? '~');
      if (target && FS[target]) {
        return { lines: [], cwd: target, effect: { type: 'go', to: FS[target].route } };
      }
      // Page ids work as jump targets from anywhere (cd explore inside ~/work).
      const page = PAGES.find((p) => p.id === arg?.toLowerCase().replace(/\/$/, ''));
      if (page) return { lines: [], cwd: `~/${page.shell[0].name}`, effect: { type: 'go', to: page.path } };
      if (target === null) return { lines: [t('error', 'cd: nothing above ~. this is home.')] };
      return { lines: [t('error', `cd: no such directory: ${arg}`)] };
    },
  },
  pwd: { help: 'print working directory', run: (_, ctx) => ({ lines: [t('out', cwdOf(ctx).replace('~', `/home/${PROFILE.shortName.toLowerCase()}`))] }) },
  cat: {
    help: 'print a file',
    args: pathArgs,
    run: ([arg], ctx) => {
      if (!arg) return { lines: [t('error', 'cat: which file? try `ls`')] };
      const hit = findFile(cwdOf(ctx), arg);
      if (!hit) {
        const target = resolvePath(cwdOf(ctx), arg);
        return { lines: [t('error', target && FS[target] ? `cat: ${arg}: is a directory` : `cat: ${arg}: no such file`)] };
      }
      if (hit.path.endsWith('.pdf')) return { lines: [t('muted', 'binary file. try `open resume.pdf`')] };
      return { lines: hit.file.body.split('\n').map((l) => t(l.startsWith('#') ? 'accent' : l.startsWith('★') ? 'reward' : 'out', l)) };
    },
  },
  tree: {
    help: 'show every file',
    run: () => {
      const lines: Line[] = [t('accent', '~')];
      const root = FS['~'];
      const entries = [...root.dirs.map((d) => ({ dir: d })), ...Object.keys(root.files).map((f) => ({ file: f }))];
      entries.forEach((e, i) => {
        const last = i === entries.length - 1;
        if ('file' in e) return lines.push(t('out', `${last ? '└──' : '├──'} ${e.file}`));
        lines.push(t('accent', `${last ? '└──' : '├──'} ${e.dir}/`));
        const files = Object.keys(FS[`~/${e.dir}`].files);
        files.forEach((f, j) => lines.push(t('out', `${last ? '    ' : '│   '}${j === files.length - 1 ? '└──' : '├──'} ${f}`)));
      });
      const count = allFiles().length;
      lines.push(t('muted', `\n${FS['~'].dirs.length} directories, ${count} files`));
      return { lines };
    },
  },
  grep: {
    help: 'search every file  grep <text>',
    run: (args) => {
      const q = args.join(' ').toLowerCase();
      if (!q) return { lines: [t('error', 'grep: search for what? e.g. grep kafka')] };
      const hits = allFiles().flatMap(({ path, file }) =>
        file.body.split('\n').filter((l) => l.toLowerCase().includes(q)).map((l) => ({ path, l }))
      );
      if (!hits.length) return { lines: [t('muted', `no matches for '${q}'`)] };
      return { lines: hits.slice(0, 12).map(({ path, l }) => t('out', `${path.replace('~/', '')}: ${l.trim()}`)) };
    },
  },
  open: {
    help: 'open a link or file  [github|linkedin|resume|zenmode|playstore|producthunt|<file>]',
    args: (ctx) => [...Object.keys(OPEN_TARGETS), ...Object.keys(FS[cwdOf(ctx)].files)],
    run: ([target], ctx) => {
      if (!target) return { lines: [t('error', 'open: which one? try `open resume`')] };
      const url = OPEN_TARGETS[target.toLowerCase()] ?? findFile(cwdOf(ctx), target)?.file.url;
      if (!url) return { lines: [t('error', `open: nothing to open for '${target}'`)] };
      return { lines: [t('muted', `opening ${target}…`)], effect: { type: 'open', url } };
    },
  },
  whoami: {
    help: 'who is this',
    run: () => ({ lines: [t('accent', PROFILE.name), t('out', PROFILE.tagline), t('muted', PROFILE.intro)] }),
  },
  neofetch: { help: 'system info, zen edition', run: () => ({ lines: [{ kind: 'neofetch' }] }) },
  work: {
    help: 'career stats  [paypal|zoho]',
    args: () => JOBS.map((j) => j.id),
    run: ([which]) => {
      const jobs = which ? JOBS.filter((j) => j.id === which.toLowerCase()) : JOBS;
      if (!jobs.length) return { lines: [t('error', `work: unknown company '${which}'. try: ${JOBS.map((j) => j.id).join(', ')}`)] };
      return {
        lines: jobs
          .flatMap((j) => [
            t('accent', `${j.company} · ${j.role} · ${j.period}`),
            ...j.stats.map((s) => t('out', `  ${s.value.padEnd(7)}${s.label} (${s.sub})`)),
            ...(which ? j.highlights.map((h) => t('muted', `  - ${h.title} ${h.body}`)) : []),
          ])
          .concat(which ? [] : [t('muted', 'details: work paypal · cat work/zoho.md')]),
        effect: { type: 'go', to: pathFor('work') },
      };
    },
  },
  stats: {
    help: 'ZenMode OS by the numbers',
    run: () => ({
      lines: [
        t('accent', 'ZenMode OS'),
        ...ZENMODE.stats.map((s) => t('out', `  ${`${s.prefix ?? ''}${s.value}${s.unit}`.padEnd(7)}${s.label} (${s.sub})`)),
        t('reward', `  ★ ${ZENMODE.award}`),
      ],
      effect: { type: 'go', to: pathFor('zenmode') },
    }),
  },
  zenmode: { help: 'the launcher I build', run: (_, ctx) => COMMANDS.cat.run(['~/zenmode/README.md'], ctx) },
  skills: {
    help: 'the toolbox',
    run: () => ({ lines: TOOLBOX.map((g) => t('out', `${g.group.toLowerCase().padEnd(10)}${g.items.join(' · ')}`)) }),
  },
  top: {
    help: "what's running",
    run: () => ({
      lines: [
        t('muted', '  PID  %FOCUS  COMMAND'),
        t('accent', '    1    62.0  paypal --scm --multi-tenant --gcp'),
        t('accent', '    2    30.0  zenmode-os --build --night-shift'),
        t('out', '    3     5.0  zen-shell (you are here)'),
        t('out', '    4     3.0  sleep   # working on it'),
        t('muted', '    -     0.0  doomscroll   [killed]'),
      ],
    }),
  },
  fortune: {
    help: 'a calm thought',
    run: (_, ctx) => ({ lines: [t('reward', FORTUNES[(ctx.now ?? new Date()).getSeconds() % FORTUNES.length])] }),
  },
  uptime: {
    help: 'how long I have been shipping',
    run: (_, ctx) => {
      const years = ((ctx.now ?? new Date()).getTime() - new Date('2021-05-01').getTime()) / (365.25 * 864e5);
      return { lines: [t('out', `up ${years.toFixed(1)} years, 2 companies, 1 launcher, load average: calm`)] };
    },
  },
  breathe: { help: 'one calm breath (4-4-4)', run: () => ({ lines: [{ kind: 'breathe' }] }) },
  stars: {
    help: 'night sky in the ink sections  [on|off]',
    args: () => ['on', 'off'],
    run: ([v]) => {
      const value = v === 'on' ? true : v === 'off' ? false : 'toggle';
      return { lines: [t('muted', `stars → ${value === 'toggle' ? 'toggled' : v}`)], effect: { type: 'stars', value } };
    },
  },
  sound: {
    help: 'site sound, off until you turn it on  [on|off]',
    args: () => ['on', 'off'],
    run: ([v]) => {
      const value = v === 'on' ? true : v === 'off' ? false : 'toggle';
      return { lines: [t('muted', `sound → ${value === 'toggle' ? 'toggled' : v}`)], effect: { type: 'sound', value } };
    },
  },
  duel: { help: 'challenge me to a coding duel', run: () => ({ lines: [t('reward', '⚔ entering the arena…')], effect: { type: 'duel' } }) },
  timemachine: {
    help: 'fly through my commits in 3D',
    run: () => ({ lines: [t('muted', 'warming up the flux capacitor…')], effect: { type: 'go', to: pathFor('time-machine') } }),
  },
  history: {
    help: 'what you typed',
    run: (_, ctx) => ({
      lines: ctx.history.length ? ctx.history.map((h, i) => t('out', `${String(i + 1).padStart(3)}  ${h}`)) : [t('muted', 'nothing yet.')],
    }),
  },
  date: { help: 'current date', run: (_, ctx) => ({ lines: [t('out', (ctx.now ?? new Date()).toString())] }) },
  echo: { help: 'print text', run: (args) => ({ lines: [t('out', args.join(' '))] }) },
  clear: { help: 'clear the screen', run: () => ({ lines: [], effect: { type: 'clear' } }) },
  exit: { help: 'close the shell', run: () => ({ lines: [], effect: { type: 'exit' } }) },

  // Easter eggs, hidden from completion.
  sudo: {
    help: '',
    run: () => ({ lines: [t('error', `${PROFILE.shortName.toLowerCase()} is not in the sudoers file. this incident will be reported to your zen score.`)] }),
  },
  badminton: {
    help: '',
    run: () => ({
      lines: [
        t('accent', '🏸 match history vs. sister'),
        t('reward', 'W W W W W W W W W W W W'),
        t('muted', 'record: undefeated · rematches welcome'),
      ],
    }),
  },
  doomscroll: { help: '', run: () => ({ lines: [t('reward', 'doomscroll detected. streak at risk.'), t('muted', 'try `breathe` instead.')] }) },
  rm: { help: '', run: () => ({ lines: [t('error', 'rm: permission denied. nothing here is disposable.')] }) },
  vim: { help: '', run: () => ({ lines: [t('muted', 'you are now trapped in vim. just kidding. :q')] }) },
  ':q': { help: '', run: () => ({ lines: [t('muted', 'freedom.')] }) },
  coffee: { help: '', run: () => ({ lines: [t('reward', '☕ brewing… 10M jobs/day do not schedule themselves.')] }) },
};

const OPEN_TARGETS: Record<string, string> = {
  github: LINKS.github,
  linkedin: LINKS.linkedin,
  resume: LINKS.resume,
  zenmode: LINKS.zenmode,
  playstore: LINKS.playstore,
  producthunt: LINKS.producthunt,
  site: LINKS.zenmodeSite,
  email: LINKS.email,
  ...Object.fromEntries(LAB.map((p) => [p.name, p.url])),
};

const HIDDEN = new Set(['sudo', 'doomscroll', 'badminton', 'rm', 'vim', ':q', 'coffee']);
const ALIASES: Record<string, string> = {
  projects: 'ls ~/lab', lab: 'ls ~/lab', goto: 'cd', ll: 'ls -l', dir: 'ls', toolbox: 'skills', about: 'cat ~/about.md',
  resume: 'open resume', contact: 'cat ~/contact.txt', '?': 'help', scroll: 'doomscroll', q: 'exit', quit: 'exit', cls: 'clear',
};

export const COMMAND_NAMES = Object.keys(COMMANDS).filter((c) => !HIDDEN.has(c));

export const SUGGESTIONS = ['ls', 'neofetch', 'cat about.md', 'stats', 'breathe', 'duel'];

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
    return { lines: [t('error', `zsh: command not found: ${name}`), t('muted', guess ? `did you mean \`${guess}\`?` : 'try `help`')] };
  }
  return cmd.run(args, ctx);
}

/** Tab completion: completes the command name, then its argument (paths are cwd-relative). */
export function complete(input: string, ctx: ShellContext = { history: [] }): string {
  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    const hits = COMMAND_NAMES.filter((c) => c.startsWith(parts[0].toLowerCase()));
    return hits.length === 1 ? `${hits[0]} ` : input;
  }
  const cmd = COMMANDS[parts[0].toLowerCase()];
  const partial = parts[parts.length - 1].toLowerCase();
  const hits = (cmd?.args?.(ctx) ?? []).filter((a) => a.toLowerCase().startsWith(partial));
  return hits.length === 1 ? [...parts.slice(0, -1), hits[0]].join(' ') : input;
}
