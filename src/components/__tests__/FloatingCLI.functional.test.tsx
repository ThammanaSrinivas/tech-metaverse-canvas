import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FloatingCLI from '../FloatingCLI';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the useIsMobile hook
let mockUseIsMobile: any;
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: (...args: any[]) => mockUseIsMobile(...args)
}));

// Mock framer-motion with simplified implementation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
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

describe('FloatingCLI Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseIsMobile = vi.fn(() => false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Complete Developer Workflow', () => {
    it('allows user to complete full development cycle', async () => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );

      // Check initial state
      expect(screen.getByText('Step 1: Write Code')).toBeInTheDocument();
      expect(screen.getByText('1 / 6')).toBeInTheDocument();

      // Navigate through all steps quickly
      const nextButton = screen.getByTitle('Next Step');
      
      // Step 2
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 2: Run Unit & Functional Tests')).toBeInTheDocument();

      // Step 3
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 3: 1 FT Failed')).toBeInTheDocument();

      // Step 4
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 4: Write Some Other Code')).toBeInTheDocument();

      // Step 5
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 5: Now All Tests Pass')).toBeInTheDocument();

      // Step 6
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 6: Deploy & Check Coverage')).toBeInTheDocument();
      expect(screen.getByText('npm run build && npm run test:coverage')).toBeInTheDocument();
    });

    it('allows user to navigate backwards through workflow', () => {
      render(<FloatingCLI testMode />);
      
      // Go to step 3
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton); // Step 2
      fireEvent.click(nextButton); // Step 3
      
      expect(screen.getByText('Step 3: 1 FT Failed')).toBeInTheDocument();
      
      // Go back to step 1
      const prevButton = screen.getByTitle('Previous Step');
      fireEvent.click(prevButton); // Step 2
      fireEvent.click(prevButton); // Step 1
      
      expect(screen.getByText('Step 1: Write Code')).toBeInTheDocument();
      expect(screen.getByText('1 / 6')).toBeInTheDocument();
    });
  });

  describe('Window Management Workflow', () => {
    it('allows user to minimize, restore, maximize, and close', () => {
      render(<FloatingCLI testMode />);
      
      // Minimize
      const minimizeButton = screen.getByTitle('Minimize');
      fireEvent.click(minimizeButton);
      expect(screen.getByTitle('Restore Developer Workflow')).toBeInTheDocument();
      
      // Restore
      const restoreButton = screen.getByTitle('Restore Developer Workflow');
      fireEvent.click(restoreButton);
      expect(screen.getByText('Development Workflow')).toBeInTheDocument();
      
      // Maximize
      const maximizeButton = screen.getByTitle('Maximize');
      fireEvent.click(maximizeButton);
      expect(screen.getByText('Development Workflow')).toBeInTheDocument();
      
      // Close
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      expect(screen.getByTitle('Reopen Developer Workflow')).toBeInTheDocument();
      
      // Reopen
      const reopenButton = screen.getByTitle('Reopen Developer Workflow');
      fireEvent.click(reopenButton);
      expect(screen.getByText('Development Workflow')).toBeInTheDocument();
    });

    it('maintains step state during window operations', () => {
      render(<FloatingCLI testMode />);
      
      // Navigate to step 3
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Step 3: 1 FT Failed')).toBeInTheDocument();
      
      // Minimize and restore
      const minimizeButton = screen.getByTitle('Minimize');
      fireEvent.click(minimizeButton);
      
      const restoreButton = screen.getByTitle('Restore Developer Workflow');
      fireEvent.click(restoreButton);
      
      // Should still be on step 3
      expect(screen.getByText('Step 3: 1 FT Failed')).toBeInTheDocument();
      expect(screen.getByText('3 / 6')).toBeInTheDocument();
    });
  });

  describe('Auto-play Control Workflow', () => {
    it('allows user to pause and resume auto-play', () => {
      render(<FloatingCLI testMode />);
      
      // Initially auto-play is on
      expect(screen.getByTitle('Pause Auto-play')).toBeInTheDocument();
      
      // Pause auto-play
      const autoPlayButton = screen.getByTitle('Pause Auto-play');
      fireEvent.click(autoPlayButton);
      expect(screen.getByTitle('Resume Auto-play')).toBeInTheDocument();
      
      // Resume auto-play
      const resumeButton = screen.getByTitle('Resume Auto-play');
      fireEvent.click(resumeButton);
      expect(screen.getByTitle('Pause Auto-play')).toBeInTheDocument();
    });

    it('maintains auto-play state during navigation', () => {
      render(<FloatingCLI testMode />);
      
      // Pause auto-play
      const autoPlayButton = screen.getByTitle('Pause Auto-play');
      fireEvent.click(autoPlayButton);
      
      // Navigate to next step
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      
      // Auto-play should still be paused
      expect(screen.getByTitle('Resume Auto-play')).toBeInTheDocument();
    });
  });

  describe('Theme Integration Workflow', () => {
    it('displays correct theme-aware styling', () => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );

      // Look for the main CLI container with the correct class
      const cliContainer = screen.getByText('Development Workflow').closest('.bg-gray-800\\/90');
      expect(cliContainer).toBeInTheDocument();
    });

    it('handles theme switching gracefully', () => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );

      const cliContainer = screen.getByText('Step 1: Write Code').closest('div');
      expect(cliContainer).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness Workflow', () => {
    it('adapts to mobile viewport', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<FloatingCLI testMode />);
      expect(screen.getByText('S1')).toBeInTheDocument();
      expect(screen.getByText('Dev Workflow')).toBeInTheDocument();
    });

    it('handles mobile navigation correctly', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<FloatingCLI testMode />);
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      expect(screen.getByText('S2')).toBeInTheDocument();
    });
  });

  describe('Error Handling Workflow', () => {
    it('handles rapid button clicks gracefully', () => {
      render(<FloatingCLI testMode />);
      
      const nextButton = screen.getByTitle('Next Step');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }
      
      // Should end up at the last step
      expect(screen.getByText('6 / 6')).toBeInTheDocument();
    });

    it('handles disabled button states correctly', () => {
      render(<FloatingCLI testMode />);
      
      // Previous button should be disabled on first step
      const prevButton = screen.getByTitle('Previous Step');
      expect(prevButton).toBeDisabled();
      
      // Navigate to last step
      const nextButton = screen.getByTitle('Next Step');
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }
      
      // Next button should be disabled on last step
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Content Display Workflow', () => {
    it('displays step-specific content correctly', () => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );

      // Check initial content
      expect(screen.getByText('Step 1: Write Code')).toBeInTheDocument();
      expect(screen.getByText('vim src/components/Feature.tsx')).toBeInTheDocument();

      // Navigate to step 2
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Step 2: Run Unit & Functional Tests')).toBeInTheDocument();
      expect(screen.getByText('npm test -- --coverage')).toBeInTheDocument();
    });

    it('shows progress bar updates', () => {
      render(<FloatingCLI testMode />);
      
      // Initial progress
      expect(screen.getByText('1 / 6')).toBeInTheDocument();
      
      // Navigate to middle step
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      expect(screen.getByText('3 / 6')).toBeInTheDocument();
    });
  });
}); 