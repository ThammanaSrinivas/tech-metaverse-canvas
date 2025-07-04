import { describe, it, expect, vi, beforeEach } from 'vitest';
import { themeUtils, validationUtils, animationUtils, projectUtils } from './utils';

describe('themeUtils', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should return dark theme when system prefers dark', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(themeUtils.getSystemTheme()).toBe('dark');
    });

    it('should return light theme when system prefers light', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(themeUtils.getSystemTheme()).toBe('light');
    });
  });

  describe('saveTheme and loadTheme', () => {
    it('should save and load theme from localStorage', () => {
      const testTheme = 'dark';
      themeUtils.saveTheme(testTheme);
      expect(themeUtils.loadTheme()).toBe(testTheme);
    });

    it('should return null when no theme is saved', () => {
      expect(themeUtils.loadTheme()).toBeNull();
    });
  });

  describe('applyTheme', () => {
    it('should apply theme classes to document element', async () => {
      const mockRemove = vi.fn();
      const mockAdd = vi.fn();
      const mockBodyRemove = vi.fn();
      const mockBodyAdd = vi.fn();
      
      Object.defineProperty(document, 'documentElement', {
        value: {
          classList: {
            remove: mockRemove,
            add: mockAdd,
          },
        },
        writable: true,
      });
      
      Object.defineProperty(document, 'body', {
        value: {
          classList: {
            remove: mockBodyRemove,
            add: mockBodyAdd,
          },
        },
        writable: true,
      });

      themeUtils.applyTheme('dark');
      
      // Wait for requestAnimationFrame to execute
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      expect(mockRemove).toHaveBeenCalledWith('light', 'dark');
      expect(mockAdd).toHaveBeenCalledWith('dark');
      expect(mockBodyRemove).toHaveBeenCalledWith('light', 'dark');
      expect(mockBodyAdd).toHaveBeenCalledWith('dark');
    });
  });
});

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(validationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(validationUtils.isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(validationUtils.isValidEmail('test@')).toBe(false);
      expect(validationUtils.isValidEmail('@example.com')).toBe(false);
      expect(validationUtils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should validate names with 2 or more characters', () => {
      expect(validationUtils.isValidName('John')).toBe(true);
      expect(validationUtils.isValidName('A')).toBe(false);
      expect(validationUtils.isValidName('')).toBe(false);
      expect(validationUtils.isValidName('   ')).toBe(false);
    });
  });

  describe('isValidMessage', () => {
    it('should validate messages with 10 or more characters', () => {
      expect(validationUtils.isValidMessage('This is a valid message')).toBe(true);
      expect(validationUtils.isValidMessage('Short')).toBe(false);
      expect(validationUtils.isValidMessage('')).toBe(false);
    });
  });
});

describe('animationUtils', () => {
  describe('getScrollProgress', () => {
    it('should return 0 for null element', () => {
      expect(animationUtils.getScrollProgress(null)).toBe(0);
    });

    it('should calculate scroll progress correctly', () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 0,
          height: 100,
        }),
      } as unknown as HTMLElement;

      Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 100, writable: true });

      const progress = animationUtils.getScrollProgress(mockElement);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('getMousePosition', () => {
    it('should calculate mouse position relative to container', () => {
      const mockEvent = {
        clientX: 100,
        clientY: 50,
      } as MouseEvent;

      const mockContainer = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          left: 0,
          top: 0,
          width: 200,
          height: 100,
        }),
      } as unknown as HTMLElement;

      const position = animationUtils.getMousePosition(mockEvent, mockContainer);
      
      expect(position.x).toBe(0); // (100 - 0 - 100) * 0.01 = 0
      expect(position.y).toBe(0); // (50 - 0 - 50) * 0.01 = 0
    });
  });
});

describe('projectUtils', () => {
  const mockProjects = [
    { id: 1, category: 'web-app', title: 'Project 1' },
    { id: 2, category: 'mobile', title: 'Project 2' },
    { id: 3, category: 'web-app', title: 'Project 3' },
  ];

  describe('filterProjects', () => {
    it('should return all projects when filter is "all"', () => {
      const filtered = projectUtils.filterProjects(mockProjects, 'all');
      expect(filtered).toHaveLength(3);
    });

    it('should filter projects by category', () => {
      const filtered = projectUtils.filterProjects(mockProjects, 'web-app');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.category === 'web-app')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const filtered = projectUtils.filterProjects(mockProjects, 'non-existent');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getProjectCategories', () => {
    it('should return unique categories', () => {
      const categories = projectUtils.getProjectCategories(mockProjects);
      expect(categories).toEqual(['web-app', 'mobile']);
    });

    it('should return empty array for empty projects', () => {
      const categories = projectUtils.getProjectCategories([]);
      expect(categories).toEqual([]);
    });
  });
}); 