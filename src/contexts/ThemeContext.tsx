import React, { createContext, useContext, useEffect, useState, useLayoutEffect } from 'react';
import { themeUtils } from '@/lib/utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: Theme;
  toggleTheme: () => void;
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  try {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  // Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [isHydrated, setIsHydrated] = useState(false);

  // Use useLayoutEffect to apply theme before paint to prevent flash
  useLayoutEffect(() => {
    const initialTheme = getInitialTheme();
    
    // Apply theme immediately to prevent flash
    themeUtils.applyTheme(initialTheme);
    
    // Set the theme state if it's different
    if (theme !== initialTheme) {
      setTheme(initialTheme);
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      themeUtils.saveTheme(theme);
      themeUtils.applyTheme(theme);
    }
  }, [theme, isHydrated]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme: theme, toggleTheme, isHydrated }}>
      {children}
    </ThemeContext.Provider>
  );
};
