import React from 'react';
import { Link } from '@/components/zen/Link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MousePointer2 } from 'lucide-react';
import HeroSky from '@/components/HeroSky';
import { Marker, MaskWords, maskStagger } from '@/components/zen/primitives';
import { PROFILE } from '@/data/profile';
import { pageFor } from '@/site/pages';
import { BRAND } from '@/theme/palettes';
import { usePageMeta } from '@/lib/usePageMeta';
import { pageMeta } from '@/site/meta';

// The dots from the original hero, given a room of their own: something you find, not
// something in the way. Full-bleed ink, the sky follows the pointer, the brand idea floats on top.
const ExplorePage: React.FC = () => {
  const page = pageFor('explore');
  const reduce = useReducedMotion();
  usePageMeta(pageMeta(page));

  return (
    <section data-ink-top className="dark relative flex min-h-[100svh] items-center overflow-hidden bg-background text-foreground">
      <HeroSky />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(40% 45% at 50% 50%, hsl(var(--background) / .75), transparent 80%)' }}
      />
      <div className="relative mx-auto w-full max-w-[880px] px-5 py-32 text-center">
        <p className="zen-label text-muted-foreground">
          <span className="text-primary">{page.index}</span> · {page.label}
        </p>
        <motion.h1 className="mt-6 text-title" variants={maskStagger} initial={reduce ? false : 'hidden'} animate="show">
          <MaskWords text="Every system starts as a *dot*." />
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-xl text-lead text-muted-foreground"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {PROFILE.idea.before}
          <Marker delay={1.2}>{PROFILE.idea.mark}</Marker>. One point at a time, until it holds a sky.
        </motion.p>

        <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {BRAND.values.map((v, i) => (
            <motion.div
              key={v.name}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + 0.12 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[20px] border border-white/10 bg-background/70 p-5"
            >
              <p className="zen-label text-primary">0{i + 1}</p>
              <p className="mt-3 font-display text-h3">{v.name}</p>
              <p className="mt-1 text-small text-muted-foreground">{v.means}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            data-magnet
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
          >
            Back to earth <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <span className="zen-label inline-flex items-center gap-2 text-muted-foreground">
            <MousePointer2 className="h-3.5 w-3.5" /> move to steer the sky
          </span>
        </div>
      </div>
    </section>
  );
};

export default ExplorePage;
