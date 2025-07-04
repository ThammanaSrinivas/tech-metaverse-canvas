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
      
      // Prevent flash by applying changes in a single frame
      requestAnimationFrame(() => {
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
        
        // Force a style recalculation for iOS Safari
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          root.style.display = 'none';
          root.offsetHeight; // Trigger reflow
          root.style.display = '';
        }
      });
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

// Performance monitoring utilities
export const performanceUtils = {
  // Detect device capabilities
  getDeviceCapabilities: () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : true;
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return {
      isMobile,
      isIOS,
      isLowEnd,
      hasReducedMotion,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      cores: navigator.hardwareConcurrency || 1,
    };
  },

  // Get performance recommendations based on device
  getPerformanceRecommendations: () => {
    const capabilities = performanceUtils.getDeviceCapabilities();
    const recommendations = {
      disable3D: capabilities.isLowEnd || capabilities.isMobile,
      reduceParticles: capabilities.isMobile || capabilities.isLowEnd,
      disableComplexAnimations: capabilities.hasReducedMotion || capabilities.isLowEnd,
      reduceBackdropBlur: capabilities.isIOS || capabilities.isLowEnd,
      useLowQualityRendering: capabilities.isMobile && capabilities.pixelRatio > 2,
    };
    
    return recommendations;
  },

  // Monitor frame rate
  monitorFrameRate: (callback: (fps: number) => void) => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  },

  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },
};
