import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    return theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const getTooltip = () => {
    return theme === 'light' ? 'Light theme' : 'Dark theme';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={getTooltip()}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="relative border-primary/50 bg-background/50 backdrop-blur-sm hover:border-primary hover:bg-primary/10 transition-colors"
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <div data-testid="theme-icon">
          {getIcon()}
          </div>
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
