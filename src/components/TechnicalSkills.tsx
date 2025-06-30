import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Database, 
  Cpu, 
  Network,
  Layers,
  ChevronDown,
  ChevronRight,
  FileCode,
  Coffee,
  Circle,
  FileText,
  Type,
  Globe,
  GitBranch,
  Container,
  Anchor,
  MessageSquare,
  Globe2,
  Bot,
  CircleDot,
  Building2,
  Monitor,
  Plug
} from 'lucide-react';

const TechnicalSkills: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Programming Languages']));

  const skillCategories = useMemo(() => [
    {
      name: 'Programming Languages',
      icon: Code2,
      skills: [
        { name: 'Python', icon: FileCode, level: 'Advanced' },
        { name: 'Java', icon: Coffee, level: 'Advanced' },
        { name: 'C/C++', icon: Circle, level: 'Intermediate' },
        { name: 'JavaScript', icon: FileText, level: 'Advanced' },
        { name: 'TypeScript', icon: Type, level: 'Advanced' },
        { name: 'HTML/CSS', icon: Globe, level: 'Advanced' },
        { name: 'SQL', icon: Database, level: 'Advanced' },
      ]
    },
    {
      name: 'Frameworks & Libraries',
      icon: Layers,
      skills: [
        { name: 'Spring Boot', icon: Layers, level: 'Advanced' },
        { name: 'Spring MVC', icon: Layers, level: 'Advanced' },
        { name: 'Socket.IO', icon: Plug, level: 'Intermediate' },
      ]
    },
    {
      name: 'Tools & Platforms',
      icon: Cpu,
      skills: [
        { name: 'Git', icon: GitBranch, level: 'Advanced' },
        { name: 'Docker', icon: Container, level: 'Advanced' },
        { name: 'Kubernetes', icon: Anchor, level: 'Intermediate' },
        { name: 'Kafka', icon: MessageSquare, level: 'Intermediate' },
        { name: 'REST APIs', icon: Globe2, level: 'Advanced' },
        { name: 'RAG', icon: Bot, level: 'Intermediate' },
      ]
    },
    {
      name: 'Databases',
      icon: Database,
      skills: [
        { name: 'MySQL', icon: Database, level: 'Advanced' },
        { name: 'PostgreSQL', icon: Database, level: 'Advanced' },
        { name: 'Redis', icon: CircleDot, level: 'Intermediate' },
      ]
    },
    {
      name: 'Concepts & Expertise',
      icon: Network,
      skills: [
        { name: 'System Design', icon: Building2, level: 'Advanced' },
        { name: 'Distributed Systems', icon: Network, level: 'Advanced' },
        { name: 'Full Stack Development', icon: Monitor, level: 'Advanced' },
        { name: 'WebSockets', icon: Plug, level: 'Intermediate' },
      ]
    }
  ], []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }), []);

  const contentVariants = useMemo(() => ({
    collapsed: { 
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: { 
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }), []);

  const getLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'Advanced': return 'text-primary';
      case 'Intermediate': return 'text-primary/80';
      case 'Beginner': return 'text-primary/60';
      default: return 'text-muted-foreground';
    }
  }, []);

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryName)) {
        newExpanded.delete(categoryName);
      } else {
        newExpanded.add(categoryName);
      }
      return newExpanded;
    });
  }, []);

  return (
    <section id="technical-skills" className="py-20 px-6" role="region" aria-label="Technical Skills">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-foreground heading-primary">
            Technical Skills
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive overview of my technical expertise across various domains and technologies.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="space-y-6"
        >
          {skillCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.has(category.name);
            
            return (
              <motion.div
                key={category.name}
                variants={itemVariants}
                className="space-y-4"
              >
                <Card className="glass-card border-primary/20 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 p-4 hover:opacity-90 transition-opacity duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-6 h-6 text-white" />
                        <h4 className="text-xl font-semibold text-white">
                          {category.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/20 text-white border border-white/30"
                        >
                          {category.skills.length} skills
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {category.skills.map((skill, skillIndex) => {
                              const SkillIcon = skill.icon;
                              return (
                                <motion.div
                                  key={skill.name}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: skillIndex * 0.05 }}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  className="group"
                                >
                                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <SkillIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                                      <span className="font-medium text-foreground text-sm sm:text-base">{skill.name}</span>
                                    </div>
                                    <Badge 
                                      variant="secondary" 
                                      className={`${getLevelColor(skill.level)} bg-background/80 border border-current/20 text-xs sm:text-sm`}
                                    >
                                      {skill.level}
                                    </Badge>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(TechnicalSkills); 