import React, { useState, useCallback, lazy, Suspense } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WorkExperience from '@/components/WorkExperience';
import TechnicalSkills from '@/components/TechnicalSkills';
import Projects from '@/components/Projects';
import CommitTimeMachine from '@/components/CommitTimeMachine';
import GitHubActivity from '@/components/GitHubActivity';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const CodingDuel = lazy(() => import('@/components/CodingDuel'));

const Index = () => {
  const [duelOpen, setDuelOpen] = useState(false);

  const handleDuelTrigger = useCallback(() => {
    setDuelOpen(true);
  }, []);

  const handleDuelClose = useCallback(() => {
    setDuelOpen(false);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main>
          <Hero onDuelTrigger={handleDuelTrigger} />
          <About />
          <WorkExperience />
          <TechnicalSkills />
          <Projects />
          <CommitTimeMachine />
          <GitHubActivity />
          <Contact />
        </main>
        <Footer />
        <Suspense fallback={null}>
          <CodingDuel isOpen={duelOpen} onClose={handleDuelClose} />
        </Suspense>
      </div>
    </ThemeProvider>
  );
};

export default Index;
