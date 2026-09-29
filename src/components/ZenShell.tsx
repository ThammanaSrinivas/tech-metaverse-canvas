import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { JOBS, LAB, PROFILE } from '@/data/profile';
import { complete, runCommand, SUGGESTIONS, type Line } from '@/lib/zenshell';
import { emitZen, onZen } from '@/lib/zenEvents';
import { ZenMark } from '@/components/zen/primitives';

// The terminal is always ink, whatever the page theme: a dark window reads as "shell" in both.
const INK = { bg: '#111111', raised: '#1A1A1A', line: '#2B2B2B', text: '#F5F5F1', muted: '#9E9E98' };
const KIND_COLOR: Record<string, string> = {
  out: INK.text, muted: INK.muted, accent: '#5BDF62', reward: '#FFC800', error: '#FF8A3D', cmd: INK.text,
};
const PROMPT = `${PROFILE.shortName.toLowerCase()}@zen`;

const BOOT: Line[] = [
  { kind: 'muted', text: 'zen shell 1.0 · booting calm mode…' },
  { kind: 'accent', text: `[ok] loaded ${JOBS.length} jobs, ${LAB.length} lab projects, 1 launcher` },
  { kind: 'out', text: 'type `help`, or tap a suggestion below.' },
];

const Neofetch: React.FC = () => {
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
        <p style={{ color: '#5BDF62' }}>{PROMPT}</p>
        <p style={{ color: INK.muted }}>{'-'.repeat(PROMPT.length)}</p>
        {rows.map(([k, v]) => (
          <p key={k} className="truncate">
            <span style={{ color: '#5BDF62' }}>{k}</span>
            <span style={{ color: INK.muted }}>: </span>
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

const Breathe: React.FC = () => {
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
        <p style={{ color: done ? '#5BDF62' : INK.text }}>
          {done ? 'nice. that was a real pause.' : `${PHASES[phase]}…`}
        </p>
        <p style={{ color: done ? '#FFC800' : INK.muted }}>{done ? '+1 zen score' : 'follow the circle'}</p>
      </div>
    </div>
  );
};

const renderLine = (line: Line, i: number) => {
  if (line.kind === 'neofetch') return <Neofetch key={i} />;
  if (line.kind === 'breathe') return <Breathe key={i} />;
  if (line.kind === 'cmd')
    return (
      <p key={i} className="whitespace-pre-wrap break-words">
        <span style={{ color: '#5BDF62' }}>{PROMPT}</span> <span style={{ color: INK.muted }}>~ %</span> {line.text}
      </p>
    );
  return (
    <p key={i} className="whitespace-pre-wrap break-words" style={{ color: KIND_COLOR[line.kind] }}>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const { setTheme, toggleTheme } = useTheme();

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
    const echo: Line = { kind: 'cmd', text: raw };
    if (!cmd) {
      setLines((prev) => [...prev, echo]);
      return;
    }
    const nextHistory = [...history, cmd];
    setHistory(nextHistory);
    setCursor(null);
    const { lines: out, effect } = runCommand(cmd, { history: nextHistory });

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
      case 'theme':
        if (effect.value === 'toggle') toggleTheme();
        else setTheme(effect.value);
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
      setInput((v) => complete(v));
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
            key="launcher"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2.5 rounded-full border px-4 font-mono text-xs uppercase tracking-[0.1em] shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
            style={{ background: INK.bg, borderColor: INK.line, color: INK.text }}
            aria-label="Open zen shell (backtick key)"
          >
            <Terminal className="h-4 w-4" style={{ color: '#5BDF62' }} />
            <span className="hidden sm:inline">zen shell</span>
            <kbd className="hidden rounded border px-1.5 py-0.5 sm:inline" style={{ borderColor: INK.line, color: INK.muted }}>`</kbd>
            <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full" style={{ background: '#5BDF62' }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="shell"
            role="dialog"
            aria-label="Zen shell"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[72vh] flex-col overflow-hidden rounded-[22px] border font-mono text-[13px] leading-relaxed shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[460px] sm:w-[600px]"
            style={{ background: INK.bg, borderColor: INK.line, color: INK.text }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: INK.line, background: INK.raised }}>
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 rounded-full" style={{ background: '#FF6600' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#FFC800' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#2AA136' }} />
              </span>
              <span className="flex-1 text-center text-xs" style={{ color: INK.muted }}>
                {PROMPT}: ~ — zsh
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
              {lines.map(renderLine)}
              <div className="flex items-center">
                <span style={{ color: '#5BDF62' }}>{PROMPT}</span>
                <span className="mx-1.5" style={{ color: INK.muted }}>~ %</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: INK.text, caretColor: '#5BDF62' }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label="Shell command"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t px-4 py-3" style={{ borderColor: INK.line }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    exec(s);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:border-[#5BDF62] hover:text-[#5BDF62]"
                  style={{ borderColor: INK.line, color: INK.muted }}
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
