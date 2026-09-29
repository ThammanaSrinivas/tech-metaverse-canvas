import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ZenMode mark on a 1024 grid, traced from the app icon. Rounded via stroke-linejoin.
const MARK_POLYS = [
  '214,214 416,214 214,416',
  '810,810 607,810 810,607',
  '600.6,216 810,216 810,423.4 423.4,810 214,810 214,602.6',
];

export const MarkGlyph: React.FC<{ fill: string; hole?: string }> = ({ fill, hole }) => (
  <>
    {MARK_POLYS.map((p) => (
      <polygon key={p} points={p} fill={fill} stroke={fill} strokeWidth={80} strokeLinejoin="round" />
    ))}
    {hole && <circle cx={510} cy={510} r={40} fill={hole} />}
  </>
);

/** White mark on a brand-green tile. */
export const ZenMark: React.FC<{ size?: number; className?: string; title?: string }> = ({
  size = 32,
  className,
  title = 'ZenMode',
}) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} role="img" aria-label={title}>
    <rect width={1024} height={1024} rx={230} fill="#0F7A18" />
    <MarkGlyph fill="#FFFFFF" hole="#0F7A18" />
  </svg>
);

/** Numbered section heading shared by every section: mono index chip, Clash title, hairline. */
export const SectionHeader: React.FC<{ index: string; title: string; kicker?: string }> = ({ index, title, kicker }) => (
  <div className="mb-8 md:mb-10">
    <div className="flex items-center gap-4">
      <span className="zen-label rounded-lg border border-tint-line bg-tint px-2.5 py-1 text-primary">{index}</span>
      <h2 className="text-3xl md:text-4xl">{title}</h2>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
    {kicker && <p className="mt-3 max-w-2xl text-muted-foreground md:ml-[4.25rem]">{kicker}</p>}
  </div>
);

/** Fade-and-rise on first view; static when the user prefers reduced motion. */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const Section: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({
  id,
  children,
  className = '',
}) => (
  <section id={id} className={`mx-auto w-full max-w-[1120px] px-5 py-16 md:py-24 ${className}`}>
    {children}
  </section>
);
