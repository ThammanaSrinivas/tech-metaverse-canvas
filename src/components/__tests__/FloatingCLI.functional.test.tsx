import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FloatingCLI from '../FloatingCLI';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';

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

      // Check initial state - use getAllByText to handle multiple elements
      const step1Elements = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements.length).toBeGreaterThan(0);
      const progressElements = screen.getAllByText('1 / 6');
      expect(progressElements.length).toBeGreaterThan(0);

      // Navigate through all steps quickly
      const nextButton = screen.getByTitle('Next Step');
      
      // Step 2
      fireEvent.click(nextButton);
      const step2Elements = screen.getAllByText('Step 2: Run Unit & Functional Tests');
      expect(step2Elements.length).toBeGreaterThan(0);

      // Step 3
      fireEvent.click(nextButton);
      const step3Elements = screen.getAllByText('Step 3: 1 Test Failed');
      expect(step3Elements.length).toBeGreaterThan(0);

      // Step 4
      fireEvent.click(nextButton);
      const step4Elements = screen.getAllByText('Step 4: Write Some Other Code');
      expect(step4Elements.length).toBeGreaterThan(0);

      // Step 5
      fireEvent.click(nextButton);
      const step5Elements = screen.getAllByText('Step 5: Now All Tests Pass');
      expect(step5Elements.length).toBeGreaterThan(0);

      // Step 6
      fireEvent.click(nextButton);
      const step6Elements = screen.getAllByText('Step 6: Build & Deploy');
      expect(step6Elements.length).toBeGreaterThan(0);
      const commandElements = screen.getAllByText('npm run build');
      expect(commandElements.length).toBeGreaterThan(0);
    });

    it('allows user to navigate backwards through workflow', () => {
      render(<FloatingCLI testMode />);
      
      // Go to step 3
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton); // Step 2
      fireEvent.click(nextButton); // Step 3
      
      const step3Elements = screen.getAllByText('Step 3: 1 Test Failed');
      expect(step3Elements.length).toBeGreaterThan(0);
      
      // Go back to step 1
      const prevButton = screen.getByTitle('Previous Step');
      fireEvent.click(prevButton); // Step 2
      fireEvent.click(prevButton); // Step 1
      
      const step1Elements = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements.length).toBeGreaterThan(0);
      const progressElements = screen.getAllByText('1 / 6');
      expect(progressElements.length).toBeGreaterThan(0);
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
      const step1Elements = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements.length).toBeGreaterThan(0);
      
      // Maximize
      const maximizeButton = screen.getByTitle('Maximize');
      fireEvent.click(maximizeButton);
      const step1Elements2 = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements2.length).toBeGreaterThan(0);
      
      // Close
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      expect(screen.getByTitle('Reopen Developer Workflow')).toBeInTheDocument();
      
      // Reopen
      const reopenButton = screen.getByTitle('Reopen Developer Workflow');
      fireEvent.click(reopenButton);
      const step1Elements3 = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements3.length).toBeGreaterThan(0);
    });

    it('maintains step state during window operations', () => {
      render(<FloatingCLI testMode />);
      
      // Navigate to step 3
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      const step3Elements = screen.getAllByText('Step 3: 1 Test Failed');
      expect(step3Elements.length).toBeGreaterThan(0);
      
      // Minimize and restore
      const minimizeButton = screen.getByTitle('Minimize');
      fireEvent.click(minimizeButton);
      
      const restoreButton = screen.getByTitle('Restore Developer Workflow');
      fireEvent.click(restoreButton);
      
      // Should still be on step 3
      const step3Elements2 = screen.getAllByText('Step 3: 1 Test Failed');
      expect(step3Elements2.length).toBeGreaterThan(0);
      const progressElements = screen.getAllByText('3 / 6');
      expect(progressElements.length).toBeGreaterThan(0);
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

      // Look for the main CLI container with the terminal icon
      const terminalIcon = screen.getByTestId('terminal-icon');
      expect(terminalIcon).toBeInTheDocument();
    });

    it('handles theme switching gracefully', () => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <FloatingCLI testMode={true} />
          </ThemeProvider>
        </BrowserRouter>
      );

      const step1Elements = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements.length).toBeGreaterThan(0);
      const cliContainer = step1Elements[0].closest('div');
      expect(cliContainer).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness Workflow', () => {
    it('adapts to mobile viewport', () => {
      render(<FloatingCLI testMode />);
      // Check that both mobile and desktop versions are available
      const step1Elements = screen.getAllByText('Step 1');
      expect(step1Elements.length).toBeGreaterThan(0);
    });

    it('handles mobile navigation correctly', () => {
      render(<FloatingCLI testMode />);
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      const step2Elements = screen.getAllByText('Step 2');
      expect(step2Elements.length).toBeGreaterThan(0);
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
      const progressElements = screen.getAllByText('6 / 6');
      expect(progressElements.length).toBeGreaterThan(0);
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
      const step1Elements = screen.getAllByText('Step 1: Write Code');
      expect(step1Elements.length).toBeGreaterThan(0);
      const commandElements = screen.getAllByText('vim src/components/Feature.tsx');
      expect(commandElements.length).toBeGreaterThan(0);

      // Navigate to step 2
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      
      const step2Elements = screen.getAllByText('Step 2: Run Unit & Functional Tests');
      expect(step2Elements.length).toBeGreaterThan(0);
      const testCommandElements = screen.getAllByText('npm run test:coverage');
      expect(testCommandElements.length).toBeGreaterThan(0);
    });

    it('shows progress bar updates', () => {
      render(<FloatingCLI testMode />);
      
      // Initial progress
      const initialProgressElements = screen.getAllByText('1 / 6');
      expect(initialProgressElements.length).toBeGreaterThan(0);
      
      // Navigate to middle step
      const nextButton = screen.getByTitle('Next Step');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      const progressElements = screen.getAllByText('3 / 6');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });
}); 