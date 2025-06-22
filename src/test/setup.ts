import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill for ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Polyfill for IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock window.open
window.open = vi.fn();

// Mock document.getElementById for scroll functionality
const originalGetElementById = document.getElementById;
document.getElementById = vi.fn((id: string) => {
  if (id === 'projects') {
    return {
      scrollIntoView: vi.fn(),
    } as any;
  }
  return originalGetElementById.call(document, id);
}); 