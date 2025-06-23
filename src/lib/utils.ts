import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Theme utilities
export const themeUtils = {
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  saveTheme: (theme: string): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  },
  
  loadTheme: (): string | null => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('theme');
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
        return null;
      }
    }
    return null;
  },
  
  applyTheme: (theme: 'light' | 'dark'): void => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Add the new theme class
      root.classList.add(theme);
      
      // Also set a data attribute for additional styling if needed
      if (root.setAttribute) {
        root.setAttribute('data-theme', theme);
      }
      
      // Ensure the theme is applied to the body as well
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
  }
};

// Form validation utilities
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2;
  },
  
  isValidMessage: (message: string): boolean => {
    return message.trim().length >= 10;
  }
};

// Animation utilities
export const animationUtils = {
  getScrollProgress: (element: HTMLElement | null): number => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const elementTop = rect.top + scrollTop;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    const scrolled = scrollTop + windowHeight - elementTop;
    return Math.max(0, Math.min(1, scrolled / elementHeight));
  },
  
  getMousePosition: (event: MouseEvent, container: HTMLElement): { x: number; y: number } => {
    const rect = container.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - rect.width / 2) * 0.01,
      y: (event.clientY - rect.top - rect.height / 2) * 0.01,
    };
  }
};

// Project filtering utilities
export const projectUtils = {
  filterProjects: (projects: any[], filter: string): any[] => {
    if (filter === 'all') return projects;
    return projects.filter(project => project.category === filter);
  },
  
  getProjectCategories: (projects: any[]): string[] => {
    const categories = projects.map(project => project.category);
    return [...new Set(categories)];
  }
};
