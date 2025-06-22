import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return '🔄';
    } else if (effectiveTheme === 'light') {
      return '☀️';
    } else {
      return '🌙';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="relative border-primary/50 bg-background/50 backdrop-blur-sm hover:border-primary hover:bg-primary/10"
      >
        <motion.span
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-lg"
        >
          {getIcon()}
        </motion.span>
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
