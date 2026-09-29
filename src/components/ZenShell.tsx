import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { JOBS, LAB, PROFILE } from '@/data/profile';
import { complete, runCommand, SUGGESTIONS, type Line } from '@/lib/zenshell';
import { emitZen, onZen } from '@/lib/zenEvents';
import { setStarsEnabled, useStarsEnabled } from '@/lib/stars';
import { ZenMark } from '@/components/zen/primitives';
import { readsDark } from '@/lib/zenCursor';

// Two skins, always the opposite of the ground behind the shell: an ink terminal over
// paper, a paper terminal over the ink sections, so it never melts into the page.
interface Skin {
  bg: string; raised: string; line: string; text: string; muted: string;
  accent: string; reward: string; error: string;
}
const INK_SKIN: Skin = {
  bg: '#111111', raised: '#1A1A1A', line: '#2B2B2B', text: '#F5F5F1', muted: '#9E9E98',
  accent: '#5BDF62', reward: '#FFC800', error: '#FF8A3D',
};
const PAPER_SKIN: Skin = {
  bg: '#FAF9F5', raised: '#F2F1ED', line: '#DBD9D2', text: '#111111', muted: '#666861',
  accent: '#0F7A18', reward: '#7A5A00', error: '#B34700',
};
const kindColor = (k: string, sk: Skin) =>
  ({ out: sk.text, muted: sk.muted, accent: sk.accent, reward: sk.reward, error: sk.error, cmd: sk.text })[k] ?? sk.text;

/** Is the page behind this element dark? Samples its centre, looking through the shell itself. */
function useDarkGround(el: React.RefObject<HTMLElement>, deps: unknown[]) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const node = el.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const under = document
        .elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        .find((e) => !e.closest('[data-zen-shell]'));
      setDark(readsDark(under ?? null));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return dark;
}
const PROMPT = `${PROFILE.shortName.toLowerCase()}@zen`;

const BOOT: Line[] = [
  { kind: 'muted', text: 'zen shell 1.0 · booting calm mode…' },
  { kind: 'accent', text: `[ok] loaded ${JOBS.length} jobs, ${LAB.length} lab projects, 1 launcher` },
  { kind: 'out', text: 'type `help`, or tap a suggestion below.' },
];

