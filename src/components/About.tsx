import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Database, 
  Server, 
  Globe, 
  Cpu, 
  GitBranch, 
  Container, 
  Network,
  Layers,
  Zap,
  Shield,
  Cloud
} from 'lucide-react';

const About: React.FC = () => {
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-green-500';
      case 'Intermediate': return 'text-yellow-500';
      case 'Beginner': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <section id="about" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">About Me</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            I'm a passionate full-stack developer specializing in creating scalable and efficient digital solutions. 
            With expertise in modern web technologies, distributed systems, and cloud-native development, 
            I bridge the gap between complex backend systems and intuitive user experiences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Card className="glass-card p-8 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-primary">My Journey</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Started as a computer science enthusiast fascinated by the intersection of technology and problem-solving. 
                Over the years, I've evolved into a full-stack developer with deep expertise in Java/Spring ecosystem, 
                modern web technologies, and distributed systems architecture.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I believe in creating robust, scalable solutions that not only meet current requirements but also 
                anticipate future needs. Every project is an opportunity to apply best practices and innovative 
                approaches to solve real-world problems.
              </p>
            </Card>

            <Card className="glass-card p-8 border-secondary/20">
              <h3 className="text-2xl font-bold mb-4 text-secondary">Philosophy</h3>
              <p className="text-muted-foreground leading-relaxed">
                "Code is architecture, design is communication, and user experience is empathy in action."
                I strive to create digital solutions that are not just technically sound but also 
                meaningful, maintainable, and accessible to everyone.
              </p>
            </Card>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-8"
          >
            <h3 className="text-3xl font-bold mb-8 text-center">Technical Skills</h3>
            {skillCategories.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={category.name}
                  variants={itemVariants}
                  className="space-y-4"
                >
                  <Card className="glass-card border-primary/20 overflow-hidden">
                    <div className={`bg-gradient-to-r ${category.color} p-4`}>
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-6 h-6 text-white" />
                        <h4 className="text-xl font-semibold text-white">
                          {category.name}
                        </h4>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.skills.map((skill, skillIndex) => (
                          <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
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
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
