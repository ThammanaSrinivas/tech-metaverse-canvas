// The ZenMode OS pointer, ported from zenmodeos.com (js/cursor.js) so the portfolio
// and the product site share one cursor.
//
// The cursor is the mark. While your hand keeps moving the ring holds closed and the
// dot sits inside it: that is the Hook. Hold still and the diagonal opens the ring and
// the dot steps out into the gap: that is the logo. Ring and dot are one SVG on one
// transform, so they can never drift apart.

const R = 14;
const C = 2 * Math.PI * R;
const GAP_ANGLE = -Math.PI / 4; // the cut runs on the brand diagonal
const GAP_X = Math.cos(GAP_ANGLE) * R;
const GAP_Y = Math.sin(GAP_ANGLE) * R;

const HITS = 'a,button,[role="button"],[role="option"],[data-magnet],[data-cursor],summary,label';
const TEXT_ENTRY = 'input,textarea,select,[contenteditable="true"]';

const INK = '#12160F';
const PAPER = '#F2F1EC';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// Rates are per second, not per frame: fraction of the way to travel this frame.
const k = (b: number, dt: number) => 1 - Math.pow(b, dt);

const BG_RE = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/;

/** Walks up to the first mostly-opaque background and reports whether it is dark. */
function readsDark(el: Element | null): boolean {
  let node: Element | null = el;
  while (node) {
    const m = BG_RE.exec(getComputedStyle(node).backgroundColor);
    if (m) {
      const a = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (a > 0.4) return 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3] < 128;
    }
    node = node.parentElement;
  }
  // Fell through to the page: the body background decides.
  const m = BG_RE.exec(getComputedStyle(document.body).backgroundColor);
  return !!m && 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3] < 128;
}

type MagnetEl = HTMLElement & { zmOff?: { x: number; y: number } };

