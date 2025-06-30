import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  TrendingUp,
  Users,
  Zap,
  Code2,
  Cloud,
  Database
} from 'lucide-react';

const experiences = [
  {
    title: 'Software Engineer 2',
    company: 'Paypal',
    location: 'Chennai, India',
    period: 'May 2025 - Present',
    logo: '/paypal.png',
    achievements: [
      'Working on a simplified case management platform.',
      'Implementing multitenancy using test-driven development in Spring Boot and Maven.'
    ],
    skills: ['Spring Boot', 'Maven', 'TDD', 'Microservices'],
    impact: 'Platform Development',
    icon: Building2
  },
  {
    title: 'Member of Technical Staff',
    company: 'Zoho',
    location: 'Chennai, India',
    period: 'May 2022 - May 2025',
    logo: '/zoho.svg',
    achievements: [
      'Led the design of a fault-tolerant cron scheduling system using Kafka, reducing cron intervals from 1 hour to 1 minute and supporting 10M daily jobs.',
      'Introduced a highly scalable and efficient Node.js HTTP server in TypeScript from the ground up, leveraging Docker for a containerized deployment environment.',
      'Refined business logic in Kafka to optimize message production, reducing frequency from 7,000 to 32 (99.54% reduction), significantly improving job processing speed and overall system performance.',
      'Spearheaded cross-functional collaboration with the Sparkler team to optimize VM runtime workflows, reducing user function execution time by 20% (15s to 12s) through streamlined cold-start mappings and resource consolidation.',
      'Created a scalable audit log service in a month for HIPAA compliance, enabling product release in Europe and increasing revenue by 43% in 2 months.'
    ],
    skills: ['Kafka', 'Node.js', 'TypeScript', 'Docker', 'System Design', 'Performance Optimization'],
    impact: 'System Architecture & Performance',
    icon: TrendingUp
  },
  {
    title: 'Project Trainee',
    company: 'Zoho',
    location: 'Chennai, India',
    period: 'Jan 2022 - May 2022',
    logo: '/zoho.svg',
    achievements: [
      'Designed and implemented Environment Variables addressing 60% user tickets for FAAS.',
      'Implemented Node.js 16 Support for FAAS with 12% reduced cold start time.'
    ],
    skills: ['Node.js', 'FAAS', 'Environment Management', 'Performance'],
    impact: 'Platform Enhancement',
    icon: Zap
  },
  {
    title: 'Summer Intern',
    company: 'Zoho',
    location: 'Chennai, India',
    period: 'May 2021 - June 2021',
    logo: '/zoho.svg',
    achievements: [
      'Designed Student Task Segregation System, a Spring MVC application for student tasks.'
    ],
    skills: ['Spring MVC', 'Java', 'Web Development'],
    impact: 'Application Development',
    icon: Code2
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const WorkExperience: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <section id="work-experience" className="py-20 px-6 bg-background/50" role="region" aria-label="Work Experience">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-foreground heading-primary">
            Work Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A journey through professional growth, technical challenges, and impactful contributions
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.title + exp.period}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                className="bg-background/30 backdrop-blur-sm rounded-xl border border-primary/20 overflow-hidden hover:border-primary/40 transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                {/* Header */}
                <div 
                  className="p-4 sm:p-6 lg:p-8 cursor-pointer"
                  onClick={() => toggleCard(idx)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-background/50 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <img src={exp.logo} alt={exp.company + ' logo'} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <exp.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-foreground tracking-wide truncate">
                            {exp.title}
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-6 text-muted-foreground text-sm sm:text-base">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium truncate">{exp.company}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{exp.location}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-mono text-xs sm:text-sm">{exp.period}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="px-2 sm:px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {exp.impact}
                        </span>
                      </div>
                      {expandedCard === idx ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-transform" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: expandedCard === idx ? 'auto' : 0,
                    opacity: expandedCard === idx ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 border-t border-primary/10">
                    <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                      {/* Skills */}
                      <div>
                        <h4 className="text-base sm:text-lg font-light text-foreground mb-2 sm:mb-3 tracking-wide">Key Technologies</h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {exp.skills.map((skill, skillIdx) => (
                            <span
                              key={skillIdx}
                              className="px-2 sm:px-3 py-1 rounded-lg bg-background/50 border border-primary/20 text-xs sm:text-sm font-medium text-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Achievements */}
                      <div>
                        <h4 className="text-base sm:text-lg font-light text-foreground mb-2 sm:mb-3 tracking-wide">Key Achievements</h4>
                        <div className="space-y-2 sm:space-y-3">
                          {exp.achievements.map((achievement, achievementIdx) => (
                            <div key={achievementIdx} className="flex items-start gap-2 sm:gap-3">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-muted-foreground font-light leading-relaxed text-sm sm:text-base">
                                {achievement}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WorkExperience; 