import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], [role="option"], summary, label, [data-cursor]';
const TEXT_ENTRY = 'input, textarea, select, [contenteditable="true"]';
const RING = 64; // rendered size; smaller states are GPU scales of it, never width/height changes

/**
 * Zen cursor: a precise dot plus a ring that trails slightly. The ring grows over
 * anything clickable and shows a short label from `data-cursor` ("open ↗", "drag").
 * White inside green/ink areas (`data-cursor-invert`), zen green elsewhere.
 * Mouse/trackpad only: touch devices and reduced-motion users keep the system cursor.
 */
const ZenCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [invert, setInvert] = useState(false);
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Tight spring: a hint of trail without feeling late.
  const rx = useSpring(x, { stiffness: 1100, damping: 60, mass: 0.35 });
  const ry = useSpring(y, { stiffness: 1100, damping: 60, mass: 0.35 });
  const last = useRef<Element | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener('change', update);
    return () => fine.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('zen-cursor');

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      // React state only changes when the element under the pointer changes.
      const el = e.target as Element;
      if (el === last.current) return;
      last.current = el;
      setHidden(!!el.closest(TEXT_ENTRY)); // native caret reads better in inputs
      const hit = el.closest(INTERACTIVE);
      setHover(!!hit);
      setLabel(hit?.getAttribute('data-cursor') || null);
      setInvert(!!el.closest('[data-cursor-invert]'));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => {
      last.current = null;
      setHidden(true);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('zen-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const color = invert ? '#FFFFFF' : 'hsl(var(--primary))';
  const scale = (label ? 1 : hover ? 44 / RING : 30 / RING) * (down ? 0.85 : 1);
  const layer: React.CSSProperties = { position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 100, willChange: 'transform' };

  return (
    <div aria-hidden style={{ opacity: hidden ? 0 : 1, transition: 'opacity .15s' }}>
      <motion.div
        style={{ ...layer, x: rx, y: ry, width: RING, height: RING, marginLeft: -RING / 2, marginTop: -RING / 2 }}
      >
        <motion.div
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{ border: `${label ? 0 : 1.5 * (RING / 30)}px solid ${color}`, color }}
          animate={{
            scale,
            backgroundColor: label ? color : hover ? (invert ? 'rgba(255,255,255,.12)' : 'hsla(125,78%,27%,.12)') : 'rgba(0,0,0,0)',
          }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        >
          {label && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{ color: invert ? '#0F7A18' : 'hsl(var(--primary-foreground))' }}
            >
              {label}
            </span>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        style={{ ...layer, x, y, width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: 999, backgroundColor: color, opacity: label ? 0 : 1 }}
      />
    </div>
  );
};

export default ZenCursor;
