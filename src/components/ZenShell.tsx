import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JOBS, LAB, PROFILE } from '@/data/profile';
import { complete, runCommand, SUGGESTIONS, type Line } from '@/lib/zenshell';
import { PAGES } from '@/site/pages';
import { emitZen, onZen } from '@/lib/zenEvents';
import { setStarsEnabled, useStarsEnabled } from '@/lib/stars';
import { Monogram } from '@/components/zen/primitives';
import { useBrandTheme } from '@/theme/runtime';
import { readsDarkAt } from '@/lib/zenCursor';

// Two skins, always the opposite of the ground behind the shell: an ink terminal over
// paper, a paper terminal over the ink sections, so it never melts into the page.
interface Skin {
  bg: string; raised: string; line: string; text: string; muted: string;
  accent: string; reward: string; error: string;
}
// Values come from the palette generator (src/theme/tokens.ts → --shell-*), so a palette swap restyles the shell.
const skin = (k: 'dark' | 'light'): Skin => ({
  bg: `var(--shell-${k}-bg)`, raised: `var(--shell-${k}-raised)`, line: `var(--shell-${k}-line)`,
  text: `var(--shell-${k}-text)`, muted: `var(--shell-${k}-muted)`, accent: `var(--shell-${k}-accent)`,
  reward: `var(--shell-${k}-reward)`, error: `var(--shell-${k}-error)`,
});
const INK_SKIN = skin('dark');
const PAPER_SKIN = skin('light');
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
      setDark(readsDarkAt(r.left + r.width / 2, r.top + r.height / 2, (e) => !!e.closest('[data-zen-shell]')));
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
  const { palette } = useBrandTheme();
  const rows: [string, string][] = [
    ['os', 'ZenMode OS / human 1.0'],
    ['host', `${now.company} · ${now.role}`],
    ['uptime', 'shipping since 2021'],
    ['shell', 'zen shell 1.0'],
    ['peak load', '10M+ jobs/day'],
    ['langs', 'Java · Kotlin · TypeScript · Go · Python'],
    ['palette', palette.name.toLowerCase()],
  ];
  return (
    <div className="my-2 flex gap-5">
      <Monogram size={84} className="shrink-0" />
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
          {[palette.dark, palette.primary, palette.secondary, palette.highlight, palette.light].map((c) => (
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
          style={{ background: `radial-gradient(circle, ${sk.accent} 0%, ${sk.accent} 35%, transparent 72%)` }}
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

/** Desktop layout: the primary pointer isn't a finger, and there's height for the fixed window. */
const isDesktop = () => !window.matchMedia('(pointer: coarse)').matches && window.innerHeight >= 560;

interface ShellFit {
  /** Inline position/size; empty on desktop (CSS sizes the window). */
  style: React.CSSProperties;
  /** Touch device: show the tab/↑/↓/clear key row. */
  touch: boolean;
  /** Little vertical room (landscape phone, keyboard up): drop the command chips. */
  compact: boolean;
  /** Very little room: drop the touch keys too, keep only output + prompt. */
  tiny: boolean;
}

/**
 * Phones and short screens: size the shell from the *visual* viewport, which shrinks when the
 * keyboard opens and changes on rotation. Portrait: a bottom sheet. Landscape: fills the screen
 * edge to edge (an iPhone 13 in landscape is ~844×340, so the desktop window would be cut off).
 */
function useShellFit(open: boolean): ShellFit {
  const [fit, setFit] = useState<ShellFit>({ style: {}, touch: false, compact: false, tiny: false });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open) return;
    const update = () => {
      if (isDesktop() || !vv) {
        setFit({ style: {}, touch: false, compact: false, tiny: false });
        return;
      }
      const landscape = vv.width > vv.height;
      const height = landscape ? vv.height - 16 : Math.min(vv.height - 16, Math.round(window.innerHeight * 0.78));
      setFit({
        style: { top: vv.offsetTop + vv.height - height - 8, height, left: 8, right: 8, width: 'auto', bottom: 'auto' },
        touch: true,
        compact: height < 380,
        tiny: height < 250,
      });
    };
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [open]);
  return fit;
}

const ZenShell: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [cwd, setCwd] = useState('~');
  const [starsOn] = useStarsEnabled();
  const { palette } = useBrandTheme();
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
      case 'go':
        navigate(effect.to);
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

  // Editing actions, shared by the keyboard and the touch key row.
  const completeInput = () => setInput((v) => complete(v, { history, cwd }));
  const historyUp = () => {
    if (!history.length) return;
    const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
    setCursor(next);
    setInput(history[next]);
  };
  const historyDown = () => {
    if (cursor === null) return;
    const next = cursor + 1;
    if (next >= history.length) {
      setCursor(null);
      setInput('');
    } else {
      setCursor(next);
      setInput(history[next]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      exec(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      completeInput();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      historyUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyDown();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  /** Runs a tap action without stealing focus from the input (keeps the keyboard up). */
  const tap = (fn: () => void) => (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
    inputRef.current?.focus();
  };
  const fit = useShellFit(open);
  // When the window resizes (keyboard up/down, rotation) keep the prompt line in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [fit.style.height]);

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
            className="fixed inset-x-2 bottom-2 z-50 flex h-[78svh] flex-col overflow-hidden rounded-[22px] border font-mono text-[14px] leading-relaxed shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[460px] sm:w-[600px] sm:text-[13px]"
            style={{ background: windowSk.bg, borderColor: windowSk.line, color: windowSk.text, ...fit.style }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className={`flex items-center gap-2 border-b px-4 ${fit.tiny ? 'py-1.5' : 'py-3'}`} style={{ borderColor: windowSk.line, background: windowSk.raised }}>
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 rounded-full" style={{ background: palette.highlight }} />
                <span className="h-3 w-3 rounded-full" style={{ background: palette.secondary }} />
                <span className="h-3 w-3 rounded-full" style={{ background: palette.primary }} />
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
                  className="min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[13px]"
                  style={{ color: windowSk.text, caretColor: windowSk.accent }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  enterKeyHint="go"
                  aria-label="Shell command"
                />
              </div>
            </div>

            <div className="border-t pb-[env(safe-area-inset-bottom)]" style={{ borderColor: windowSk.line }}>
              {/* Touch keys: phones have no Tab or arrow keys. */}
              {fit.touch && !fit.tiny && (
              <div className="flex gap-1.5 px-3 pt-3">
                {[
                  { label: 'tab', run: completeInput },
                  { label: '↑', run: historyUp },
                  { label: '↓', run: historyDown },
                  { label: 'clear', run: () => setLines([]) },
                ].map((k) => (
                  <button
                    key={k.label}
                    onPointerDown={tap(k.run)}
                    className="h-10 flex-1 rounded-lg border text-xs"
                    style={{ borderColor: windowSk.line, color: windowSk.text, background: windowSk.raised }}
                    aria-label={k.label === '↑' ? 'previous command' : k.label === '↓' ? 'next command' : k.label}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              )}
              {/* One-tap commands, then every page from the site map. Dropped when space is tight. */}
              {!fit.compact && (
              <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] sm:px-4">
                {[...SUGGESTIONS, ...PAGES.map((p) => `cd ${p.shell[0].name}`)].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={(e) => {
                      e.stopPropagation();
                      exec(cmd);
                      inputRef.current?.focus();
                    }}
                    className="h-9 shrink-0 rounded-lg border px-3 text-xs transition-colors hover:opacity-80 sm:h-auto sm:px-2.5 sm:py-1"
                    style={{ borderColor: windowSk.line, color: cmd.startsWith('cd ') ? windowSk.accent : windowSk.muted }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
              )}
              {fit.compact && fit.touch && !fit.tiny && <div className="h-3" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZenShell;
