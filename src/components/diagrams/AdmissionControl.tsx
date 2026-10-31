import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useBrandTheme } from '@/theme/runtime';
import { mix } from '@/theme/color';
import { sound, type CueName, type PlayOpts } from '@/lib/sound';

/**
 * A live model of the scheduler's admission control (article: "Scheduling 10M cron jobs a day").
 *
 *   scheduler ──publish──▶ [ pending queue ] ──▶ workers ──ack──▶ (done)
 *
 * Before: every cycle, every due job is published straight into the pending queue, whatever its
 * length. The queue floods. After: one `if`: publish only while the queue holds less than ~10×
 * what the workers can process. The counters show the real numbers from production (7,000 → 32
 * messages per cycle), and only those: the message readout swaps from one to the other, it never
 * counts through numbers that didn't happen. Each dot stands for a batch of jobs. Canvas, brand
 * colours, pauses when off screen. It plays on its own, with a Pause button (moving content needs
 * one), and starts alternating before/after only once the reader can see it, so everyone sees the
 * flood first. Under reduced motion it starts paused on a still frame that already tells the
 * story, and plays only when the reader asks it to.
 */

type Mode = 'before' | 'after';
type State = 'flying' | 'queued' | 'toWorker' | 'working' | 'acking';

interface Job {
  state: State;
  x: number;
  y: number;
  tx: number;
  ty: number;
  t: number; // seconds in the current state
  worker: number;
  hue: number; // tiny per-dot variation so the stream reads as many things, not one blob
}

const CYCLE = 2.2; // seconds per scheduling cycle (a minute, compressed)
const WORKERS = 4;
const WORK_TIME = 0.95;
const CAP = 10; // the if-condition's threshold, in dots (≈10× what the workers take per cycle)
const BEFORE_BURST = 18;
const QUEUE_DRAW_MAX = 92; // dots beyond this are counted as backlog, not drawn
const REAL = { before: 7000, after: 32 } as const;
const HEARD_FOR = CYCLE * 2; // seconds the model stays audible after the reader acts on it
const WRITE_TIME = 0.25; // seconds the if takes to be written in on a switch to After
const SEEN_RATIO = 0.35; // how much of the model must be in view before it starts alternating
const ALTERNATE_EVERY = 9000; // ms between automatic before/after flips, until the reader picks one
// the message readout's swap: the old figure rises out as the new one rises in
const SWAP = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;
const SWAP_INSTANT = { duration: 0 } as const;

