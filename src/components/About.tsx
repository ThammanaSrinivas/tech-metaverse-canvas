
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const About: React.FC = () => {
  const skills = [
    { name: 'React/Next.js', level: 95, color: 'bg-neon-blue' },
    { name: 'TypeScript', level: 90, color: 'bg-neon-purple' },
    { name: 'Three.js/WebGL', level: 85, color: 'bg-neon-pink' },
    { name: 'Node.js', level: 88, color: 'bg-neon-green' },
    { name: 'Python', level: 82, color: 'bg-neon-orange' },
    { name: 'UI/UX Design', level: 87, color: 'bg-primary' },
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
            I'm a passionate full-stack developer and digital artist specializing in creating immersive web experiences. 
            With a background in computer science and a love for cutting-edge technology, I bridge the gap between 
            functionality and aesthetics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Card className="glass-card p-8 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-primary">My Journey</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Started as a computer science student fascinated by the intersection of technology and art. 
                Over the years, I've evolved into a full-stack developer with expertise in modern web technologies, 
                3D graphics, and user experience design.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I believe in creating digital experiences that not only function flawlessly but also inspire 
                and engage users on an emotional level. Every project is an opportunity to push the boundaries 
                of what's possible on the web.
              </p>
            </Card>

            <Card className="glass-card p-8 border-secondary/20">
              <h3 className="text-2xl font-bold mb-4 text-secondary">Philosophy</h3>
              <p className="text-muted-foreground leading-relaxed">
                "Code is poetry, design is storytelling, and user experience is empathy in action."
                I strive to create digital solutions that are not just technically sound but also 
                meaningful and accessible to everyone.
              </p>
            </Card>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold mb-8 text-center">Technical Skills</h3>
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full ${skill.color} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                  </motion.div>
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
