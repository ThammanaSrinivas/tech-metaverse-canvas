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

// Mock IntersectionObserver with callback storage for testability
const intersectionObserverCallbacks: Array<IntersectionObserverCallback> = [];
global.IntersectionObserver = vi.fn().mockImplementation((callback: IntersectionObserverCallback) => {
  intersectionObserverCallbacks.push(callback);
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});
(global as any).__intersectionObserverCallbacks = intersectionObserverCallbacks;

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

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: { position: { set: vi.fn(), copy: vi.fn() }, lookAt: vi.fn() },
    gl: { setSize: vi.fn() },
    scene: {},
    size: { width: 800, height: 600 },
  })),
  extend: vi.fn(),
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: (props: any) => React.createElement('div', { 'data-testid': 'orbit-controls' }),
  Html: ({ children }: any) => React.createElement('div', null, children),
  Text: ({ children }: any) => React.createElement('div', null, children),
  Float: ({ children }: any) => React.createElement('div', null, children),
  MeshDistortMaterial: (props: any) => React.createElement('div', null),
  Sphere: ({ children }: any) => React.createElement('div', null, children),
  PerspectiveCamera: (props: any) => React.createElement('div', null),
  Environment: (props: any) => React.createElement('div', null),
  Points: React.forwardRef(({ children }: any, ref: any) => React.createElement('div', { ref }, children)),
  PointMaterial: (props: any) => React.createElement('div', null),
}));

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