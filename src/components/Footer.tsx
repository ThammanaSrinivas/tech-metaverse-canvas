import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'GitHub', 
      href: 'https://github.com/ThammanaSrinivas', 
      icon: Github 
    },
    { 
      name: 'LinkedIn', 
      href: 'https://www.linkedin.com/in/evolvedaily/', 
      icon: Linkedin 
    },
    { 
      name: 'Email', 
      href: 'mailto:sreenivast84@gmail.com', 
      icon: Mail 
    }
  ];

  return (
    <footer className="relative py-16 px-6 border-t border-primary/20 bg-background/50 backdrop-blur-sm">
      <div className="absolute inset-0 grid-bg opacity-5"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Main footer content */}
        <div className="flex flex-col items-center space-y-8">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-muted-foreground font-medium">
              Crafting digital experiences that inspire
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center space-x-8"
          >
            {socialLinks.map((link) => {
              const IconComponent = link.icon;
              return link.href ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-background/50 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                  aria-label={link.name}
                >
                  <IconComponent className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors duration-200" />
                </a>
              ) : (
                <div
                  key={link.name}
                  className="p-3 rounded-full bg-background/30 border border-primary/10"
                  aria-label={link.name}
                >
                  <IconComponent className="w-5 h-5 text-foreground/40" />
                </div>
              );
            })}
          </motion.div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

          {/* Copyright and tech stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center space-y-2"
          >
            <p className="text-muted-foreground font-medium">
              © 2025 Srinivas. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Built with React, Three.js & Love ❤️
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
