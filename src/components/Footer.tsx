
import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: '🐙' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'Discord', href: '#', icon: '🎮' },
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
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-2xl hover:scale-110 transition-transform duration-200"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
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
