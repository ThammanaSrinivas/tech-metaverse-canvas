import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const About: React.FC = () => {
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
    <section id="about" className="py-20 px-6" role="region" aria-label="About">
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
            Software Engineer with 3 years of experience building and architecting scalable serverless cloud platforms. Led
            end-to-end implementation of Kafka-based job scheduling, reducing cron intervals by 98% and supporting 10M+
            tasks daily. Passionate about building fault-tolerant distributed systems and mentoring teams.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          <motion.div
            variants={itemVariants}
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
            variants={itemVariants}
            className="space-y-6"
          >
            <Card className="glass-card p-8 border-neon-green/20">
              <h3 className="text-2xl font-bold mb-4 text-neon-green">Core Values</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Innovation</h4>
                  <p className="text-muted-foreground text-sm">
                    Embracing cutting-edge technologies and creative problem-solving approaches to deliver exceptional solutions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Quality</h4>
                  <p className="text-muted-foreground text-sm">
                    Maintaining high standards in code quality, testing, and documentation to ensure reliable and maintainable systems.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Collaboration</h4>
                  <p className="text-muted-foreground text-sm">
                    Working effectively in teams, sharing knowledge, and mentoring others to achieve collective success.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-8 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-primary">Expertise Areas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="text-sm font-medium">System Design</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50 border border-secondary/10">
                  <div className="text-2xl mb-2">☁️</div>
                  <div className="text-sm font-medium">Cloud Architecture</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50 border border-neon-green/10">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium">Full Stack Dev</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium">Performance</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
