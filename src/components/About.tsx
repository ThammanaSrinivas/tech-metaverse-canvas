import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Lightbulb, 
  Heart, 
  Code2, 
  Cloud, 
  Layers, 
  Zap,
  ChevronRight
} from 'lucide-react';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('journey');

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
  };

  const tabs = [
    { id: 'journey', label: 'My Journey' },
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'values', label: 'Core Values' },
    { id: 'expertise', label: 'Expertise' }
  ];

  const content = {
    journey: {
      title: "My Journey",
      description: "Started as a computer science enthusiast fascinated by the intersection of technology and problem-solving. Over the years, I've evolved into a full-stack developer with deep expertise in Java/Spring ecosystem, modern web technologies, and distributed systems architecture.",
      details: "I believe in creating robust, scalable solutions that not only meet current requirements but also anticipate future needs. Every project is an opportunity to apply best practices and innovative approaches to solve real-world problems."
    },
    philosophy: {
      title: "Philosophy",
      description: "Code is architecture, design is communication, and user experience is empathy in action.",
      details: "I strive to create digital solutions that are not just technically sound but also meaningful, maintainable, and accessible to everyone."
    },
    values: {
      title: "Core Values",
      items: [
        { name: "Innovation", description: "Embracing cutting-edge technologies and creative problem-solving approaches" },
        { name: "Quality", description: "Maintaining high standards in code quality, testing, and documentation" },
        { name: "Collaboration", description: "Working effectively in teams, sharing knowledge, and mentoring others" }
      ]
    },
    expertise: {
      title: "Expertise Areas",
      items: [
        { name: "System Design" },
        { name: "Cloud Architecture" },
        { name: "Full Stack Development" },
        { name: "Performance Optimization" }
      ]
    }
  };

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden" role="region" aria-label="About">
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-foreground heading-primary">
            About Me
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
            Software Engineer with 3 years of experience building and architecting scalable serverless cloud platforms. Led
            end-to-end implementation of Kafka-based job scheduling, reducing cron intervals by 98% and supporting 10M+
            tasks daily. Passionate about building fault-tolerant distributed systems and mentoring teams.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
        >
          {/* Left Column - Navigation */}
          <motion.div
            variants={itemVariants}
            className="space-y-3 sm:space-y-4 order-2 lg:order-1"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 font-light text-base sm:text-lg ${
                  activeTab === tab.id
                    ? 'text-foreground bg-background/50 border-l-4 border-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/30 border-l-4 border-transparent hover:border-primary/30'
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex items-start bg-background/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/20 order-1 lg:order-2"
          >
            {activeTab === 'journey' && (
              <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground tracking-wide">My Journey</h3>
                </div>
                <div className="space-y-3 sm:space-y-4 text-muted-foreground leading-relaxed">
                  <p className="text-sm sm:text-base lg:text-lg font-light">
                    Started as a computer science enthusiast fascinated by the intersection of technology and problem-solving. Over the years, I've evolved into a full-stack developer with deep expertise in Java/Spring ecosystem, modern web technologies, and distributed systems architecture.
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg font-light">
                    I believe in creating robust, scalable solutions that not only meet current requirements but also anticipate future needs. Every project is an opportunity to apply best practices and innovative approaches to solve real-world problems.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'philosophy' && (
              <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground tracking-wide">Philosophy</h3>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <blockquote className="text-base sm:text-lg lg:text-xl text-muted-foreground italic font-light border-l-4 border-primary/60 pl-3 sm:pl-6 lg:pl-8 py-2 sm:py-3 lg:py-4">
                    "Code is architecture, design is communication, and user experience is empathy in action."
                  </blockquote>
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed">
                    I strive to create digital solutions that are not just technically sound but also meaningful, maintainable, and accessible to everyone.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground tracking-wide">Core Values</h3>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80" />
                      <h4 className="text-base sm:text-lg lg:text-xl font-light text-foreground tracking-wide">Innovation</h4>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed">Embracing cutting-edge technologies and creative problem-solving approaches</p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80" />
                      <h4 className="text-base sm:text-lg lg:text-xl font-light text-foreground tracking-wide">Quality</h4>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed">Maintaining high standards in code quality, testing, and documentation</p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80" />
                      <h4 className="text-base sm:text-lg lg:text-xl font-light text-foreground tracking-wide">Collaboration</h4>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed">Working effectively in teams, sharing knowledge, and mentoring others</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expertise' && (
              <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground tracking-wide">Expertise Areas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="p-3 sm:p-4 lg:p-6 rounded-lg bg-background/50 border border-primary/30 hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
                      <div className="text-sm sm:text-base lg:text-lg font-light text-foreground tracking-wide">System Design</div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6 rounded-lg bg-background/50 border border-primary/30 hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
                      <div className="text-sm sm:text-base lg:text-lg font-light text-foreground tracking-wide">Cloud Architecture</div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6 rounded-lg bg-background/50 border border-primary/30 hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
                      <div className="text-sm sm:text-base lg:text-lg font-light text-foreground tracking-wide">Full Stack Development</div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6 rounded-lg bg-background/50 border border-primary/30 hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
                      <div className="text-sm sm:text-base lg:text-lg font-light text-foreground tracking-wide">Performance Optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
