import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { EyeOff, Search } from 'lucide-react';
import { ZENMODE } from '@/data/profile';
import { ZENMODE_COLORS } from '@/theme/palettes';
import { EASE } from '@/components/zen/primitives';
import { tiltPose } from '@/lib/tilt';

/** Which part of the home screen the camera leans in to: one per feature, or the whole screen. */
export type PhoneFocus = 'score' | 'streak' | 'circle' | 'gold' | null;

/**
 * The ZenMode OS home screen in a phone, drawn from the Android app's own components so it reads
 * like the product: the header stats (Zen Score with the gradient mark, Streaks with the flame,
 * Clash Display over Clash Display), the Gold Invested pill under its tapered rule, the circle's
 * screen-time cards with their mood faces (Departure Mono digits), the apps and the search pill.
 * The art in public/zenmode/app is the app's own vector drawables, converted.
 *
 * Everything is laid out on the app's 360 × 780 canvas and sized in container units, so the
 * phone scales as one picture. `focus` moves a camera over the screen (transform only) and
 * quiets the rest; each feature then plays its one small idea: the mark turns a quarter, the
 * flame burns taller, the two cards draw together, light crosses the coin. `instant` (reduced
 * motion) cuts straight to the framing, with no ideas played. `pause` lays the app's pause screen
 * over Home (PauseScreen below), as unlocking the phone with the pause on does.
 *
 * At rest (no framing, no pause) on a wide screen the phone stands at a slight angle, like the one
 * in the app's own screenshot, and leans a few degrees toward the pointer (useTilt). It has a
 * body: a few layers behind the face, so the turned side shows as an edge and not a flat skew.
 * The moment the camera or the pause takes over it squares up, so only one thing moves at a time.
 */
const W = 360;
const H = 780;
/** A length on the app's canvas, as a share of the screen's width. */
const u = (n: number) => `${((n * 100) / W).toFixed(3)}cqw`;

const PHONE = ZENMODE.phone;
const C = ZENMODE_COLORS.phone;
const STONE = ZENMODE_COLORS.stone;

/** Where each region's centre sits on the canvas, and how far the camera leans in to it. */
const FOCUS = {
  score: { x: 74, y: 70, s: 2.3 },
  streak: { x: 288, y: 70, s: 2.3 },
  gold: { x: 180, y: 124, s: 1.85 },
  circle: { x: 180, y: 252, s: 1.06 },
} as const;

/** The content's transform for a framing: that region's centre moved to the screen's centre. */
function camera(f: PhoneFocus) {
  if (!f) return { x: '0%', y: '0%', scale: 1 };
  const { x, y, s } = FOCUS[f];
  return { x: `${((W / 2 - x * s) / W) * 100}%`, y: `${((H / 2 - y * s) / H) * 100}%`, scale: s };
}

const CALM = { duration: 0.9, ease: EASE } as const;
const NOW = { duration: 0 } as const;

const label: React.CSSProperties = { fontSize: u(12), lineHeight: 1 };
const value: React.CSSProperties = { fontSize: u(18), lineHeight: 1 };

/** "Streaks / 13 days": the two lines beside the flame, on Home and on the pause alike. */
const StreakLines: React.FC = () => (
  <span className="flex flex-col" style={{ gap: u(3) }}>
    <span className="font-display font-medium" style={label}>
      Streaks
    </span>
    <span className="flex items-end" style={{ gap: u(3) }}>
      <span className="font-display font-medium" style={value}>
        {PHONE.streak.value}
      </span>
      <span className="font-display font-medium" style={{ ...label, color: STONE[600] }}>
        {PHONE.streak.unit}
      </span>
    </span>
  </span>
);

/** A running pause: how many skips are left today, and what skipping or waiting it out does. */
export type PhonePause = { skips: number; onSkip: () => void; onDone: () => void };

const PAUSE = PHONE.pause;
/** Seconds into the pause (counted from 1, as the app does) → the ring's stage: 3, 6, 8, then all 10 ticks. */
const ringAt = (elapsed: number) => (elapsed >= 6 ? 4 : elapsed >= 4 ? 3 : elapsed >= 2 ? 2 : 1);
/** The quadrant lit after each quarter turn, round and round: upper right, lower right, lower left, upper left. */
const LIT = [2, 3, 4, 1];
const QUADS = [
  { q: 1, left: 0, top: 92 },
  { q: 2, left: 266, top: 92 },
  { q: 3, left: 266, top: 252 },
  { q: 4, left: 0, top: 252 },
];
/** Android's FastOutSlowIn, the curve the shuriken turns on. */
const FAST_OUT_SLOW_IN = [0.4, 0, 0.2, 1] as const;

