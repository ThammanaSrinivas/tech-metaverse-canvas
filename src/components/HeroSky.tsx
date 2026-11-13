import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useBrandTheme } from '@/theme/runtime';
import { toRgb } from '@/theme/color';
import { useStarsEnabled } from '@/lib/stars';
import { useReducedMotion } from '@/lib/hydration';

/**
 * The original hero, in the palette's colours: three shells of points slowly rotating around a
 * camera that sits inside them, so they read as a deep starfield. Same geometry as the
 * old three.js scene (radii 4–8 / 6–12 / 8–16, camera at z=8, fov 75) but projected by
 * hand onto a 2D canvas, so the first screen doesn't pay for three.js.
 *
 * With `bornFrom`, the sky starts empty and is born from that element (the title's full stop) the
 * first time that element is well on screen (never below the fold, where nobody would see it):
 * points appear in order of their distance from it, one, two, four… then all of them within BIRTH
 * seconds. It moves on its own, so it has a Pause control (WCAG 2.2.2); under reduced motion it is
 * drawn whole and starts paused.
 *
 * With `flight` (a taller element the sky is pinned inside), the scroll through it is spent in
 * order. First the birth: scrolling pulls it along (BIRTH_SHARE of the way finishes it, however
 * little time has passed), so the page never moves on while the sky is still being born; the owner
 * found that "weird" when the birth ran on time alone. Then the camera flies forward through the
 * shells, FLIGHT units over whatever scroll is left. Points pass by at their real depths, and
 * while the camera is moving fast each leaves a short trail. Paused, the camera holds still as
 * well. A reader who arrives past the birth (a jump, or from the page below) finds the sky there.
 */
interface Shell {
  pts: Float32Array; // x,y,z triples
  color: string;
  size: number; // world units, like PointMaterial size
  tilt: number; // fixed z rotation of the group
  spin: [number, number, number]; // radians/second around x, y, z
  rot: [number, number, number];
  hi?: Uint8Array; // per-point flag: draw this one in the highlighter
}

const FOV = (75 * Math.PI) / 180;
const CAM_Z = 8;
/** How far the camera travels along z over a whole `flight`: from the shells' edge to just past their centre. */
const FLIGHT = 9.5;
/** Longest trail a point leaves, in px, and the exposure (seconds of travel) a trail stands for. */
const TRAIL_MAX = 56;
const EXPOSURE = 0.05;

function makeShell(count: number, rMin: number, rSpan: number, hiShare = 0) {
  const pts = new Float32Array(count * 3);
  const hi = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * rSpan;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pts[i * 3 + 2] = r * Math.cos(phi);
    hi[i] = Math.random() < hiShare ? 1 : 0;
  }
  return { pts, hi };
}

const rgb = (hex: string) => toRgb(hex).join(',');

/** Seconds from the first point to a full sky; each point fades in over FADE. */
const BIRTH = 2.4;
const FADE = 0.3;
/** How far through a `flight` the scroll alone has finished the birth; the camera sets off from there. */
const BIRTH_SHARE = 0.4;

