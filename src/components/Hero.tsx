import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroScene } from './HeroScene';
import ParticleEffect from './ParticleEffect';
import FloatingCLI from './FloatingCLI';
import { Button } from '@/components/ui/button';
import { ChevronDown, Mouse, ArrowRight } from 'lucide-react';
import { animationUtils } from '@/lib/utils';
import ResumeButton from './ui/ResumeButton';
import { useTheme } from '@/contexts/ThemeContext';

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
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
      >
        <motion.div
          variants={textVariants}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-tight heading-primary">
            <span className="text-foreground">
              Digital Architect
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={textVariants}
          style={{ y: y2 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-muted-foreground mb-8 sm:mb-10 lg:mb-16 max-w-5xl mx-auto leading-relaxed font-light px-2 sm:px-4"
        >
          Crafting immersive digital experiences through cutting-edge technology and innovative design
        </motion.p>

        <motion.div
          variants={textVariants}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-12 lg:mb-16 px-4"
        >
          <Button
            size="lg"
            onClick={scrollToProjects}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            className="group bg-primary hover:bg-primary/80 text-primary-foreground neon-glow px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto min-h-[56px] sm:min-h-[60px]"
          >
            <span className="flex items-center gap-2 sm:gap-3">
              View Projects
              <ArrowRight className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isHovered && !isMobile ? 'translate-x-1' : ''}`} />
            </span>
          </Button>
          <div className="w-full sm:w-auto">
            <ResumeButton />
          </div>
        </motion.div>

        <motion.div
          variants={textVariants}
          className="flex flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4 mt-8 sm:mt-12"
        >
          <motion.div 
            className="flex flex-col items-center text-center"
            whileHover={!isMobile ? { scale: 1.02 } : undefined}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-none mb-1">3+</div>
            <div className="text-xs sm:text-sm text-muted-foreground opacity-70">Years Experience</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center text-center"
            whileHover={!isMobile ? { scale: 1.02 } : undefined}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-none mb-1">System</div>
            <div className="text-xs sm:text-sm text-muted-foreground opacity-70">Architecture</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center text-center"
            whileHover={!isMobile ? { scale: 1.02 } : undefined}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-none mb-1">Full Stack</div>
            <div className="text-xs sm:text-sm text-muted-foreground opacity-70">Development</div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating CLI Workflow */}
      <FloatingCLI />
    </section>
  );
};

export default Hero;
