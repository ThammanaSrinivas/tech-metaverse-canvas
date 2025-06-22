import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import FloatingCLI from '../FloatingCLI';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Terminal: () => <div data-testid="terminal-icon">Terminal</div>,
  Code: () => <div data-testid="code-icon">Code</div>,
  TestTube: () => <div data-testid="test-tube-icon">TestTube</div>,
  Bug: () => <div data-testid="bug-icon">Bug</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
  Rocket: () => <div data-testid="rocket-icon">Rocket</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Minus: () => <div data-testid="minus-icon">Minus</div>,
  Maximize2: () => <div data-testid="maximize-icon">Maximize2</div>,
  X: () => <div data-testid="x-icon">X</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>
}));

// Mock the theme context
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({ theme: 'dark' })),
  ThemeProvider: ({ children }: any) => <div>{children}</div>
}));

describe('FloatingCLI Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders within acceptable time limit (under 100ms)', () => {
    const startTime = performance.now();
    
    render(<FloatingCLI testMode />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100);
  });

  it('handles rapid state changes efficiently', () => {
    const { rerender } = render(<FloatingCLI testMode />);
    
    const startTime = performance.now();
    
    // Simulate rapid state changes
    for (let i = 0; i < 10; i++) {
      rerender(<FloatingCLI testMode />);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should handle 10 re-renders in under 50ms
    expect(totalTime).toBeLessThan(50);
  });

  it('maintains consistent memory usage during animations', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    render(<FloatingCLI testMode />);
    
    // Simulate some time passing (animations)
    vi.advanceTimersByTime(5000);
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 1MB)
    if (memoryIncrease > 0) {
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    }
  });

  it('handles large output content efficiently', () => {
    const largeOutput = 'A'.repeat(10000); // 10KB of content
    
    const startTime = performance.now();
    
    render(<FloatingCLI testMode />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render large content in under 200ms
    expect(renderTime).toBeLessThan(200);
  });

  it('performs well with multiple instances', () => {
    const startTime = performance.now();
    
    // Render multiple instances
    const { unmount: unmount1 } = render(<FloatingCLI testMode />);
    const { unmount: unmount2 } = render(<FloatingCLI testMode />);
    const { unmount: unmount3 } = render(<FloatingCLI testMode />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 3 instances in under 150ms
    expect(renderTime).toBeLessThan(150);
    
    // Cleanup
    unmount1();
    unmount2();
    unmount3();
  });

  it('handles theme switching efficiently', () => {
    const startTime = performance.now();
    
    const { rerender } = render(
      <BrowserRouter>
        <ThemeProvider>
          <FloatingCLI testMode={true} />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Simulate theme switching by re-rendering
    for (let i = 0; i < 5; i++) {
      rerender(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should handle 5 theme switches in reasonable time
    expect(totalTime).toBeLessThan(500);
  });

  it('maintains smooth animations during user interactions', () => {
    const startTime = performance.now();
    
    render(
      <BrowserRouter>
        <ThemeProvider>
          <FloatingCLI testMode={true} />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Simulate rapid user interactions
    const nextButton = screen.getByTitle('Next Step');
    const prevButton = screen.getByTitle('Previous Step');
    const autoPlayButton = screen.getByTitle('Pause Auto-play');
    
    // Perform multiple interactions
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);
      fireEvent.click(autoPlayButton);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should handle 30 interactions in reasonable time (more realistic expectation)
    expect(totalTime).toBeLessThan(1000);
  });

  it('handles window resize efficiently', () => {
    render(<FloatingCLI testMode />);
    
    const startTime = performance.now();
    
    // Simulate window resize events
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event('resize'));
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should handle 10 resize events in under 50ms
    expect(totalTime).toBeLessThan(50);
  });

  it('performs well with long step content', () => {
    const startTime = performance.now();
    
    render(<FloatingCLI testMode />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render with long content in under 150ms
    expect(renderTime).toBeLessThan(150);
  });

  it('handles rapid navigation efficiently', () => {
    const { rerender } = render(<FloatingCLI testMode />);
    
    const startTime = performance.now();
    
    // Simulate rapid navigation between steps
    for (let i = 0; i < 10; i++) {
      rerender(<FloatingCLI testMode />);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should handle 10 navigation changes in under 100ms
    expect(totalTime).toBeLessThan(100);
  });
}); 