/** `a` blended toward `b` by `t`: the Mindfulness cells fade from the mood colour toward the empty one. */
function mix(a: string, b: string, t: number) {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return `rgb(${out.join(',')})`;
}

/**
 * The pause screen (the app's ResistenceScreen), shown when the phone is unlocked with the pause
 * on: the screen wakes from black, the shuriken turns a quarter every 2 seconds while the
 * quadrant it points to lights, the ring fills in stages and the number counts down the real
 * seconds, 7 to 1; then the phone lets you in (back to Home). The words "skip & open" skip it.
 * Under reduced motion nothing fades or turns: the quadrants still take turns and the count runs.
 */
const PauseScreen: React.FC<PhonePause & { instant: boolean }> = ({ skips, onSkip, onDone, instant }) => {
  const [awake, setAwake] = useState(instant);
  const [elapsed, setElapsed] = useState(1);
  const [turns, setTurns] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  // the screen comes on first; the count starts once it is lit, as the app's does when it opens
  useEffect(() => {
    const id = window.setTimeout(() => setAwake(true), instant ? 0 : 450);
    return () => window.clearTimeout(id);
  }, [instant]);
  useEffect(() => {
    if (!awake) return;
    const tick = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    const turn = window.setInterval(() => setTurns((n) => n + 1), 2000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(turn);
    };
  }, [awake]);
  useEffect(() => {
    if (elapsed > PAUSE.seconds) done.current();
  }, [elapsed]);

  const lit = LIT[turns % 4];
  const happy = ZENMODE_COLORS.zen[700];
  const empty = STONE[200];
  const fade = instant ? NOW : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: STONE[100] }}
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: fade }}
      transition={fade}
    >
      {/* the gradient mark, and the same Streaks block as Home */}
      <img src="/zenmode/app/mark.webp" alt="" width={96} height={96} className="absolute" style={{ left: u(20), top: u(40), width: u(44), height: u(44) }} />
      <span className="absolute flex items-center" style={{ right: u(20), top: u(45.5), gap: u(6) }}>
        <img src="/zenmode/app/flame.svg" alt="" width={33} height={33} style={{ width: u(33), height: u(33) }} />
        <StreakLines />
      </span>

      {QUADS.map(({ q, left, top }) => (
        <img
          key={q}
          src={`/zenmode/app/pause-q${q}.svg`}
          alt=""
          width={101}
          height={172}
          className="absolute transition-opacity duration-300 motion-reduce:transition-none"
          style={{ left: u(left), top: u(top), width: u(94), height: u(160), opacity: q === lit ? 1 : 0.5 }}
        />
      ))}
      <motion.img
        src="/zenmode/app/shuriken.webp"
        alt=""
        width={440}
        height={432}
        className="absolute"
        style={{ left: u(59), top: u(133), width: u(242), height: u(238) }}
        initial={false}
        animate={{ rotate: instant ? 0 : turns * 90 }}
        transition={{ duration: 0.4, ease: FAST_OUT_SLOW_IN }}
      />

      {/* My Screen Time and Mindfulness, one block, centred, its lines flush left */}
      <span className="absolute inset-x-0 flex justify-center" style={{ top: u(418) }}>
        <span className="flex flex-col items-start">
          <span className="font-display font-medium" style={{ fontSize: u(20), lineHeight: 1.2 }}>
            {PAUSE.screenTime}
          </span>
          <span className="flex items-end font-mono" style={{ marginTop: u(4) }}>
            <span style={{ fontSize: u(56), lineHeight: 0.8 }}>{PHONE.cards[0].hours}</span>
            <span style={{ fontSize: u(10), marginRight: u(10), marginBottom: u(4) }}>HRS</span>
            <span style={{ fontSize: u(56), lineHeight: 0.8 }}>{PHONE.cards[0].minutes}</span>
            <span style={{ fontSize: u(10), marginBottom: u(4) }}>MINS</span>
          </span>
          <span className="flex items-center" style={{ marginTop: u(16), gap: u(12) }}>
            <span className="font-display font-medium" style={{ fontSize: u(22), lineHeight: 1 }}>
              {PAUSE.mindfulness}
            </span>
            <span className="flex" style={{ width: u(100), height: u(20), gap: u(4) }}>
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full"
                  style={i < PAUSE.mindful ? { background: mix(happy, empty, i / PAUSE.mindful) } : { background: empty, opacity: 0.3 }}
                />
              ))}
            </span>
          </span>
        </span>
      </span>

      <span className="absolute inset-x-0 text-center font-display" style={{ top: u(560), fontSize: u(13), color: STONE[600], paddingInline: u(20) }}>
        {PAUSE.advice[0]}
        <span style={{ color: happy }}>{PAUSE.advice[1]}</span>
        {PAUSE.advice[2]}
        {/* in the mono stack: the display stack falls back to Geist, which the browser would fetch (169 KB) just to look for this glyph */}
        <span className="font-mono" style={{ fontSize: u(12) }}>
          💚
        </span>
      </span>

      {/* the ring fills with the seconds waited; the number counts what is left */}
      <span className="absolute flex items-center justify-center" style={{ left: u(125), top: u(590), width: u(110), height: u(110) }}>
        <img src={`/zenmode/app/ring-${ringAt(elapsed)}.svg`} alt="" width={105} height={108} className="absolute inset-0 h-full w-full" />
        <span className="relative font-mono" style={{ fontSize: u(36), lineHeight: 1 }}>
          {Math.max(1, PAUSE.seconds + 1 - elapsed)}
        </span>
      </span>

      <span className="absolute flex items-center justify-between" style={{ left: u(20), right: u(20), top: u(716), height: u(48) }}>
        <img src="/zenmode/app/settings.svg" alt="" width={24} height={24} style={{ width: u(24), height: u(24), margin: u(12) }} />
        {skips > 0 ? (
          // a mouse can take the phone's own words; keyboards and screen readers have the button under the phone
          <span className="flex-1 cursor-pointer text-center font-display" style={{ fontSize: u(12), color: STONE[600] }} onClick={onSkip}>
            {PAUSE.skipLine[0]}
            <span className="font-mono" style={{ color: happy }}>
              {skips}
            </span>
            <span style={{ color: happy }}>{PAUSE.skipLine[1]}</span>
            {PAUSE.skipLine[2]}
          </span>
        ) : (
          <span className="flex-1 text-center font-display" style={{ fontSize: u(12), color: STONE[600], opacity: 0.5 }}>
            {PAUSE.noSkipLine}
          </span>
        )}
        <img src="/zenmode/app/phone.svg" alt="" width={24} height={24} style={{ width: u(24), height: u(24), margin: u(12) }} />
      </span>

      {/* the phone waking: black, then the screen lights */}
      {!instant && (
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{ background: STONE[950] }}
          initial={{ opacity: 1 }}
          animate={{ opacity: awake ? 0 : 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      )}
    </motion.div>
  );
};

