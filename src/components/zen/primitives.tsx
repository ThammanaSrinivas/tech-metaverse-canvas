import React, { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { LINKS, PROFILE } from '@/data/profile';
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

/**
 * Personal "TS" monogram: palette primary tile, best-contrast letters. Follows the live palette.
 * An empty `title` marks it decorative (a link next to it already names it). Each change of `pop`
 * makes the dot land again, in time with the hero's full stop.
 */
export const Monogram: React.FC<{ size?: number; className?: string; title?: string; pop?: number }> = ({
  size = 32,
  className,
  title = 'Thammana Srinivas',
  pop = 0,
}) => {
  const { monoTile, monoInk, monoDot } = useBrandTheme();
  const label = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} {...label}>
      <rect width={1024} height={1024} rx={230} fill={monoTile} />
      <path d={MONOGRAM_PATH} fill={monoInk} />
      <circle key={pop} {...MONOGRAM_DOT} fill={monoDot} className={`zen-mono-dot ${pop ? 'is-popping' : ''}`} />
    </svg>
  );
};

/** The site's one easing for anything that enters or responds. */
// eslint-disable-next-line react-refresh/only-export-components -- shared motion constant
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The logo's orange dot, used as a full stop: things get finished. With `land`, it drops in after
 * `delay` seconds, a little past full size and back. Purely decorative: the sentence it ends is
 * complete without it.
 */
export const FullStop = React.forwardRef<HTMLSpanElement, { land?: boolean; delay?: number; className?: string }>(
  ({ land = false, delay = 0, className = '' }, ref) => (
    <span ref={ref} aria-hidden className={`relative ml-[0.04em] inline-block h-[0.15em] w-[0.15em] ${className}`}>
      <motion.span
        className="absolute inset-0 rounded-full bg-highlight"
        initial={land ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30, delay }}
      />
    </span>
  )
);
FullStop.displayName = 'FullStop';

/** Parent variants for MaskWords: words rise one after another. */
// eslint-disable-next-line react-refresh/only-export-components -- the stagger these primitives animate with
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

/** Copies my email in one tap; falls back to opening the mail app where the clipboard is blocked. */
export const CopyEmail: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = LINKS.email;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email address copied' : 'Copy email address'}
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-small text-muted-foreground transition-colors hover:text-foreground active:scale-[.98]"
    >
      {copied ? <Check aria-hidden className="h-3.5 w-3.5 text-primary" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

/** Top of every inner page: the title, and one line on what the page is for. */
export const PageHeader: React.FC<{ title: string; lead: string; aside?: React.ReactNode; children?: React.ReactNode }> = ({
  title,
  lead,
  aside,
  children,
}) => (
  <header className="mx-auto w-full max-w-[1120px] px-5 pb-4 pt-32 md:pt-40">
    {/* an aside (e.g. the portrait on /about) sits above the title on phones, to its right on wide screens */}
    <div className={aside ? 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10' : ''}>
      <div>
        <h1 className="max-w-4xl text-title">
          <Rich text={title} />
        </h1>
        <p className="mt-5 max-w-2xl text-lead text-muted-foreground">{lead}</p>
      </div>
      {aside && <div className="order-first shrink-0 md:order-none">{aside}</div>}
    </div>
    {children}
  </header>
);

/**
 * A chapter on the site's one grid: a hairline across the top, the chapter's name in a 200px
 * margin beside the content. The margin is the same as the dates on /work, so every page lines up;
 * on wide screens the name stays in view while you read the chapter, like a running head. The
 * small dot before it is the logo's dot.
 */
export const Chapter: React.FC<{ id: string; label: string; children: React.ReactNode; className?: string }> = ({
  id,
  label,
  children,
  className = '',
}) => {
  // Structure draws, content is simply there: the hairline rules itself in from the left the first
  // time the chapter comes into view, and the margin's dot lands at its end. Static under reduced motion.
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const drawn = reduce || seen;
  return (
    <section id={id} className={`mx-auto w-full max-w-[1120px] scroll-mt-20 px-5 py-12 md:py-16 ${className}`}>
      <div ref={ref} className="relative grid gap-6 pt-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 md:pt-8">
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px origin-left bg-border"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: drawn ? 1 : 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <div>
          <h2 className="flex items-center gap-2.5 text-small font-semibold md:sticky md:top-24">
            <motion.span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-primary"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: drawn ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30, delay: 0.35 }}
            />
            {label}
          </h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
};

/** A section's heading, and optionally one plain line under it. No numbers, rules or animation. */
export const SectionHeader: React.FC<{ title: string; kicker?: string }> = ({ title, kicker }) => (
  <div className="mb-8 md:mb-10">
    <h2 className="text-h2">
      <Rich text={title} />
    </h2>
    {kicker && <p className="mt-3 max-w-2xl text-muted-foreground">{kicker}</p>}
  </div>
);

/**
 * Thin reading progress bar pinned to the top, for long reads only (articles). In the primary, not
 * the highlighter: orange is kept for the logo's dot and the page's one marked phrase.
 */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const eased = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  // under reduced motion it follows the scroll exactly, with no spring after it
  const scaleX = useReducedMotion() ? scrollYProgress : eased;
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary" style={{ scaleX }} aria-hidden />;
};

/** A short, quiet settle on first view (10px, under half a second); static under reduced motion. */
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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: EASE }}
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
