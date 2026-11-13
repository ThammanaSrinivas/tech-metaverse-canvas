import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight, LockOpen, Play, SkipForward } from 'lucide-react';
import { LINKS, ZENMODE } from '@/data/profile';
import { Chapter, Picture, Reveal, useArrival } from '@/components/zen/primitives';
import ZenPhone from '@/components/ZenPhone';
import { useReducedMotion } from '@/lib/hydration';
import { sound } from '@/lib/sound';

type IconKind = (typeof ZENMODE.features)[number]['icon'];

const EASE = [0.22, 1, 0.36, 1] as const;

// Small glyphs in the site's primary (the coin in the highlight, on its own card). Two play their idea once as they scroll in (the score ring
// fills, the circle gathers; useArrival); the flame and the coin are still. All static under reduced motion.
const FeatureIcon: React.FC<{ kind: IconKind }> = ({ kind }) => {
  const ref = useRef<SVGSVGElement>(null);
  const { arrived, from, instant } = useArrival(ref, '-40px');
  const go = <T extends object>(t: T) => (instant ? { duration: 0 } : t);
  if (kind === 'score')
    return (
      <svg ref={ref} width="36" height="36" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" className="stroke-border" strokeWidth="5" />
        <motion.circle cx="20" cy="20" r="15" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round"
          transform="rotate(-90 20 20)"
          initial={{ pathLength: from ? 0 : 0.7 }} animate={{ pathLength: arrived ? 0.7 : 0 }}
          transition={go({ duration: 1.4, ease: EASE })} />
      </svg>
    );
  if (kind === 'streak')
    return (
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden>
        <path className="fill-primary" d="M20 4c2 9 13 13 13 24a13 13 0 0 1-26 0c0-7 5-11 7-16 2 5 4 7 6 7-1-5-2-10 0-15Z" />
      </svg>
    );
  if (kind === 'circle')
    return (
      <svg ref={ref} width="36" height="36" viewBox="0 0 40 40" aria-hidden className="fill-primary">
        {[
          { cx: 12, cy: 25, o: 0.55, from: [-8, 6] },
          { cx: 28, cy: 25, o: 0.8, from: [8, 6] },
          { cx: 20, cy: 13, o: 1, from: [0, -8] },
        ].map((c, i) => {
          const apart = { x: c.from[0], y: c.from[1], scale: 0.4 };
          return (
            <motion.circle key={i} cx={c.cx} cy={c.cy} r="9" opacity={c.o}
              initial={from ? apart : false} animate={arrived ? { x: 0, y: 0, scale: 1 } : apart}
              transition={go({ duration: 0.7, delay: 0.1 * i, ease: EASE })} />
          );
        })}
      </svg>
    );
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="16" className="fill-highlight" />
      <circle cx="20" cy="20" r="10.5" fill="none" className="stroke-background" strokeOpacity=".6" strokeWidth="2" />
    </svg>
  );
};

/** The product: the screenshot, the pitch, and where to get it. */
const Product: React.FC = () => (
  <Chapter id="product" label="Product">
    {/* near the top of the page: fetch it first (React 18 only knows the lowercase attribute) */}
    <Picture
      src={ZENMODE.hero.src}
      srcSet={ZENMODE.hero.srcset}
      sizes={ZENMODE.hero.sizes}
      alt={ZENMODE.hero.alt}
      width={1094}
      height={647}
      loading="eager"
      {...{ fetchpriority: 'high' }}
    />
    <p className="mt-8 max-w-[60ch] text-lead">{ZENMODE.pitch}</p>
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* the page's one filled button, in the site's primary: the .zen scope would pull in the
          product's own 165 KB font for this one label */}
      <a
        href={LINKS.playstore}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Play className="h-4 w-4" aria-hidden /> Get it on Google Play
      </a>
      {ZENMODE.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 font-semibold">
          {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      ))}
    </div>
    <p className="mt-4 text-small text-muted-foreground">{ZENMODE.source}</p>
  </Chapter>
);

const CARD = 'rounded-[20px] border p-5';

/**
 * The pinned track's scroll, spent in order: a moment on the whole screen, a fifth for each feature
 * in turn, then the whole screen again before the page moves on.
 */
const STEP_FROM = 0.08;
const PAUSE = ZENMODE.phone.pause;
const STEP_LEN = 0.21;
const stepAt = (p: number) => (p < STEP_FROM || p >= STEP_FROM + 4 * STEP_LEN ? null : Math.floor((p - STEP_FROM) / STEP_LEN));

/**
 * What it does, shown on the product itself. The phone and the four feature cards pin beside each
 * other while the reader scrolls through a taller track (sticky, never fixed): the camera leans in
 * to each feature on the home screen in turn, and its card lights. A card is also a button: it
 * scrolls straight to its feature (or, where nothing pins, just shows it). Under reduced motion
 * nothing pins and the phone cuts between framings. The page's HTML shows the whole screen and
 * every card; nothing waits for the scroll. Gold Invest is the reward, so it carries the page's
 * one touch of the highlight.
 *
 * Under the phone, "Unlock the phone" plays the pause the app puts on every unlock: 7 real
 * seconds, then Home. While it runs the same button skips it (7 skips, as on a fresh day), so
 * keyboards and screen readers have it too; a polite live region says what is happening. Its
 * sounds (off unless the visitor turned sound on) answer the visitor's own taps.
 */
