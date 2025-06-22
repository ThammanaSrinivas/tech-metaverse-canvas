import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Scene3D from './Scene3D';
import ParticleEffect from './ParticleEffect';
import FloatingCLI from './FloatingCLI';
import { Button } from '@/components/ui/button';
import { ChevronDown, Mouse, ArrowRight } from 'lucide-react';
import { animationUtils } from '@/lib/utils';
import ResumeButton from './ui/ResumeButton';

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const position = animationUtils.getMousePosition(e, containerRef.current);
        setMousePosition(position);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section 
      ref={containerRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 pt-20 md:pt-24"
    >
      {/* Particle Effect */}
      <ParticleEffect />
      
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-bg opacity-20 animate-grid-move"></div>
      
      {/* 3D Scene */}
      <Scene3D />
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent"></div>
      
      {/* Floating geometric elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-20 w-4 h-4 bg-primary/30 rounded-full blur-sm"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
        className="absolute top-40 right-32 w-6 h-6 bg-secondary/40 rounded-full blur-sm"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
        className="absolute bottom-40 left-32 w-3 h-3 bg-neon-green/50 rounded-full blur-sm"
      />
      
      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: y1, opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          variants={textVariants}
          className="mb-6"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight">
            <span className="gradient-text neon-text bg-gradient-to-r from-primary via-secondary to-neon-green bg-clip-text text-transparent">
              Digital
            </span>
            <br />
            <span className="gradient-text neon-text bg-gradient-to-r from-primary via-secondary to-neon-green bg-clip-text text-transparent">
              Architect
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={textVariants}
          style={{ y: y2 }}
          className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Crafting immersive digital experiences through cutting-edge technology and innovative design
        </motion.p>

        <motion.div
          variants={textVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
        >
          <Button
            size="lg"
            onClick={scrollToProjects}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-primary hover:bg-primary/80 text-primary-foreground neon-glow px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
            View Projects
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </span>
          </Button>
          <ResumeButton />
        </motion.div>

        <motion.div
          variants={textVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <motion.div 
            className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="text-4xl font-bold text-primary neon-text mb-2">3+</div>
            <div className="text-sm text-muted-foreground font-medium">Years Experience</div>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="text-4xl font-bold text-secondary neon-text mb-2">System</div>
            <div className="text-sm text-muted-foreground font-medium">Architecture</div>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="text-4xl font-bold text-neon-green neon-text mb-2">Full Stack</div>
            <div className="text-sm text-muted-foreground font-medium">Development</div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Single scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={scrollToProjects}
        >
          <Mouse className="w-6 h-6 text-primary/60" />
          <ChevronDown className="w-4 h-4 text-primary/40" />
        </motion.div>
      </motion.div>

      {/* Interactive cursor effect */}
      <motion.div
        className="fixed w-4 h-4 bg-primary/30 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Floating CLI Workflow */}
      <FloatingCLI />
    </section>
  );
};

export default Hero;