const ease = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AdmissionControl: React.FC<{ className?: string }> = ({ className = 'mt-8' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const reduceRef = useRef(reduce);
  const theme = useBrandTheme();
  const [mode, setMode] = useState<Mode>('before');
  const modeRef = useRef<Mode>('before');
  // simulated state only (dots waiting, workers busy): the message figure comes straight from REAL
  const [readout, setReadout] = useState({ backlog: 0, busy: 0, decision: '' as '' | 'submit' | 'skip' });
  const touched = useRef(false); // auto-toggle until the reader takes control
  const [seen, setSeen] = useState(false); // the auto-toggle clock starts once the reader can see the model
  // The model plays on its own, so it must not sound on its own: it is heard only for a moment
  // after the reader picks a mode or presses Play, long enough to hear what they changed.
  const heardUntil = useRef(0);
  const hear = () => (heardUntil.current = performance.now() + HEARD_FOR * 1000);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(() => !reduce);
  const playingRef = useRef(playing);
  // set up by the drawing effect: start or stop the loop to match `playing` and visibility, and
  // fast-forward to a still frame that shows the current mode
  const ctl = useRef<{ sync: () => void; settle: () => void } | null>(null);

  useEffect(() => {
    reduceRef.current = reduce;
    if (reduce) setPlaying(false);
  }, [reduce]);

  useEffect(() => {
    playingRef.current = playing;
    ctl.current?.sync();
  }, [playing]);

  useEffect(() => {
    modeRef.current = mode;
    if (!playingRef.current) ctl.current?.settle();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // no 2D canvas at all: show the text version rather than throw
      setFailed(true);
      return;
    }
    // draw in the colours of wherever the model sits: paper in an article, ink in the home hero
    const s = wrap.closest('.dark') ? theme.dark : theme.light;
    const C = {
      ink: s.foreground,
      muted: s.mutedForeground,
      line: s.border,
      card: s.card,
      tint: s.tint,
      accent: s.primary,
      dot: theme.palette.primary,
      hot: theme.palette.highlight,
      hotSoft: mix(s.card, theme.palette.highlight, 0.12),
      ok: mix(theme.palette.primary, s.card, 0.25),
    };
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace';

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth;
      H = Math.round(Math.max(250, Math.min(330, W * 0.36)));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    let drawNow: () => void = () => {};
    let settle: () => void = () => {};
    const ro = new ResizeObserver(() => {
      const was = W;
      resize();
      // paused, the dots still sit where the old layout put them: settle a fresh still frame
      if (W !== was && !playingRef.current) settle();
      else drawNow();
    });
    ro.observe(wrap);

    // ---- layout (recomputed each frame from W/H so it follows resizes)
    const L = () => {
      const narrow = W < 560;
      const sx = W * (narrow ? 0.11 : 0.1);
      const qx0 = W * (narrow ? 0.24 : 0.27);
      const qx1 = W * (narrow ? 0.7 : 0.68);
      const wx = W * (narrow ? 0.87 : 0.86);
      const cy = H * 0.5;
      const qh = Math.min(70, H * 0.24);
      return { sx, qx0, qx1, wx, cy, qh, narrow };
    };

    let jobs: Job[] = [];
    let backlog = 0;
    let clock = 0;
    let cycleT = CYCLE * 0.6;
    let pulse = 0;
    let decisionT = 0;
    let decision: '' | 'submit' | 'skip' = '';
    // writing the if: on a switch to After, the chip and the cap line draw in before the first
    // cycle that obeys them (complete from the start if the model mounts in After)
    let writeT = WRITE_TIME;
    let lastMode: Mode = modeRef.current;
    const workerBusy: (Job | null)[] = Array(WORKERS).fill(null);
    // Sound follows the picture: scheduler on the left, workers on the right. Silent while
    // fast-forwarding to a still frame.
    let silent = false;
    const heard = () => !silent && performance.now() < heardUntil.current;
    const cue = (name: CueName, opts?: PlayOpts) => heard() && sound.play(name, opts);

    const queueSlot = (i: number) => {
      const { qx0, qx1, cy, qh } = L();
      const cols = Math.max(6, Math.floor((qx1 - qx0 - 20) / 13));
      const rows = 3;
      const perCap = cols * rows;
      if (i < perCap) {
        // fill from the right (the head, nearest the workers) leftwards
        const col = Math.floor(i / rows);
        const row = i % rows;
        return { x: qx1 - 14 - col * 13, y: cy - qh / 2 + 16 + row * ((qh - 32) / (rows - 1)), spill: false };
      }
      // overflow: spills out of the queue and piles up beneath it
      const j = i - perCap;
      const scol = j % (cols + 2);
      const srow = Math.floor(j / (cols + 2));
      return { x: qx1 - 6 - scol * 13, y: cy + qh / 2 + 18 + srow * 12, spill: true };
    };

    const queued = () => jobs.filter((j) => j.state === 'queued' || j.state === 'flying');

    const publish = (n: number) => {
      const { sx, cy } = L();
      for (let k = 0; k < n; k++) {
        const inQueue = queued().length;
        if (inQueue >= QUEUE_DRAW_MAX) {
          backlog += 1;
          cue('spill', { delay: k * 0.035, pan: -0.1 });
          continue;
        }
        const slot = queueSlot(inQueue);
        jobs.push({ state: 'flying', x: sx + 18, y: cy + (Math.random() - 0.5) * 10, tx: slot.x, ty: slot.y, t: -k * 0.035, worker: -1, hue: Math.random() });
        // a clean note while the batch fits (climbing as the queue fills), a dull thud once it spills
        if (slot.spill) cue('spill', { delay: k * 0.035, pan: -0.15 });
        else cue('publish', { delay: k * 0.035, step: (k % 5) + Math.min(5, Math.floor(inQueue / 15)), pan: -0.45 });
      }
    };

    const relayout = () => {
      // re-slot queued dots after the head leaves, so the queue visibly advances
      queued().forEach((j, i) => {
        const slot = queueSlot(i);
        j.tx = slot.x;
        j.ty = slot.y;
        if (j.state === 'queued') j.t = 0;
      });
    };

    const step = (dt: number) => {
      const m = modeRef.current;
      if (m !== lastMode) {
        lastMode = m;
        if (m === 'after') {
          // switching to "after": the cap only governs what is submitted next; the backlog drains
          backlog = 0;
          // write the if in (at once under reduced motion)
          writeT = reduceRef.current ? WRITE_TIME : 0;
        }
      }
      clock += dt;
      cycleT += dt;
      writeT = Math.min(WRITE_TIME, writeT + dt);
      pulse = Math.max(0, pulse - dt * 2.2);
      decisionT = Math.max(0, decisionT - dt);

      // the first cycle after a switch to "after" waits until the if is written
      if (cycleT >= CYCLE && (m === 'before' || writeT >= WRITE_TIME)) {
        cycleT = 0;
        pulse = 1;
        cue('cycle', { pan: -0.55 });
        const len = queued().length + backlog;
        if (m === 'before') {
          publish(BEFORE_BURST);
          decision = '';
        } else {
          const room = CAP - len;
          if (room > 0) {
            publish(Math.min(room, 6));
            decision = 'submit';
          } else decision = 'skip';
          cue(decision, { pan: -0.4 });
          decisionT = 1.1;
        }
      }

      // free workers take from the head of the queue
      for (let w = 0; w < WORKERS; w++) {
        if (workerBusy[w]) continue;
        const head = jobs.find((j) => j.state === 'queued' && j.t > 0.15);
        if (!head) break;
        const { wx, cy } = L();
        head.state = 'toWorker';
        head.t = 0;
        head.worker = w;
        head.tx = wx;
        head.ty = cy - 54 + w * 36;
        workerBusy[w] = head;
        if (backlog > 0) {
          backlog -= 1;
          publish(1);
          backlog = Math.max(0, backlog);
        }
        relayout();
      }

      for (const j of jobs) {
        j.t += dt;
        if (j.state === 'flying' && j.t >= 0) {
          // a gentle arc from the scheduler into the queue
          const p = ease(j.t / 0.5);
          j.x = lerp(j.x, j.tx, p * 0.3 + 0.06);
          j.y = lerp(j.y, j.ty, p * 0.3 + 0.06) - Math.sin(p * Math.PI) * 0.6;
          if (Math.hypot(j.x - j.tx, j.y - j.ty) < 1.2) {
            j.state = 'queued';
            j.t = 0;
          }
        } else if (j.state === 'queued') {
          j.x = lerp(j.x, j.tx, 0.28);
          j.y = lerp(j.y, j.ty, 0.28);
        } else if (j.state === 'toWorker') {
          j.x = lerp(j.x, j.tx, 0.2);
          j.y = lerp(j.y, j.ty, 0.2);
          if (Math.hypot(j.x - j.tx, j.y - j.ty) < 1) {
            j.state = 'working';
            j.t = 0;
          }
        } else if (j.state === 'working' && j.t > WORK_TIME + j.hue * 0.3) {
          j.state = 'acking';
          j.t = 0;
          workerBusy[j.worker] = null;
          cue('ack', { step: j.worker, pan: 0.5 });
        }
      }
      jobs = jobs.filter((j) => !(j.state === 'acking' && j.t > 0.7));
      // the flood has a sound too: a drone that builds with the backlog (nothing once the if holds)
      if (!silent) sound.level(heard() && m === 'before' ? (queued().length + backlog - CAP * 2) / 50 : 0);
    };

    // Hand-built rounded rect: ctx.roundRect only exists from Safari 16 / iOS 16.
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      const rr = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };
    const label = (text: string, x: number, y: number, color: string, align: CanvasTextAlign = 'center', size = 10) => {
      ctx.font = `${size}px ${mono}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
    };

    const draw = () => {
      const m = modeRef.current;
      const { sx, qx0, qx1, wx, cy, qh, narrow } = L();
      ctx.clearRect(0, 0, W, H);

      // ---- connective lines
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(sx + 26, cy);
      ctx.lineTo(qx0 - 6, cy);
      ctx.moveTo(qx1 + 6, cy);
      ctx.lineTo(wx - 30, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // ---- scheduler: a clock face that ticks each cycle
      const r = 24 + pulse * 4;
      ctx.fillStyle = C.card;
      ctx.strokeStyle = pulse > 0 ? mix(C.line, C.accent, pulse) : C.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // (the hand holds at the top while a cycle waits for the if to be written)
      const a = (Math.min(cycleT, CYCLE) / CYCLE) * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, cy);
      ctx.lineTo(sx + Math.cos(a) * 14, cy + Math.sin(a) * 14);
      ctx.stroke();
      label('SCHEDULER', sx, cy + 44, C.muted);

      // how far the if is written in (After only): the chip fades in as the cap line draws down
      const written = m === 'after' ? ease(writeT / WRITE_TIME) : 0;

      // the if-condition chip (after mode): lights up on submit, dims on skip
      if (m === 'after') {
        ctx.globalAlpha = written;
        const txt = narrow ? 'if (q < 10×cap)' : 'if (pending < 10 × capacity)';
        ctx.font = `${narrow ? 9 : 10}px ${mono}`;
        const w = ctx.measureText(txt).width + 18;
        const x = sx - 20;
        const y = cy - 66;
        const on = decision === 'submit' && decisionT > 0;
        const off = decision === 'skip' && decisionT > 0;
        roundRect(x, y, w, 22, 11);
        ctx.fillStyle = on ? C.tint : off ? C.card : C.card;
        ctx.fill();
        ctx.strokeStyle = on ? C.accent : C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
        label(txt, x + 9, y + 15, on ? C.accent : off ? C.muted : C.ink, 'left', narrow ? 9 : 10);
        // above the chip: beside it, it ran into the PENDING QUEUE title at article widths
        if (decisionT > 0) label(on ? 'submit ✓' : 'skip, queue is full', x + 9, y - 7, on ? C.accent : C.muted, 'left', 9);
        ctx.globalAlpha = 1;
      }

      // ---- pending queue capsule
      const flooding = m === 'before' && queued().length + backlog > CAP * 2;
      const strain = flooding ? Math.sin(clock * 9) * 1.2 : 0;
      roundRect(qx0 - strain, cy - qh / 2 - strain / 2, qx1 - qx0 + strain * 2, qh + strain, qh / 2.4);
      ctx.fillStyle = flooding ? C.hotSoft : C.card;
      ctx.fill();
      ctx.strokeStyle = flooding ? C.hot : C.line;
      ctx.lineWidth = flooding ? 1.5 : 1;
      ctx.stroke();
      label(flooding ? 'PENDING QUEUE · FLOODED' : 'PENDING QUEUE', (qx0 + qx1) / 2, cy - qh / 2 - 10, flooding ? C.hot : C.muted);

      // the 10× capacity line, where the if draws its boundary: faint before, drawn down in the
      // accent colour as the if is written
      const capX = queueSlot(CAP).x + 6.5;
      const capY0 = cy - qh / 2 + 4;
      const capY1 = cy + qh / 2 - 4;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      if (written < 1) {
        ctx.strokeStyle = C.line;
        ctx.beginPath();
        ctx.moveTo(capX, capY0);
        ctx.lineTo(capX, capY1);
        ctx.stroke();
      }
      if (written > 0) {
        ctx.strokeStyle = C.accent;
        ctx.beginPath();
        ctx.moveTo(capX, capY0);
        ctx.lineTo(capX, lerp(capY0, capY1, written));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      label('10× cap', capX, cy + qh / 2 + 12, written >= 1 ? C.accent : mix(C.muted, C.accent, written), 'center', 9);

      // ---- workers
      for (let w = 0; w < WORKERS; w++) {
        const y = cy - 54 + w * 36;
        const busy = workerBusy[w];
        roundRect(wx - 22, y - 13, 44, 26, 8);
        ctx.fillStyle = busy ? C.tint : C.card;
        ctx.fill();
        ctx.strokeStyle = busy ? C.accent : C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (busy && busy.state === 'working') {
          // progress arc while the job runs
          const p = Math.min(1, busy.t / (WORK_TIME + busy.hue * 0.3));
          ctx.strokeStyle = C.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wx + 30, y, 6, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
          ctx.stroke();
        }
      }
      label('WORKERS', wx, cy + 90, C.muted);

      // ---- jobs
      for (const j of jobs) {
        if (j.state === 'flying' && j.t < 0) continue;
        const spill = j.state === 'queued' && j.ty > cy + qh / 2;
        let alpha = 1;
        let rr = 3.6;
        let col = spill ? C.hot : C.dot;
        if (j.state === 'acking') {
          alpha = 1 - j.t / 0.7;
          rr = 3.6 + j.t * 10;
          col = C.ok;
          ctx.globalAlpha = Math.max(0, alpha) * 0.7;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(j.x, j.y, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          continue;
        }
        const jitter = spill ? Math.sin(clock * 14 + j.hue * 40) * 0.8 : 0;
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(j.x + jitter, j.y, rr * 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(j.x + jitter, j.y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      if (backlog > 0) label(`+${backlog} more batches waiting`, (qx0 + qx1) / 2, H - 14, C.hot, 'center', 10);
    };

    // ---- loop: runs only while playing and on screen; paused, it holds a still frame
    let raf = 0;
    let last = 0;
    let visible = false;
    let dead = false;
    const safe = (fn: () => void) => {
      if (dead) return;
      try {
        fn();
      } catch (err) {
        dead = true;
        cancelAnimationFrame(raf);
        setFailed(true);
        console.error('AdmissionControl diagram stopped:', err);
      }
    };
    drawNow = () => safe(() => W > 0 && draw());
    const report = () =>
      setReadout((r) => {
        const busy = workerBusy.filter(Boolean).length;
        const next = { backlog: queued().length + backlog, busy, decision };
        return r.backlog === next.backlog && r.busy === next.busy && r.decision === next.decision ? r : next;
      });
    const loop = (t: number) => {
      raf = 0;
      if (dead || !visible || !playingRef.current) return;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      // W is 0 until laid out (e.g. mounted inside a collapsed parent): keep waiting for a size
      if (W > 0) {
        safe(() => {
          step(dt);
          draw();
        });
        if (dead) return;
        report();
      }
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      if (!dead && visible && playingRef.current) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(loop);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        sound.level(0);
      }
    };
    settle = () => {
      // fast-forward a few cycles so a still frame tells the story of the current mode
      silent = true;
      safe(() => {
        for (let i = 0; i < 400; i++) step(0.03);
      });
      silent = false;
      drawNow();
      if (!dead) report();
    };
    ctl.current = { sync, settle };
    // on screen at all: the loop runs. Properly in view (SEEN_RATIO) for the first time: the
    // auto-alternate clock starts, so a reader who scrolls down late still sees the flood first.
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        visible = e.isIntersecting;
        // (a ratio reported at the threshold can land a hair under it)
        if (e.isIntersecting && e.intersectionRatio >= SEEN_RATIO - 0.01) setSeen(true);
        sync();
      },
      { threshold: [0, SEEN_RATIO] },
    );
    if (!playingRef.current) settle();
    io.observe(wrap);

    return () => {
      ctl.current = null;
      cancelAnimationFrame(raf);
      sound.level(0);
      io.disconnect();
      ro.disconnect();
    };
  }, [theme]);

  // gently auto-alternate so a skimming reader sees both states, starting from the first time they
  // can see the model (not from mount); stops once they pick a mode. Not in the text fallback,
  // which has no Pause button to stop it.
  useEffect(() => {
    if (!playing || !seen || failed) return;
    const id = window.setInterval(() => {
      if (!touched.current) setMode((m) => (m === 'before' ? 'after' : 'before'));
    }, ALTERNATE_EVERY);
    return () => window.clearInterval(id);
  }, [playing, seen, failed]);

  const choose = (m: Mode) => {
    touched.current = true;
    hear();
    if (m !== mode) sound.play('switch');
    setMode(m);
  };

  // the before/after switch is a radio group: one tab stop (the checked radio), arrow keys move
  // the choice and the focus. Space/Enter pick the focused radio through the button's own click.
  // Every key choice goes through choose(), exactly like a click.
  const radios = useRef<Partial<Record<Mode, HTMLButtonElement | null>>>({});
  const onRadioKey = (e: React.KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return; // leave browser shortcuts (Alt+← is Back) alone
    if (!['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); // arrows move the choice, not the page
    // two options, so every arrow wraps to the other one (counted from the checked radio, which
    // is the focused one unless the auto-alternate flipped it under the reader's focus)
    const next: Mode = mode === 'before' ? 'after' : 'before';
    choose(next);
    radios.current[next]?.focus();
  };

  return (
    <figure className={`zen-card not-prose overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <p className="zen-label text-muted-foreground">Live model · admission control</p>
        <div className="flex items-center gap-2">
          <div role="radiogroup" aria-label="Scheduler behaviour" className="flex rounded-full border bg-secondary p-1 text-small">
            {(['before', 'after'] as Mode[]).map((m) => (
              <button
                key={m}
                ref={(el) => {
                  radios.current[m] = el;
                }}
                type="button"
                role="radio"
                aria-checked={mode === m}
                tabIndex={mode === m ? 0 : -1}
                onClick={() => choose(m)}
                onKeyDown={onRadioKey}
                className={`rounded-full px-3 py-1 transition-colors ${mode === m ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'before' ? (
                  <>
                    Before<span className="hidden sm:inline">: publish everything</span>
                  </>
                ) : (
                  <>
                    After<span className="hidden sm:inline">: one if</span>
                  </>
                )}
              </button>
            ))}
          </div>
          {!failed && (
            <button
              type="button"
              onClick={() => {
                if (!playing) hear();
                setPlaying(!playing);
              }}
              aria-label={playing ? 'Pause the model' : 'Play the model'}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full border transition-colors ${
                playing ? 'w-9 bg-secondary text-muted-foreground hover:text-foreground' : 'bg-card px-3.5 font-semibold text-foreground shadow-sm'
              }`}
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="text-small">Play</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div ref={wrapRef} className="relative">
        {failed && (
          <p className="px-5 py-10 text-center text-muted-foreground">
            {mode === 'before'
              ? 'Before: every cycle the scheduler published every due job into the pending queue, so the queue flooded: about 7,000 Kafka messages per cycle.'
              : 'After: the scheduler publishes only while the pending queue holds less than ~10× what the workers can process. The queue stays short and the workers stay busy: 32 messages per cycle.'}
          </p>
        )}
        <canvas
          ref={canvasRef}
          className={failed ? 'hidden' : 'block w-full'}
          role="img"
          aria-label={
            mode === 'before'
              ? 'Before: every cycle the scheduler publishes every due job into the pending queue, which floods: about 7,000 Kafka messages per cycle.'
              : 'After: the scheduler publishes only while the pending queue holds less than ten times worker capacity, so the queue stays short and workers stay busy: 32 messages per cycle.'
          }
        />
      </div>
      <div className="grid grid-cols-3 border-t text-center">
        <div className="border-r px-3 py-3">
          {/* only ever one of the two real figures: the old one rises out as the new one rises in
              (an instant swap under reduced motion), never a count through numbers that didn't happen */}
          <p className="grid overflow-hidden font-mono text-h3">
            <AnimatePresence initial={false}>
              <motion.span
                key={mode}
                className={`col-start-1 row-start-1 ${mode === 'before' ? 'text-reward' : 'text-primary'}`}
                initial={{ y: '0.6em', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-0.6em', opacity: 0 }}
                transition={reduce ? SWAP_INSTANT : SWAP}
              >
                {REAL[mode].toLocaleString('en-US')}
              </motion.span>
            </AnimatePresence>
          </p>
          <p className="text-small text-muted-foreground">
            <span className="sm:hidden">msgs / cycle</span>
            <span className="hidden sm:inline">Kafka messages / cycle</span>
          </p>
        </div>
        <div className="border-r px-3 py-3">
          <p className={`font-mono text-h3 ${readout.backlog > CAP * 2 ? 'text-reward' : 'text-foreground'}`}>{readout.backlog}</p>
          <p className="text-small text-muted-foreground">
            waiting<span className="hidden sm:inline"> (dots)</span>
          </p>
        </div>
        <div className="px-3 py-3">
          <p className="font-mono text-h3 text-foreground">
            {readout.busy}/{WORKERS}
          </p>
          <p className="text-small text-muted-foreground">
            <span className="hidden sm:inline">workers </span>busy
          </p>
        </div>
      </div>
      <figcaption className="border-t bg-secondary/50 px-5 py-3 text-small text-muted-foreground">
        Message counts are the real production numbers; each dot is a batch of jobs. Same workers in both modes: the
        difference is only what the scheduler lets into the queue.
      </figcaption>
    </figure>
  );
};

export default AdmissionControl;
