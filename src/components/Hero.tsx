import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { HeroScene } from './HeroScene';
import ParticleEffect from './ParticleEffect';
import FloatingCLI from './FloatingCLI';
import { Button } from '@/components/ui/button';
import { ChevronDown, Mouse, ArrowRight } from 'lucide-react';
import { animationUtils } from '@/lib/utils';
import ResumeButton from './ui/ResumeButton';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedText: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const texts = [
    "3+ Years Experience",
    "System Architecture", 
    "Full Stack Development"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="relative inline-block min-w-[200px] sm:min-w-[250px] h-[1.5em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="absolute left-0 top-0 text-primary font-semibold whitespace-nowrap"
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects - reduced on mobile
  const y1 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -50 : -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -100 : -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Only add mouse tracking on desktop
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
          const position = animationUtils.getMousePosition(e, containerRef.current);
          setMousePosition(position);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', checkMobile);
      };
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: isMobile ? 20 : 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.5 : 0.8,
        ease: 'easeOut',
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.1 : 0.2,
        duration: isMobile ? 0.3 : 0.5,
      },
    },
  };

  return (
    <section 
      ref={containerRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 pt-20 sm:pt-24 md:pt-20 lg:pt-24"
    >
      {/* Particle Effect */}
      <ParticleEffect />
      
      {/* Animated background grid - reduced opacity on mobile */}
      <div className={`absolute inset-0 grid-bg opacity-${isMobile ? '5' : '20'} animate-grid-move`}></div>
      
      {/* 3D Stars Scene - disabled on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0">
          <HeroScene />
        </div>
      )}
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent"></div>
      
      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: y1, opacity }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div
          variants={textVariants}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-tight heading-primary">
            <span className="text-foreground">
              Digital Architect
            </span>
          </h1>
        </motion.div>

        <motion.div
          variants={textVariants}
          style={{ y: y2 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 sm:mb-16 lg:mb-20 max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Crafting immersive digital experiences with</span>
            <AnimatedText />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating CLI Workflow */}
      <FloatingCLI />
    </section>
  );
};

export default Hero;
