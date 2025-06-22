import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const About: React.FC = () => {
  const skillCategories = [
    {
      name: 'Programming Languages',
      skills: [
        { name: 'Python', icon: '🐍', color: 'bg-yellow-500' },
        { name: 'Java', icon: '☕', color: 'bg-orange-500' },
        { name: 'C', icon: '🔵', color: 'bg-blue-500' },
        { name: 'C++', icon: '🔷', color: 'bg-blue-600' },
        { name: 'JavaScript', icon: '🟡', color: 'bg-yellow-400' },
        { name: 'TypeScript', icon: '🔷', color: 'bg-blue-500' },
        { name: 'HTML', icon: '🌐', color: 'bg-orange-500' },
        { name: 'SQL', icon: '🗄️', color: 'bg-blue-400' },
      ]
    },
    {
      name: 'Frameworks & Libraries',
      skills: [
        { name: 'Spring Boot', icon: '🍃', color: 'bg-green-500' },
        { name: 'Spring MVC', icon: '🌱', color: 'bg-green-600' },
        { name: 'Socket.IO', icon: '🔌', color: 'bg-blue-500' },
      ]
    },
    {
      name: 'Tools & Platforms',
      skills: [
        { name: 'Git', icon: '📝', color: 'bg-orange-500' },
        { name: 'Docker', icon: '🐳', color: 'bg-blue-500' },
        { name: 'Kubernetes', icon: '⚓', color: 'bg-blue-600' },
        { name: 'Kafka', icon: '📨', color: 'bg-orange-400' },
        { name: 'REST APIs', icon: '🌐', color: 'bg-green-500' },
        { name: 'RAG', icon: '🤖', color: 'bg-purple-500' },
      ]
    },
    {
      name: 'Databases',
      skills: [
        { name: 'MySQL', icon: '🐬', color: 'bg-blue-500' },
        { name: 'PostgreSQL', icon: '🐘', color: 'bg-blue-600' },
        { name: 'Redis', icon: '🔴', color: 'bg-red-500' },
      ]
    },
    {
      name: 'Concepts & Expertise',
      skills: [
        { name: 'System Design', icon: '🏗️', color: 'bg-gray-500' },
        { name: 'Distributed Systems', icon: '🌐', color: 'bg-blue-500' },
        { name: 'Full Stack Development', icon: '💻', color: 'bg-green-500' },
        { name: 'WebSockets', icon: '🔌', color: 'bg-blue-400' },
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
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.name}
                variants={itemVariants}
                className="space-y-4"
              >
                <h4 className="text-xl font-semibold text-foreground border-b border-primary/20 pb-2">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="group"
                    >
                      <Badge
                        variant="secondary"
                        className={`${skill.color} text-white hover:${skill.color}/80 transition-all duration-300 cursor-default group-hover:shadow-lg`}
                      >
                        <span className="mr-2 text-lg">{skill.icon}</span>
                        {skill.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
