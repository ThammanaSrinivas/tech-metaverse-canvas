import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeUtils } from '@/lib/utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved choice wins; otherwise follow the OS. index.html applies the same rule pre-render to avoid a flash.
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = themeUtils.loadTheme();
    return saved === 'light' || saved === 'dark' ? saved : themeUtils.getSystemTheme();
  });

  useEffect(() => {
    themeUtils.applyTheme(theme);
  }, [theme]);

  // Persist only explicit choices, so visitors who never toggle keep following their OS.
  const setTheme = (next: Theme) => {
    themeUtils.saveTheme(next);
    setThemeState(next);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme: theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