const Neofetch: React.FC<{ sk: Skin }> = ({ sk }) => {
  const now = JOBS.find((j) => j.current)!;
  const rows: [string, string][] = [
    ['os', 'ZenMode OS / human 1.0'],
    ['host', `${now.company} · ${now.role}`],
    ['uptime', 'shipping since 2021'],
    ['shell', 'zen shell 1.0'],
    ['peak load', '10M+ jobs/day'],
    ['langs', 'Java · Kotlin · TypeScript · Go · Python'],
    ['theme', 'paper / ink · zen green'],
  ];
  return (
    <div className="my-2 flex gap-5">
      <ZenMark size={84} title="ZenMode" className="shrink-0" />
      <div className="min-w-0">
        <p style={{ color: sk.accent }}>{PROMPT}</p>
        <p style={{ color: sk.muted }}>{'-'.repeat(PROMPT.length)}</p>
        {rows.map(([k, v]) => (
          <p key={k} className="truncate">
            <span style={{ color: sk.accent }}>{k}</span>
            <span style={{ color: sk.muted }}>: </span>
            {v}
          </p>
        ))}
        <div className="mt-2 flex gap-1" aria-hidden>
          {['#0F7A18', '#5BDF62', '#FFC800', '#FF6600', '#F2F1ED', '#2B2B2B'].map((c) => (
            <span key={c} className="h-3 w-5 rounded-sm" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PHASES = ['inhale', 'hold', 'exhale'] as const;

const Breathe: React.FC<{ sk: Skin }> = ({ sk }) => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (phase >= PHASES.length) return;
    const id = setTimeout(() => setPhase((p) => p + 1), 4000);
    return () => clearTimeout(id);
  }, [phase]);
  const done = phase >= PHASES.length;

  return (
    <div className="my-3 flex items-center gap-5">
      <div className="flex h-20 w-20 items-center justify-center">
        <motion.span
          className="block rounded-full"
          style={{ background: 'radial-gradient(circle, #5BDF62 0%, #0F7A18 70%)' }}
          initial={{ width: 24, height: 24, opacity: 0.8 }}
          animate={
            reduce ? { width: 48, height: 48 }
              : { width: [24, 72, 72, 24], height: [24, 72, 72, 24], opacity: [0.6, 1, 1, 0.6] }
          }
          transition={{ duration: 12, times: [0, 0.33, 0.66, 1], ease: 'easeInOut' }}
        />
      </div>
      <div>
        <p style={{ color: done ? sk.accent : sk.text }}>
          {done ? 'nice. that was a real pause.' : `${PHASES[phase]}…`}
        </p>
        <p style={{ color: done ? sk.reward : sk.muted }}>{done ? '+1 zen score' : 'follow the circle'}</p>
      </div>
    </div>
  );
};

const renderLine = (line: Line, i: number, sk: Skin) => {
  if (line.kind === 'neofetch') return <Neofetch key={i} sk={sk} />;
  if (line.kind === 'breathe') return <Breathe key={i} sk={sk} />;
  if (line.kind === 'cmd') {
    // Echoed commands carry the directory they ran in: "~/work\tcat paypal.md".
    const [dir, text] = line.text.split('\t');
    return (
      <p key={i} className="whitespace-pre-wrap break-words">
        <span style={{ color: sk.accent }}>{PROMPT}</span> <span style={{ color: sk.muted }}>{dir} %</span> {text}
      </p>
    );
  }
  return (
    <p key={i} className="whitespace-pre-wrap break-words" style={{ color: kindColor(line.kind, sk) }}>
      {line.text}
    </p>
  );
};

const ZenShell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [cwd, setCwd] = useState('~');
  const [starsOn] = useStarsEnabled();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const launcherSk = useDarkGround(launcherRef, [open]) ? PAPER_SKIN : INK_SKIN;
  const windowSk = useDarkGround(windowRef, [open]) ? PAPER_SKIN : INK_SKIN;

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // ` toggles the shell from anywhere except other text fields; the palette and hero can open it too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if (typing && el !== inputRef.current) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    const off = onZen('shell', () => setOpen(true));
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
    };
  }, [toggle]);

  // Boot once, line by line. On close, hand focus back to the launcher (but not on first mount).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true });
      return;
    }
    wasOpen.current = true;
    inputRef.current?.focus();
    if (booted) return;
    setBooted(true);
    const timers = BOOT.map((l, i) => setTimeout(() => setLines((prev) => [...prev, l]), 180 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [open, booted]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    const echo: Line = { kind: 'cmd', text: `${cwd}\t${raw}` };
    if (!cmd) {
      setLines((prev) => [...prev, echo]);
      return;
    }
    const nextHistory = [...history, cmd];
    setHistory(nextHistory);
    setCursor(null);
    const { lines: out, effect, cwd: nextCwd } = runCommand(cmd, { history: nextHistory, cwd });
    if (nextCwd) setCwd(nextCwd);

    if (effect?.type === 'clear') {
      setLines([]);
      return;
    }
    setLines((prev) => [...prev, echo, ...out]);

    switch (effect?.type) {
      case 'open':
        window.open(effect.url, '_blank', 'noopener,noreferrer');
        break;
      case 'scroll':
        document.getElementById(effect.id)?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'stars':
        setStarsEnabled(effect.value === 'toggle' ? !starsOn : effect.value);
        break;
      case 'duel':
        setTimeout(() => {
          setOpen(false);
          emitZen('duel');
        }, 500);
        break;
      case 'exit':
        setOpen(false);
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      exec(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setInput((v) => complete(v, { history, cwd }));
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown' && cursor !== null) {
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput('');
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={launcherRef}
            data-zen-shell
            key="launcher"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2.5 rounded-full border px-4 font-mono text-xs uppercase tracking-[0.1em] shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5"
            style={{ background: launcherSk.bg, borderColor: launcherSk.line, color: launcherSk.text }}
            aria-label="Open zen shell (backtick key)"
          >
            <Terminal className="h-4 w-4" style={{ color: launcherSk.accent }} />
            <span className="hidden sm:inline">zen shell</span>
            <kbd className="hidden rounded border px-1.5 py-0.5 sm:inline" style={{ borderColor: launcherSk.line, color: launcherSk.muted }}>`</kbd>
            <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full" style={{ background: launcherSk.accent }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="shell"
            ref={windowRef}
            data-zen-shell
            role="dialog"
            aria-label="Zen shell"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[72vh] flex-col overflow-hidden rounded-[22px] border font-mono text-[13px] leading-relaxed shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[460px] sm:w-[600px]"
            style={{ background: windowSk.bg, borderColor: windowSk.line, color: windowSk.text }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: windowSk.line, background: windowSk.raised }}>
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 rounded-full" style={{ background: '#FF6600' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#FFC800' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#2AA136' }} />
              </span>
              <span className="flex-1 text-center text-xs" style={{ color: windowSk.muted }}>
                {PROMPT}: {cwd} — zsh
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="rounded-md p-1 transition-colors hover:bg-white/10"
                aria-label="Close zen shell"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
              {lines.map((l, i) => renderLine(l, i, windowSk))}
              <div className="flex items-center">
                <span style={{ color: windowSk.accent }}>{PROMPT}</span>
                <span className="mx-1.5" style={{ color: windowSk.muted }}>{cwd} %</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: windowSk.text, caretColor: windowSk.accent }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label="Shell command"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t px-4 py-3" style={{ borderColor: windowSk.line }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    exec(s);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:opacity-80"
                  style={{ borderColor: windowSk.line, color: windowSk.muted }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZenShell;
