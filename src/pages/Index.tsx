import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ZenModeSection from '@/components/ZenModeSection';
import WorkExperience from '@/components/WorkExperience';
import TechnicalSkills from '@/components/TechnicalSkills';
import Projects from '@/components/Projects';
import CommitTimeMachine from '@/components/CommitTimeMachine';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ZenShell from '@/components/ZenShell';
import ZenCursor from '@/components/ZenCursor';
import { ScrollProgress } from '@/components/zen/primitives';
import { onZen } from '@/lib/zenEvents';
import { labEnabled } from '@/theme/runtime';

const CodingDuel = lazy(() => import('@/components/CodingDuel'));
// Palette lab: localhost, or ?lab on the live site. Its own chunk, fetched only when enabled.
const PalettePanel = labEnabled() ? lazy(() => import('@/components/PalettePanel')) : null;

const Index = () => {
  const [duelOpen, setDuelOpen] = useState(false);

  useEffect(() => onZen('duel', () => setDuelOpen(true)), []);

  return (
    <div className="relative min-h-screen text-foreground">
      <ScrollProgress />
      <a href="#zenmode" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <Navigation />
      <main>
        <Hero />
        <ZenModeSection />
        <WorkExperience />
        <TechnicalSkills />
        <Projects />
        <CommitTimeMachine />
        <Contact />
      </main>
      <Footer />
      <ZenShell />
      <ZenCursor />
      <Suspense fallback={null}>
        <CodingDuel isOpen={duelOpen} onClose={() => setDuelOpen(false)} />
        {PalettePanel && <PalettePanel />}
      </Suspense>
    </div>
  );
};

export default Index;
