import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';

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
    },
    { 
      name: 'Location', 
      href: null, 
      icon: MapPin 
    },
  ];

  return (
    <footer className="relative py-12 px-6 border-t border-primary/20">
      <div className="absolute inset-0 grid-bg opacity-10"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl font-bold gradient-text mb-2">Portfolio</h3>
            <p className="text-muted-foreground">
              Crafting digital experiences that inspire
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center space-x-6"
          >
            {socialLinks.map((link) => {
              const IconComponent = link.icon;
              return link.href ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-primary transition-colors duration-200 hover:scale-110"
                  aria-label={link.name}
                >
                  <IconComponent className="w-6 h-6" />
                </a>
              ) : (
                <div
                  key={link.name}
                  className="text-foreground/40 cursor-default"
                  aria-label={link.name}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-right"
          >
            <p className="text-muted-foreground">
              © {currentYear} Portfolio. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Built with React, Three.js & Love ❤️
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
