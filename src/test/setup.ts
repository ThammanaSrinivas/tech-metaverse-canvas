import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
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

// Suppress console warnings for Framer Motion props
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React does not recognize the') ||
     args[0].includes('whileHover') ||
     args[0].includes('whileTap') ||
     args[0].includes('whileInView'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock framer-motion to prevent animation issues in tests
vi.mock('framer-motion', () => {
  const createMockElement = (tag: string) => {
    return React.forwardRef((props: any, ref) => {
      const { whileHover, whileTap, whileInView, initial, animate, transition, children, ...restProps } = props || {};
      return React.createElement(tag, { ...restProps, ref }, children);
    });
  };

  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return createMockElement(prop);
        }
        return undefined;
      }
    }),
    AnimatePresence: ({ children }: any) => children,
    useMotionValue: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
    useTransform: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
    useSpring: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
    useMotionValueEvent: vi.fn(),
    useAnimate: vi.fn(() => [vi.fn(), vi.fn()]),
    useInView: vi.fn(() => [vi.fn(), false]),
    useReducedMotion: vi.fn(() => false),
    usePresence: vi.fn(() => [false, vi.fn()]),
    useCycle: vi.fn(() => [vi.fn(), vi.fn()]),
    useDragControls: vi.fn(() => [vi.fn(), vi.fn()]),
    useDomEvent: vi.fn(),
    useIsomorphicLayoutEffect: vi.fn(),
    useMotionTemplate: vi.fn(() => vi.fn()),
    useScroll: vi.fn(() => ({ scrollX: { get: vi.fn() }, scrollY: { get: vi.fn() } })),
    useScrollControls: vi.fn(() => [vi.fn(), vi.fn()]),
    useTime: vi.fn(() => ({ get: vi.fn() })),
    useVelocity: vi.fn(() => ({ get: vi.fn() })),
    useWillChange: vi.fn(),
    LazyMotion: ({ children }: any) => children,
    domAnimation: {},
    domMax: {},
  };
});

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock document.getElementById for scroll functionality
Object.defineProperty(document, 'getElementById', {
  writable: true,
  value: vi.fn(() => ({
    scrollIntoView: vi.fn(),
  })),
}); 