const HowItWorks: React.FC = () => {
  const track = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [step, setStep] = useState<number | null>(null);
  const [pausing, setPausing] = useState(false);
  const [skips, setSkips] = useState<number>(PAUSE.skips);

  /** Where the pin is: how far the box has travelled through the track (0 to 1), or null if it can't pin. */
  const pin = useCallback(() => {
    const t = track.current;
    const b = box.current;
    if (!t || !b) return null;
    const travel = t.offsetHeight - b.offsetHeight;
    if (travel < 2) return null; // reduced motion: the track is one screen, nothing pins
    const top = parseFloat(getComputedStyle(b).top) || 0;
    const at = top - t.getBoundingClientRect().top;
    return { travel, top, p: Math.min(1, Math.max(0, at / travel)) };
  }, []);

  const follow = useCallback(() => {
    const at = pin();
    if (at) setStep(stepAt(at.p));
  }, [pin]);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', follow);
  // arriving mid-track (Back, a reload) frames the right feature at once
  useEffect(follow, [follow, reduce]);

  const pick = (i: number) => {
    const at = pin();
    if (!at) return setStep((s) => (s === i ? null : i));
    const start = window.scrollY + track.current!.getBoundingClientRect().top - at.top;
    // already pinned, the jump is unseen (the box holds still and the phone moves); from outside, glide in
    const behavior = (at.p > 0 && at.p < 1 ? 'instant' : 'smooth') as ScrollBehavior;
    window.scrollTo({ top: start + (STEP_FROM + STEP_LEN * (i + 0.5)) * at.travel, behavior });
  };

  const unlock = () => {
    setPausing(true);
    sound.play('select');
  };
  const skip = () => {
    if (skips <= 0) return;
    setSkips((n) => n - 1);
    setPausing(false);
    sound.play('skip');
  };
  const done = useCallback(() => {
    setPausing(false);
    sound.play('go');
  }, []);

  return (
    <Chapter id="how-it-works" label="How it works">
      <div ref={track} className="motion-safe:h-[360svh]">
        <div
          ref={box}
          className="flex flex-col items-center gap-4 motion-safe:sticky motion-safe:top-[4.5rem] motion-safe:h-[calc(100svh-5.5rem)] motion-safe:justify-center md:motion-safe:top-20 md:motion-safe:h-[calc(100svh-6rem)] lg:flex-row lg:gap-10"
        >
          <div className="flex shrink-0 flex-col items-center gap-2">
            <ZenPhone
              focus={step === null ? null : ZENMODE.features[step].icon}
              instant={reduce}
              pause={pausing ? { skips, onSkip: skip, onDone: done } : null}
              className="w-[clamp(8rem,calc((100svh_-_25rem)*0.46),15rem)] lg:w-[clamp(12rem,calc((100svh_-_13rem)*0.46),18.5rem)]"
            />
            <button
              type="button"
              onClick={pausing ? skip : unlock}
              disabled={pausing && skips <= 0}
              aria-describedby="pause-note"
              className="zen-link inline-flex items-center gap-1.5 text-small font-semibold disabled:no-underline disabled:opacity-60"
            >
              {pausing ? <SkipForward aria-hidden className="h-3.5 w-3.5" /> : <LockOpen aria-hidden className="h-3.5 w-3.5" />}
              {pausing ? (skips > 0 ? PAUSE.skipCta : PAUSE.noSkips) : PAUSE.cta}
            </button>
            <p id="pause-note" className="max-w-[17rem] text-center text-small text-muted-foreground max-lg:sr-only">
              {PAUSE.note}
            </p>
            <p className="sr-only" aria-live="polite">
              {pausing ? PAUSE.live : ''}
            </p>
          </div>
          <ul className="grid w-full grid-cols-2 gap-3 lg:flex-1">
            {ZENMODE.features.map((f, i) => {
              const on = step === i;
              const reward = f.icon === 'gold';
              const tone = reward
                ? `bg-reward-surface ${on ? 'border-highlight' : 'border-highlight/40'}`
                : on
                  ? 'border-primary bg-tint'
                  : 'bg-card hover:border-primary/50';
              return (
                <li key={f.name}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(i)}
                    className={`${CARD} flex h-full w-full flex-col text-left transition-colors duration-300 motion-reduce:transition-none max-lg:p-3 ${tone}`}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      {/* smaller on phones, where the cards share the screen with the phone */}
                      <span className="max-lg:[&>svg]:h-6 max-lg:[&>svg]:w-6">
                        <FeatureIcon kind={f.icon} />
                      </span>
                      <span className={`zen-label whitespace-nowrap ${reward ? 'text-reward' : 'text-primary'}`}>{f.stat}</span>
                    </span>
                    <span className="mt-2 font-display text-lead leading-tight lg:mt-8 lg:text-h3">{f.name}</span>
                    <span className="mt-1 text-small text-muted-foreground">{f.desc}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="mt-6 max-w-[60ch]">{ZENMODE.built}</p>
    </Chapter>
  );
};

/** The public numbers, one card each: the figure in mono (as it stands, never counted up), what it is, where it is from. */
const Traction: React.FC = () => (
  <Chapter id="traction" label="Traction">
    <Reveal>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ZENMODE.stats.map((st) => (
          <li key={st.label} className={`${CARD} border-tint-line bg-tint`}>
            <p className="font-mono text-h2 text-primary">
              {st.prefix}
              {st.value}
              {st.unit}
            </p>
            <p className="mt-3 font-semibold">{st.label}</p>
            <p className="text-small text-muted-foreground">{st.sub}</p>
          </li>
        ))}
      </ul>
    </Reveal>
  </Chapter>
);

const ZenModeSection: React.FC = () => (
  <>
    <Product />
    <HowItWorks />
    <Traction />
  </>
);

export default ZenModeSection;