/** How thick the body reads: layers behind the face, this many px apart. */
const BODY = [3, 6, 9, 12];
/** Settles without a bounce, like the app's own containers. */
const SETTLE = { stiffness: 110, damping: 22, mass: 1 };

/**
 * The phone's turn about its two axes, on springs. What the turn should be is `tiltPose`
 * (lib/tilt.ts, tested there): square in the page's HTML and until it has been seen, under
 * 1024px, under reduced motion and whenever `on` is false; otherwise the resting pose leaned
 * toward a mouse pointer. Everything here runs in effects, so the first render matches the HTML.
 */
function useTilt(ref: React.RefObject<HTMLElement>, on: boolean) {
  const rotateX = useSpring(useMotionValue(0), SETTLE);
  const rotateY = useSpring(useMotionValue(0), SETTLE);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  // where the pointer last was, so the phone turns back to face it after squaring up, not to a
  // bare resting pose that jumps on the next mouse move
  const pointer = useRef({ nx: 0, ny: 0 });
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pose = () => {
      const to = tiltPose({ on, seen, wide: wide.matches, still: still.matches, ...pointer.current });
      rotateX.set(to.x);
      rotateY.set(to.y);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      pointer.current = {
        nx: clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)),
        ny: clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)),
      };
      pose();
    };
    const settle = () => pose();
    settle();
    window.addEventListener('pointermove', onMove, { passive: true });
    wide.addEventListener('change', settle);
    still.addEventListener('change', settle);
    return () => {
      window.removeEventListener('pointermove', onMove);
      wide.removeEventListener('change', settle);
      still.removeEventListener('change', settle);
    };
  }, [on, seen, ref, rotateX, rotateY]);
  return { rotateX, rotateY };
}

