import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const experiences = [
  {
    title: 'Software Engineer 2',
    company: 'Paypal, Chennai',
    period: 'May 2025 - Present',
    logo: '/paypal.png',
    details: [
      'Working on a simplified case management platform.',
      'Implementing multitenancy using test-driven development in Spring Boot and Maven.'
    ]
  },
  {
    title: 'Member of Technical Staff',
    company: 'Zoho, Chennai',
    period: 'May 2022 - May 2025',
    logo: '/zoho.svg',
    details: [
      'Led the design of a fault-tolerant cron scheduling system using Kafka, reducing cron intervals from 1 hour to 1 minute and supporting 10M daily jobs.',
      'Introduced a highly scalable and efficient Node.js HTTP server in TypeScript from the ground up, leveraging Docker for a containerized deployment environment.',
      'Refined business logic in Kafka to optimize message production, reducing frequency from 7,000 to 32 (99.54% reduction), significantly improving job processing speed and overall system performance.',
      'Spearheaded cross-functional collaboration with the Sparkler team to optimize VM runtime workflows, reducing user function execution time by 20% (15s to 12s) through streamlined cold-start mappings and resource consolidation.',
      'Created a scalable audit log service in a month for HIPAA compliance, enabling product release in Europe and increasing revenue by 43% in 2 months.'
    ]
  },
  {
    title: 'Project Trainee',
    company: 'Zoho, Chennai',
    period: 'Jan 2022 - May 2022',
    logo: '/zoho.svg',
    details: [
      'Designed and implemented Environment Variables addressing 60% user tickets for FAAS.',
      'Implemented Node.js 16 Support for FAAS with 12% reduced cold start time.'
    ]
  },
  {
    title: 'Summer Intern',
    company: 'Zoho, Chennai',
    period: 'May 2021 - June 2021',
    logo: '/zoho.svg',
    details: [
      'Designed Student Task Segregation System, a Spring MVC application for student tasks.'
    ]
  }
];

const timelineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, type: 'spring' }
  })
};

const WorkExperience: React.FC = () => {
  return (
    <section id="work-experience" className="py-20 px-6" role="region" aria-label="Work Experience">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Work Experience</span>
          </h2>
        </motion.div>
        <div className="relative pl-8 md:pl-16">
          {/* Vertical timeline line */}
          <div className="absolute left-3 md:left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 to-secondary/30 rounded-full" style={{ zIndex: 0 }} />
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.title + exp.period}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={timelineVariants}
                className="relative flex items-start group"
              >
                {/* Timeline dot and logo */}
                <div className="absolute left-[-2.25rem] md:left-[-3.5rem] flex flex-col items-center z-10" style={{ width: '56px' }}>
                  <div className="w-12 h-12 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <img src={exp.logo} alt={exp.company + ' logo'} className="w-8 h-8 object-contain mx-auto" style={{ display: 'block' }} />
                  </div>
                  {idx < experiences.length - 1 && (
                    <div className="w-1 h-full bg-gradient-to-b from-primary/60 to-secondary/30" />
                  )}
                </div>
                <Card className="glass-card border-primary/20 p-8 w-full ml-6 md:ml-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-neon-green bg-clip-text text-transparent mb-1 md:mb-0 drop-shadow-lg">
                      {exp.company}
                    </div>
                    <div className="text-lg font-semibold text-primary mb-1 md:mb-0">{exp.title}</div>
                    <div className="text-md font-mono text-neon-green bg-neon-green/10 px-3 py-1 rounded-full shadow-sm">{exp.period}</div>
                  </div>
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                    {exp.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperience; 