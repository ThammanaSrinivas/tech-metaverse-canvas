import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

const TechnicalSkills: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Programming Languages']));

  const skillCategories = [
    {
      name: 'Programming Languages',
      icon: Code2,
      color: 'from-blue-500 to-cyan-500',
      skills: [
        { name: 'Python', icon: '🐍', level: 'Advanced' },
        { name: 'Java', icon: '☕', level: 'Advanced' },
        { name: 'C/C++', icon: '🔵', level: 'Intermediate' },
        { name: 'JavaScript', icon: '🟡', level: 'Advanced' },
        { name: 'TypeScript', icon: '🔷', level: 'Advanced' },
        { name: 'HTML/CSS', icon: '🌐', level: 'Advanced' },
        { name: 'SQL', icon: '🗄️', level: 'Advanced' },
      ]
    },
    {
      name: 'Frameworks & Libraries',
      icon: Layers,
      color: 'from-green-500 to-emerald-500',
      skills: [
        { name: 'Spring Boot', icon: '🍃', level: 'Advanced' },
        { name: 'Spring MVC', icon: '🌱', level: 'Advanced' },
        { name: 'Socket.IO', icon: '🔌', level: 'Intermediate' },
      ]
    },
    {
      name: 'Tools & Platforms',
      icon: Cpu,
      color: 'from-orange-500 to-red-500',
      skills: [
        { name: 'Git', icon: '📝', level: 'Advanced' },
        { name: 'Docker', icon: '🐳', level: 'Advanced' },
        { name: 'Kubernetes', icon: '⚓', level: 'Intermediate' },
        { name: 'Kafka', icon: '📨', level: 'Intermediate' },
        { name: 'REST APIs', icon: '🌐', level: 'Advanced' },
        { name: 'RAG', icon: '🤖', level: 'Intermediate' },
      ]
    },
    {
      name: 'Databases',
      icon: Database,
      color: 'from-purple-500 to-pink-500',
      skills: [
        { name: 'MySQL', icon: '🐬', level: 'Advanced' },
        { name: 'PostgreSQL', icon: '🐘', level: 'Advanced' },
        { name: 'Redis', icon: '🔴', level: 'Intermediate' },
      ]
    },
    {
      name: 'Concepts & Expertise',
      icon: Network,
      color: 'from-indigo-500 to-blue-500',
      skills: [
        { name: 'System Design', icon: '🏗️', level: 'Advanced' },
        { name: 'Distributed Systems', icon: '🌐', level: 'Advanced' },
        { name: 'Full Stack Development', icon: '💻', level: 'Advanced' },
        { name: 'WebSockets', icon: '🔌', level: 'Intermediate' },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const contentVariants = {
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
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-green-500';
      case 'Intermediate': return 'text-yellow-500';
      case 'Beginner': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <section id="technical-skills" className="py-20 px-6" role="region" aria-label="Technical Skills">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Technical Skills</span>
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
                    className={`w-full bg-gradient-to-r ${category.color} p-4 hover:opacity-90 transition-opacity duration-200`}
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
                          className="bg-white/20 text-white border-white/30"
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
                        <div className="p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {category.skills.map((skill, skillIndex) => (
                              <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: skillIndex * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="group"
                              >
                                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{skill.icon}</span>
                                    <span className="font-medium text-foreground">{skill.name}</span>
                                  </div>
                                  <Badge 
                                    variant="secondary" 
                                    className={`${getLevelColor(skill.level)} bg-background/80 border border-current/20`}
                                  >
                                    {skill.level}
                                  </Badge>
                                </div>
                              </motion.div>
                            ))}
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

export default TechnicalSkills; 