const ZenPhone: React.FC<{ focus: PhoneFocus; instant?: boolean; pause?: PhonePause | null; className?: string }> = ({
  focus,
  instant = false,
  pause = null,
  className = '',
}) => {
  const t = instant ? NOW : CALM;
  // the regions not in focus step back, so the eye goes where the camera went
  const quiet = (id: Exclude<PhoneFocus, null>) => ({ opacity: focus && focus !== id ? 0.2 : 1 });
  const lean = (on: boolean, to: object, from: object) => (instant ? from : on ? to : from);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useTilt(stage, !focus && !pause && !instant);

  return (
    // the stage gives the turn its depth; the phone itself turns inside it
    <div ref={stage} className={`shrink-0 ${className}`} style={{ perspective: '1400px' }}>
      <motion.div
        role="img"
        aria-label={PHONE.alt}
        className="zen relative rounded-[14%/6.5%] p-[2.6%] shadow-xl"
        style={{ background: STONE[950], transformStyle: 'preserve-3d', ...tilt }}
      >
        {/* the body: layers behind the face, lighter than it, so the turned side reads as an edge */}
        {BODY.map((z) => (
          <span key={z} aria-hidden className="absolute inset-0 rounded-[14%/6.5%]" style={{ background: STONE[700], transform: `translateZ(${-z}px)` }} />
        ))}
        <div
          className="relative aspect-[360/780] w-full overflow-hidden rounded-[11.5%/5.3%]"
          style={{ containerType: 'inline-size', background: `linear-gradient(180deg, ${C.wash.edge} 0%, ${C.wash.core} 46%, ${C.wash.edge} 100%)` }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ originX: 0, originY: 0 }}
            initial={false}
            animate={camera(focus)}
            transition={t}
          >
            {/* Zen Score: the gradient mark, as tall as the two lines beside it */}
            <motion.div className="absolute flex items-center" style={{ left: u(20), top: u(53), gap: u(6) }} animate={quiet('score')} transition={t}>
              <motion.img
                src="/zenmode/app/mark.webp"
                alt=""
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                style={{ width: u(33), height: u(33) }}
                initial={false}
                animate={lean(focus === 'score', { rotate: 90 }, { rotate: 0 })}
                transition={instant ? NOW : { duration: 0.64, ease: EASE, delay: 0.35 }}
              />
              <span className="flex flex-col" style={{ gap: u(3) }}>
                <span className="font-display font-medium" style={label}>
                  Zen Score
                </span>
                <span className="flex items-end">
                  <span
                    className="font-display font-medium"
                    style={{ ...value, backgroundImage: `linear-gradient(90deg, ${C.score.from}, ${C.score.to})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}
                  >
                    {PHONE.score.value}
                  </span>
                  <span className="font-display font-medium" style={{ ...label, color: STONE[600] }}>
                    {PHONE.score.max}
                  </span>
                </span>
              </span>
            </motion.div>

            {/* Streaks: the flame, burning as tall as its two lines */}
            <motion.div className="absolute flex items-center" style={{ right: u(20), top: u(53), gap: u(6) }} animate={quiet('streak')} transition={t}>
              <motion.img
                src="/zenmode/app/flame.svg"
                alt=""
                width={33}
                height={33}
                loading="lazy"
                decoding="async"
                style={{ width: u(33), height: u(33), originY: 1 }}
                initial={false}
                animate={lean(focus === 'streak', { scaleY: 1.16, scaleX: 1.04 }, { scaleY: 1, scaleX: 1 })}
                transition={instant ? NOW : { duration: 0.64, ease: EASE, delay: 0.35 }}
              />
              <StreakLines />
            </motion.div>

            {/* Gold Invested: a rule along the top edge that thins to nothing down the sides */}
            <motion.div className="absolute inset-x-0 flex justify-center" style={{ top: u(100) }} animate={quiet('gold')} transition={t}>
              <span
                className="flex items-center rounded-full border-t border-primary"
                style={{ height: u(48), paddingInline: u(13), gap: u(8) }}
              >
                <span className="relative overflow-hidden rounded-full" style={{ width: u(38), height: u(38) }}>
                  <img src="/zenmode/app/coin.svg" alt="" width={38} height={38} loading="lazy" decoding="async" className="h-full w-full" />
                  {focus === 'gold' && !instant && (
                    <motion.span
                      className="absolute inset-y-0 w-1/3 -skew-x-12 bg-card opacity-70"
                      initial={{ x: '-150%' }}
                      animate={{ x: '350%' }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
                    />
                  )}
                </span>
                <span className="flex flex-col" style={{ gap: u(2) }}>
                  <span className="flex items-center font-display font-medium" style={{ fontSize: u(9), lineHeight: 1, letterSpacing: '0.04em', color: C.goldLabel, gap: u(6) }}>
                    GOLD INVESTED
                    <EyeOff aria-hidden style={{ width: u(11), height: u(11) }} />
                  </span>
                  {/* hidden, as the eye toggle leaves it: the app's own mask for the amount */}
                  <span className="font-mono" style={{ fontSize: u(17), lineHeight: 1.1, color: C.goldAmount, letterSpacing: '-0.05em' }}>
                    ₹••••••
                  </span>
                </span>
              </span>
            </motion.div>

            {/* The circle: my card and my buddy's, face on top, the day's screen time under it */}
            <motion.div className="absolute flex justify-between" style={{ left: u(20), right: u(20), top: u(176) }} animate={quiet('circle')} transition={t}>
              {PHONE.cards.map((card, i) => {
                const fill = C[card.mood];
                return (
                  <motion.span
                    key={card.label}
                    className="flex flex-col items-center overflow-hidden"
                    style={{ width: u(152), height: u(152), borderRadius: u(22), background: `linear-gradient(180deg, ${fill.face} 0%, ${fill.body} 100%)` }}
                    initial={false}
                    animate={lean(focus === 'circle', { x: i ? '-3%' : '3%' }, { x: '0%' })}
                    transition={instant ? NOW : { duration: 0.64, ease: EASE, delay: 0.35 }}
                  >
                    <img
                      src={`/zenmode/app/face-${card.mood}.svg`}
                      alt=""
                      width={165}
                      height={89}
                      loading="lazy"
                      decoding="async"
                      className="w-full"
                      style={{ aspectRatio: '165 / 89' }}
                    />
                    <span className="font-display font-medium" style={{ fontSize: u(11), lineHeight: 1, marginTop: u(8) }}>
                      {card.label}
                    </span>
                    <span className="flex items-baseline font-mono" style={{ marginTop: u(6), gap: u(2) }}>
                      <span style={{ fontSize: u(26), lineHeight: 1 }}>{card.hours}</span>
                      <span style={{ fontSize: u(11) }}>h</span>
                      <span style={{ fontSize: u(26), lineHeight: 1, marginLeft: u(4) }}>{card.minutes}</span>
                      <span style={{ fontSize: u(11) }}>m</span>
                    </span>
                  </motion.span>
                );
              })}
            </motion.div>

            {/* the apps, unnamed, and the search pill: what the launcher is for, kept quiet */}
            <motion.div className="absolute" style={{ left: u(20), right: u(20), top: u(370) }} animate={{ opacity: focus ? 0.2 : 1 }} transition={t}>
              <span className="grid grid-cols-4" style={{ rowGap: u(18), columnGap: u(40) }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} className="aspect-square border bg-card opacity-60" style={{ borderRadius: u(14) }} />
                ))}
              </span>
            </motion.div>
            <motion.div
              className="absolute flex items-center border bg-card opacity-80"
              style={{ left: u(20), right: u(20), top: u(704), height: u(44), borderRadius: u(22), paddingInline: u(16) }}
              animate={{ opacity: focus ? 0.2 : 0.8 }}
              transition={t}
            >
              <Search aria-hidden className="text-muted-foreground" style={{ width: u(16), height: u(16) }} />
            </motion.div>
          </motion.div>

          {/* unlocked with the pause on: it covers Home, wherever the camera is */}
          <AnimatePresence>{pause && <PauseScreen key="pause" {...pause} instant={instant} />}</AnimatePresence>

          {/* the camera's punch hole stays on the glass while the screen moves under it */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: u(14), width: u(11), height: u(11), background: STONE[950] }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ZenPhone;
