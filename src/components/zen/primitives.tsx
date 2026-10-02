import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Starfield from '@/components/Starfield';
import { useBrandTheme } from '@/theme/runtime';
import { SYSTEM, ZENMODE_COLORS } from '@/theme/palettes';
import { MONOGRAM_DOT, MONOGRAM_PATH } from './monogramPath';
import { parseLinks, parseRich } from '@/lib/rich';
import { Link } from './Link';

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
    <rect width={1024} height={1024} rx={230} fill={ZENMODE_COLORS.zen[700]} />
    <MarkGlyph fill={SYSTEM.white} hole={ZENMODE_COLORS.zen[700]} />
  </svg>
);

/** Personal "TS" monogram: palette primary tile, best-contrast letters. Follows the live palette. */
export const Monogram: React.FC<{ size?: number; className?: string; title?: string }> = ({
  size = 32,
  className,
  title = 'Thammana Srinivas',
}) => {
  const { monoTile, monoInk, monoDot } = useBrandTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} role="img" aria-label={title}>
      <rect width={1024} height={1024} rx={230} fill={monoTile} />
      <path d={MONOGRAM_PATH} fill={monoInk} />
      <circle {...MONOGRAM_DOT} fill={monoDot} />
    </svg>
  );
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Parent variants for MaskWords: words rise one after another. */
export const maskStagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const wordRise = { hidden: { y: '105%' }, show: { y: 0, transition: { duration: 0.75, ease: EASE } } };

/**
 * Each word rises out of its own clipped line box: an editorial headline reveal that stays calm
 * (no fade, no blur). Driven by the parent's hidden/show variants; with reduced motion the parent
 * starts at "show", so the text is simply there.
 */
export const MaskWords: React.FC<{ text: string }> = ({ text }) => {
  // `*word*` marks the accent voice (lib/rich.ts); split into words, keeping each word's voice.
  const words = parseRich(text).flatMap((seg) => seg.text.split(' ').filter(Boolean).map((w) => ({ w, accent: seg.accent })));
  return (
    <>
      {words.map(({ w, accent }, i) => (
        <React.Fragment key={i}>
          {/* italic accent glyphs lean past their box: give the clip room, then take the space back */}
          <span
            className={`-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom ${
              accent ? '-mr-[0.14em] pr-[0.18em]' : 'pr-[0.04em]'
            }`}
          >
            <motion.span variants={wordRise} className={`inline-block ${accent ? 'zen-accent' : ''}`}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </>
  );
};

/** Inline heading text with `*accent*` markup, no animation. */
export const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>
    {parseRich(text).map((seg, i) =>
      seg.accent ? (
        <span key={i} className="zen-accent">
          {seg.text}
        </span>
      ) : (
        <React.Fragment key={i}>{seg.text}</React.Fragment>
      )
    )}
  </>
);

/**
 * Copy with inline links: `[label](/path)` for pages on this site, `[label](https://…)` for the
 * rest (opens in a new tab). Links read as part of the sentence, underlined, not as buttons.
 */
export const LinkedText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {parseLinks(text).map((seg, i) =>
      !seg.href ? (
        <React.Fragment key={i}>{seg.text}</React.Fragment>
      ) : seg.href.startsWith('/') ? (
        <Link key={i} to={seg.href} className="zen-link">
          {seg.text}
        </Link>
      ) : (
        <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" className="zen-link">
          {seg.text}
        </a>
      )
    )}
  </>
);

/**
 * The highlighter: a marker swipe behind the phrase that carries the proof. Sweeps in once when it
 * scrolls into view; the text switches to the ink that reads on the highlighter as it passes.
 * Use it once per screen, or it stops meaning anything.
 */
export const Marker: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '-40px' });
  return (
    <mark ref={ref} className={`zen-marker ${seen ? 'is-on' : ''}`} style={{ transitionDelay: `${delay}s, ${delay + 0.2}s` }}>
      {children}
    </mark>
  );
};

/** Top of every inner page: the title, and one line on what the page is for. */
export const PageHeader: React.FC<{ title: string; lead: string; children?: React.ReactNode }> = ({ title, lead, children }) => (
  <header className="mx-auto w-full max-w-[1120px] px-5 pb-4 pt-32 md:pt-40">
    <h1 className="max-w-4xl text-title">
      <Rich text={title} />
    </h1>
    <p className="mt-5 max-w-2xl text-lead text-muted-foreground">{lead}</p>
    {children}
  </header>
);

/** A section's heading, and optionally one plain line under it. No numbers, rules or animation. */
export const SectionHeader: React.FC<{ title: string; kicker?: string }> = ({ title, kicker }) => (
  <div className="mb-8 md:mb-10">
    <h2 className="text-h2">
      <Rich text={title} />
    </h2>
    {kicker && <p className="mt-3 max-w-2xl text-muted-foreground">{kicker}</p>}
  </div>
);

/** Thin reading progress bar pinned under the nav, in the palette highlighter. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-highlight" style={{ scaleX }} aria-hidden />;
};

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

/**
 * Page section on the 1120px grid. `ink` makes it a full-bleed black band (as on zenmodeos.com):
 * the `dark` class re-scopes every design token inside, so children need no changes.
 */
export const Section: React.FC<{ id: string; children: React.ReactNode; className?: string; ink?: boolean }> = ({
  id,
  children,
  className = '',
  ink = false,
}) => {
  const inner = <div className={`relative mx-auto w-full max-w-[1120px] px-5 py-16 md:py-24 ${className}`}>{children}</div>;
  if (!ink) return <section id={id}>{inner}</section>;
  return (
    <section id={id} className="dark relative my-8 overflow-hidden bg-background text-foreground">
      <Starfield />
      {inner}
    </section>
  );
};
