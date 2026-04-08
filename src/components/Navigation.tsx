import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';
import { useSectionTimeTracker } from '@/hooks/useSectionTimeTracker';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showHeatmap, setShowHeatmap] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Work Experience', href: '#work-experience' },
    { name: 'Technical Skills', href: '#technical-skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Time Machine', href: '#commit-time-machine' },
    { name: 'GitHub Activity', href: '#github-activity' },
    { name: 'Contact', href: '#contact' },
  ];

  const sectionIds = useMemo(() => navItems.map(item => item.href.slice(1)), []);
  const timePercentages = useSectionTimeTracker(sectionIds);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeatmap(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg border-b border-primary/20' 
          : 'bg-background/20 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Center-aligned navigation items */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05
                }}
                className="relative text-foreground/90 hover:text-primary transition-all duration-300 font-medium text-sm lg:text-base px-3 py-2 rounded-lg hover:bg-primary/20 hover:shadow-sm border border-transparent hover:border-primary/30"
              >
                {item.name}
                <div
                  data-testid={`heatmap-bar-${item.href.slice(1)}`}
                  className="absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-primary transition-opacity duration-700"
                  style={{ opacity: showHeatmap ? timePercentages[item.href.slice(1)] || 0 : 0 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
              className="text-foreground p-2 rounded-lg hover:bg-primary/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-background/50 text-muted-foreground text-sm hover:border-primary/40 hover:text-foreground transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-primary/20 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 bg-background/95 backdrop-blur-lg rounded-lg border border-primary/20"
          >
            <div className="py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 5
                  }}
                  className="relative w-full text-left text-foreground/90 hover:text-primary transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-primary/20 border border-transparent hover:border-primary/30"
                >
                  <span
                    data-testid={`heatmap-dot-${item.href.slice(1)}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary transition-opacity duration-700"
                    style={{ opacity: showHeatmap ? timePercentages[item.href.slice(1)] || 0 : 0 }}
                  />
                  {item.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
    <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
};

export default Navigation;