/** Mounts the cursor; returns a cleanup, or null on touch / reduced-motion devices. */
export function mountZenCursor(): (() => void) | null {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return null;

  const root = document.createElement('div');
  root.className = 'zm-cur';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML =
    '<div class="zm-cur-in">' +
    '<svg viewBox="-24 -24 48 48" width="48" height="48">' +
    `<g class="zm-cur-g"><circle class="zm-cur-ring" r="${R}"></circle>` +
    '<circle class="zm-cur-dot" r="2.6"></circle></g></svg>' +
    '<span class="zm-cur-lab"></span></div>';
  document.body.appendChild(root);
  document.documentElement.classList.add('zm-pointer');

  const inner = root.querySelector<HTMLDivElement>('.zm-cur-in')!;
  const g = root.querySelector<SVGGElement>('.zm-cur-g')!;
  const ring = root.querySelector<SVGCircleElement>('.zm-cur-ring')!;
  const dot = root.querySelector<SVGCircleElement>('.zm-cur-dot')!;
  const lab = root.querySelector<HTMLSpanElement>('.zm-cur-lab')!;

  const p = { x: innerWidth / 2, y: innerHeight / 2 };
  const draw = { x: p.x, y: p.y };
  let prev = { x: p.x, y: p.y };
  let speed = 0;
  let heat = 0;
  let gap = 0;
  let dotT = 0;
  let scale = 1;
  let onDark = false;
  let still = false; // hysteresis: enters below 0.08, exits above 0.16
  let moved = false;
  let hot = false;
  let label = '';
  let flipped = false;
  let checkedOn: Element | null = null;

  const onMove = (e: PointerEvent) => {
    p.x = e.clientX;
    p.y = e.clientY;
    if (!moved) {
      moved = true;
      draw.x = p.x;
      draw.y = p.y;
      prev = { x: p.x, y: p.y };
      root.classList.add('on');
    }
    const t = e.target as Element | null;
    if (t?.closest) {
      if (t !== checkedOn) {
        checkedOn = t;
        onDark = readsDark(t);
        root.classList.toggle('typing', !!t.closest(TEXT_ENTRY));
      }
      const hit = t.closest(HITS);
      hot = !!hit;
      label = hit?.getAttribute('data-cursor') || '';
    }
  };

  const paint = () => {
    const c = onDark ? PAPER : INK;
    ring.style.stroke = c;
    dot.style.fill = c;
    lab.style.color = c;
  };

  // Buttons lean toward the pointer a little when it is close. Measure first, then
  // write, and subtract each element's own offset so a pulled button can't chase itself.
  let magnetEls: MagnetEl[] = [];
  const collectMagnets = () => {
    magnetEls = Array.from(document.querySelectorAll<MagnetEl>('[data-magnet]'));
    magnetEls.forEach((el) => (el.zmOff ??= { x: 0, y: 0 }));
  };
  const pending: [MagnetEl, number, number][] = [];
  const magnets = () => {
    pending.length = 0;
    for (const el of magnetEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -160 || r.top > innerHeight + 160) continue;
      const off = el.zmOff!;
      const dx = p.x - (r.left + r.width / 2 - off.x);
      const dy = p.y - (r.top + r.height / 2 - off.y);
      const reach = Math.max(r.width, r.height) * 0.7 + 54;
      const d = Math.hypot(dx, dy);
      const pull = d < reach ? 1 - d / reach : 0;
      if (pull <= 0 && !off.x && !off.y) continue;
      pending.push([el, dx * pull * 0.22, dy * pull * 0.22]);
    }
    for (const [el, ox, oy] of pending) {
      el.zmOff = { x: ox, y: oy };
      el.style.transform = ox || oy ? `translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px)` : '';
    }
  };
  // Sections mount lazily; re-collect when the DOM changes shape.
  const mo = new MutationObserver(collectMagnets);
  mo.observe(document.body, { childList: true, subtree: true });

  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!moved || dt <= 0) return;

    // speed drives everything: a moving hand is a hooked one
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    prev = { x: p.x, y: p.y };
    speed = lerp(speed, Math.min(1700, Math.hypot(dx, dy) / dt), k(2e-10, dt));

    // hooking is instant, letting go takes a couple of seconds
    const want = clamp(speed / 420, 0, 1);
    heat = lerp(heat, want, k(want > heat ? 1e-11 : 0.22, dt));
    if (still) {
      if (heat > 0.16) still = false;
    } else if (heat < 0.08) still = true;

    gap = lerp(gap, still ? C * 0.3 : 0, k(0.0005, dt));
    dotT = lerp(dotT, still ? 1 : 0, k(0.0018, dt));
    scale = lerp(scale, hot ? 1.75 : 1, k(3.6e-5, dt));
    draw.x = lerp(draw.x, p.x, k(1e-11, dt));
    draw.y = lerp(draw.y, p.y, k(1e-11, dt));

    inner.style.transform = `translate3d(${draw.x.toFixed(1)}px,${draw.y.toFixed(1)}px,0)`;
    g.setAttribute('transform', `scale(${scale.toFixed(3)})`);
    ring.setAttribute('stroke-dasharray', `${(C - gap).toFixed(2)} ${gap.toFixed(2)}`);
    ring.setAttribute('stroke-dashoffset', (gap / 2).toFixed(2));
    dot.setAttribute('cx', (GAP_X * dotT).toFixed(2));
    dot.setAttribute('cy', (GAP_Y * dotT).toFixed(2));

    const text = label || (still ? 'UNHOOKED' : '');
    if (lab.textContent !== text) lab.textContent = text;
    root.classList.toggle('say', !!text);
    if (p.x > innerWidth - 190) flipped = true;
    else if (p.x < innerWidth - 220) flipped = false;
    root.classList.toggle('flip', flipped);

    paint();
    magnets();
  };

  const onDown = () => root.classList.add('down');
  const onUp = () => root.classList.remove('down');
  const onLeave = () => root.classList.remove('on');
  const onEnter = () => moved && root.classList.add('on');
  const onBlur = () => {
    heat = 0;
    speed = 0;
  };
  const onVisible = () => {
    last = performance.now();
  };
  // Scrolling moves content under a still pointer: re-read the ground.
  const onScroll = () => {
    checkedOn = null;
  };

  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown);
  addEventListener('pointerup', onUp);
  addEventListener('resize', collectMagnets);
  addEventListener('blur', onBlur);
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mouseleave', onLeave);
  document.addEventListener('mouseenter', onEnter);
  document.addEventListener('visibilitychange', onVisible);

  collectMagnets();
  paint();
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    mo.disconnect();
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerdown', onDown);
    removeEventListener('pointerup', onUp);
    removeEventListener('resize', collectMagnets);
    removeEventListener('blur', onBlur);
    removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('mouseenter', onEnter);
    document.removeEventListener('visibilitychange', onVisible);
    magnetEls.forEach((el) => (el.style.transform = ''));
    document.documentElement.classList.remove('zm-pointer');
    root.remove();
  };
}
