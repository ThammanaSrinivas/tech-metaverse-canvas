import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], [role="option"], summary, label, [data-cursor]';
const TEXT_ENTRY = 'input, textarea, select, [contenteditable="true"]';

/**
 * Zen cursor: a precise dot plus a ring that trails on a spring. The ring grows over
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
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });
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
      setHidden(false);
      const el = e.target as Element;
      if (el === last.current) return;
      last.current = el;
      if (el.closest(TEXT_ENTRY)) {
        setHidden(true); // native text caret reads better in inputs
        return;
      }
      const hit = el.closest(INTERACTIVE);
      setHover(!!hit);
      setLabel(hit?.getAttribute('data-cursor') || null);
      setInvert(!!el.closest('[data-cursor-invert]'));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setHidden(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
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
  const size = label ? 64 : hover ? 44 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: hidden ? 0 : 1, transition: 'opacity .2s' }}>
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%', borderColor: color, color }}
        animate={{
          width: size,
          height: size,
          borderWidth: label ? 0 : 1.5,
          backgroundColor: label ? color : hover ? (invert ? 'rgba(255,255,255,.12)' : 'hsl(var(--primary) / .12)') : 'rgba(0,0,0,0)',
          scale: down ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full"
        style={{ x, y, translateX: '-50%', translateY: '-50%', backgroundColor: color, opacity: label ? 0 : 1 }}
      />
    </div>
  );
};

export default ZenCursor;
