import React, { useEffect, useRef } from 'react';
import { useBrandTheme } from '@/theme/runtime';
import { toRgb } from '@/theme/color';

/**
 * The original hero, in the palette's colours: three shells of points slowly rotating around a
 * camera that sits inside them, so they read as a deep starfield. Same geometry as the
 * old three.js scene (radii 4–8 / 6–12 / 8–16, camera at z=8, fov 75) but projected by
 * hand onto a 2D canvas, so the first screen doesn't pay for three.js.
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

const HeroSky: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  // Shell colours follow the palette: bright neutral, primary, secondary, a few highlighter points.
  const { sky } = useBrandTheme();
  const [bright, primary, secondary, highlight] = sky;

  useEffect(() => {
    const canvas = ref.current!;
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
    const look = { x: 0, y: 0, tx: 0, ty: 0 }; // pointer parallax, eased
    let visible = true;
    let raf = 0;
    let last = performance.now();

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

    const drawShell = (s: Shell) => {
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
        const depth = CAM_Z - z;
        if (depth < 0.2) continue;
        const px = half.x + (x * focal) / depth;
        const py = half.y - (y * focal) / depth;
        if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;
        // Cap near points (they'd balloon into squares) and fade the very closest ones out.
        const size = Math.min(2.2, Math.max(0.7, (s.size * focal) / depth));
        const near = depth < 2.5 ? (depth - 0.2) / 2.3 : 1;
        ctx.globalAlpha = Math.min(1, 1.5 / Math.sqrt(depth)) * 0.75 * near;
        if (s.hi?.[i]) {
          ctx.fillStyle = hiColor;
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
          ctx.fillStyle = `rgb(${s.color})`;
        } else ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) {
        for (const s of shells) {
          s.rot[0] += s.spin[0] * dt;
          s.rot[1] += s.spin[1] * dt;
          s.rot[2] += s.spin[2] * dt;
        }
        look.x += (look.tx - look.x) * Math.min(1, dt * 2.5);
        look.y += (look.ty - look.y) * Math.min(1, dt * 2.5);
      }
      ctx.clearRect(0, 0, w, h);
      for (const s of shells) {
        ctx.fillStyle = `rgb(${s.color})`;
        drawShell(s);
      }
      ctx.globalAlpha = 1;
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

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
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) restart();
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', restart);
    resize();
    restart();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', restart);
    };
  }, [bright, primary, secondary, highlight]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />;
};

export default HeroSky;
