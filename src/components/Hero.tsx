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
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const texts = [
    "3+ Years Experience",
    "System Architecture", 
    "Full Stack Development"
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const currentText = texts[currentIndex];
    
    if (isTyping) {
      // Typing effect
      if (displayedText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 100); // Typing speed
      } else {
        // Finished typing, wait before starting to delete
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause duration
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50); // Deleting speed
      } else {
        // Finished deleting, move to next text
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, displayedText, isTyping, texts]);

  return (
    <div className="relative inline-block min-w-[200px] sm:min-w-[250px] h-[1.5em] overflow-hidden">
      <span className="text-primary font-semibold whitespace-nowrap flex items-center">
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block ml-1 w-0.5 h-[1.2em] bg-primary align-text-bottom"
          style={{ verticalAlign: 'baseline' }}
        />
      </span>
    </div>
  );
};

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [glitchTrigger, setGlitchTrigger] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { theme } = useTheme();
  
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-tight heading-primary glitch-trigger">
            <motion.span 
              className={`text-foreground inline-block glitch ${glitchTrigger ? 'animate-pulse' : ''}`}
              data-text="Digital Architect"
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 20px rgba(0, 245, 255, 0.5)"
              }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setGlitchTrigger(true)}
              onHoverEnd={() => setGlitchTrigger(false)}
            >
              Digital Architect
            </motion.span>
          </h1>
        </motion.div>

        <motion.div
          variants={textVariants}
          style={{ y: y2 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Crafting immersive digital experiences with
            </motion.span>
            <AnimatedText />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={textVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <Button
              onClick={scrollToProjects}
              size="lg"
              className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:shadow-primary/25"
            >
              <motion.span
                className="relative z-10 flex items-center gap-2"
                initial={false}
                animate={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                View My Work
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                whileHover={{ scale: 1.05 }}
              />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <ResumeButton 
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="relative p-4 rounded-full bg-muted hover:bg-muted/80 transition-all duration-300 group-hover:shadow-lg">
              <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors animate-bounce" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-all duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating CLI Workflow */}
      <FloatingCLI />
    </section>
  );
};

export default Hero;