const HeroSky: React.FC<{ bornFrom?: React.RefObject<HTMLElement>; flight?: React.RefObject<HTMLElement> }> = ({ bornFrom, flight }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  // under reduced motion it starts paused (known once the page is live: the HTML says Pause)
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(reduce);
  useEffect(() => {
    if (reduce) setPaused(true);
  }, [reduce]);
  const pausedRef = useRef(paused);
  const kick = useRef<() => void>(() => {});
  useEffect(() => {
    pausedRef.current = paused;
    kick.current();
  }, [paused]);
  // Shell colours follow the palette: bright neutral, primary, secondary, a few highlighter points.
  const { sky } = useBrandTheme();
  const [bright, primary, secondary, highlight] = sky;
  // the shell's `stars off` turns this sky off too, like the Starfield
  const [on] = useStarsEnabled();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth <= 768;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);

    const a = makeShell(small ? 1200 : 3000, 4, 4);
    const b = makeShell(small ? 900 : 2200, 6, 6);
    const c = makeShell(small ? 500 : 1400, 8, 8, 0.06);
    const shells: Shell[] = [
      { pts: a.pts, color: rgb(bright), size: 0.025, tilt: Math.PI / 4, spin: [-1 / 20, -1 / 25, 0], rot: [0, 0, 0] },
      { pts: b.pts, color: rgb(primary), size: 0.02, tilt: -Math.PI / 6, spin: [1 / 30, 1 / 35, 0], rot: [0, 0, 0] },
      { pts: c.pts, color: rgb(secondary), size: 0.018, tilt: Math.PI / 3, spin: [-1 / 40, 0, 1 / 45], rot: [0, 0, 0], hi: c.hi },
    ];

    const hiColor = `rgb(${rgb(highlight)})`;
    let w = 0;
    let h = 0;
    let focal = 0;
    let camZ = CAM_Z; // moves forward with the scroll through `flight`
    let fly = 0; // 0…1 through the flight, eased
    let speed = 0; // camera speed along z, units/second
    const look = { x: 0, y: 0, tx: 0, ty: 0 }; // pointer parallax, eased
    let visible = true;
    let raf = 0;
    let last = performance.now();
    // Birth: `clock` only runs while playing, so Pause freezes the birth too; scrolling pulls it
    // forward. Until it starts (pending), nothing is drawn; `born[i]` is each point's birth time on
    // that clock, `end` the time the last one is in, `whole` whether every point has begun.
    let clock = 0;
    let pending = !!bornFrom && !reduce;
    let whole = !pending;
    let end = 0;
    let from = 0; // how far through the flight the birth had got: the camera sets off from there
    // without a birth (no origin, or reduced motion) every point is already there, fully faded in
    const borns = shells.map((s) => new Float32Array(s.pts.length / 3).fill(-FADE));

    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = h / 2 / Math.tan(FOV / 2);
    };

    /** Calls `at(i, px, py, size, alpha, depth)` for every point of `s` that lands on screen. */
    const project = (s: Shell, at: (i: number, px: number, py: number, size: number, alpha: number, depth: number) => void) => {
      const [rx, ry, rz] = s.rot;
      // Combined rotation: spin (x, then y, then z), then the group's fixed tilt, then pointer look.
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cz = Math.cos(rz + s.tilt), sz = Math.sin(rz + s.tilt);
      const lx = Math.cos(look.y), slx = Math.sin(look.y);
      const ly = Math.cos(look.x), sly = Math.sin(look.x);
      const half = { x: w / 2, y: h / 2 };
      const n = s.pts.length / 3;
      for (let i = 0; i < n; i++) {
        let x = s.pts[i * 3];
        let y = s.pts[i * 3 + 1];
        let z = s.pts[i * 3 + 2];
        let t = y * cx - z * sx; z = y * sx + z * cx; y = t; // x-axis
        t = x * cy + z * sy; z = -x * sy + z * cy; x = t; // y-axis
        t = x * cz - y * sz; y = x * sz + y * cz; x = t; // z-axis + tilt
        t = y * lx - z * slx; z = y * slx + z * lx; y = t; // look up/down
        t = x * ly + z * sly; z = -x * sly + z * ly; x = t; // look left/right
        const depth = camZ - z;
        if (depth < 0.2) continue;
        const px = half.x + (x * focal) / depth;
        const py = half.y - (y * focal) / depth;
        if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;
        // Cap near points (they'd balloon into squares) and fade the very closest ones out.
        const size = Math.min(2.2, Math.max(0.7, (s.size * focal) / depth));
        const near = depth < 2.5 ? (depth - 0.2) / 2.3 : 1;
        at(i, px, py, size, Math.min(1, 1.5 / Math.sqrt(depth)) * 0.75 * near, depth);
      }
    };

    const drawShell = (s: Shell, born: Float32Array) => {
      // While the camera moves, a point's image slides along the line from the screen's centre, by
      // (its offset from the centre) × (distance travelled) / depth: that is its trail.
      const trails = Math.abs(speed) > 0.4;
      const cx = w / 2;
      const cy = h / 2;
      if (trails) ctx.beginPath();
      project(s, (i, px, py, size, alpha, depth) => {
        const age = clock - born[i];
        if (age <= 0) return;
        ctx.globalAlpha = age < FADE ? (alpha * age) / FADE : alpha;
        if (s.hi?.[i]) {
          ctx.fillStyle = hiColor;
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
          ctx.fillStyle = `rgb(${s.color})`;
        } else ctx.fillRect(px - size / 2, py - size / 2, size, size);
        if (!trails || age < FADE) return;
        const dx = px - cx;
        const dy = py - cy;
        let f = (speed * EXPOSURE) / depth;
        const len = Math.hypot(dx, dy) * Math.abs(f);
        if (len < 1.5) return;
        if (len > TRAIL_MAX) f *= TRAIL_MAX / len;
        ctx.moveTo(px, py);
        ctx.lineTo(px - dx * f, py - dy * f);
      });
      if (trails) {
        ctx.globalAlpha = Math.min(0.32, Math.abs(speed) * 0.06);
        ctx.strokeStyle = `rgb(${s.color})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    /** How far the reader has scrolled through the pinned band: 0 as it pins, 1 as it lets go. */
    const flown = () => {
      const el = flight?.current;
      if (!el || reduce) return 0;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      return travel > 1 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
    };

    /** The origin is where a reader would see the first point: on screen, clear of the bottom edge. */
    const originSeen = () => {
      const o = bornFrom?.current?.getBoundingClientRect();
      return !o || o.top + o.height / 2 <= window.innerHeight * 0.72;
    };

    /** Schedule every point's birth by its distance on screen from the origin element. */
    const beginBirth = (p: number) => {
      pending = false;
      // arrived past the birth (a jump, or from the page below): the sky is there, the camera in place
      if (p > BIRTH_SHARE) {
        whole = true;
        from = BIRTH_SHARE;
        fly = (p - from) / (1 - from);
        return;
      }
      const o = bornFrom?.current?.getBoundingClientRect();
      const r = host.getBoundingClientRect();
      const ox = o ? o.left + o.width / 2 - r.left : w / 2;
      const oy = o ? o.top + o.height / 2 - r.top : h / 2;
      const all: { s: number; i: number; d: number }[] = [];
      shells.forEach((s, si) => {
        borns[si].fill(BIRTH + FADE); // off-screen points simply arrive with the last ones
        project(s, (i, px, py) => all.push({ s: si, i, d: Math.hypot(px - ox, py - oy) }));
      });
      all.sort((a, b) => a.d - b.d);
      // the k-th nearest point is born at BIRTH·(k/N)^(1/3): one, two, four… then a sky
      all.forEach((q, k) => (borns[q.s][q.i] = clock + BIRTH * Math.cbrt(k / all.length)));
      end = clock + BIRTH + FADE;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const playing = !pausedRef.current;
      if (playing) {
        clock += dt;
        for (const s of shells) {
          s.rot[0] += s.spin[0] * dt;
          s.rot[1] += s.spin[1] * dt;
          s.rot[2] += s.spin[2] * dt;
        }
        look.x += (look.tx - look.x) * Math.min(1, dt * 2.5);
        look.y += (look.ty - look.y) * Math.min(1, dt * 2.5);
        const p = flown();
        if (pending && originSeen()) beginBirth(p);
        if (!pending && !whole) {
          // the scroll pulls the birth along, so the page never leaves a half-born sky behind
          const due = end - (BIRTH + FADE) * (1 - Math.min(1, p / BIRTH_SHARE));
          if (due > clock) clock += (due - clock) * Math.min(1, dt * 6);
          if (clock >= end - FADE) {
            whole = true;
            from = Math.min(p, BIRTH_SHARE);
          }
        }
        // back above the band, the whole scroll is the flight again (nothing left to be born)
        if (whole && p === 0) from = 0;
        // the camera follows the scroll with a little weight, so a wheel's steps read as one glide
        const to = whole ? Math.min(1, Math.max(0, (p - from) / (1 - from))) : 0;
        const was = fly;
        fly += (to - fly) * Math.min(1, dt * 6);
        camZ = CAM_Z - fly * FLIGHT;
        speed = dt > 0 ? ((fly - was) * FLIGHT) / dt : 0;
      }
      ctx.clearRect(0, 0, w, h);
      if (!pending)
        shells.forEach((s, si) => {
          ctx.fillStyle = `rgb(${s.color})`;
          drawShell(s, borns[si]);
        });
      ctx.globalAlpha = 1;
      if (playing && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kick.current = restart;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      look.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
      look.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.25;
    };
    const ro = new ResizeObserver(() => {
      resize();
      restart();
    });
    ro.observe(host);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) restart();
      },
      { threshold: 0 }
    );
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', restart);
    resize();
    restart();

    return () => {
      cancelAnimationFrame(raf);
      kick.current = () => {};
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', restart);
    };
  }, [bright, primary, secondary, highlight, on, bornFrom, flight]);

  if (!on) return null;
  return (
    <>
      <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-small text-muted-foreground transition-colors hover:text-foreground active:scale-[.98]"
      >
        {paused ? <Play aria-hidden className="h-3.5 w-3.5" /> : <Pause aria-hidden className="h-3.5 w-3.5" />}
        {paused ? 'Play' : 'Pause'}
        <span className="sr-only"> the night sky</span>
      </button>
    </>
  );
};

export default HeroSky;
