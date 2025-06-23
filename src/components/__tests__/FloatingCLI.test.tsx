import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FloatingCLI from '../FloatingCLI';
import * as ThemeContext from '@/contexts/ThemeContext';

// Mock framer-motion with simplified implementation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Terminal: () => <div data-testid="terminal-icon">Terminal</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Code: () => <div data-testid="code-icon">Code</div>,
  TestTube: () => <div data-testid="test-tube-icon">TestTube</div>,
  Rocket: () => <div data-testid="rocket-icon">Rocket</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Minus: () => <div data-testid="minus-icon">Minus</div>,
  Maximize2: () => <div data-testid="maximize-icon">Maximize2</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
}));

describe('FloatingCLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(ThemeContext, 'useTheme').mockReturnValue({ theme: 'dark' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders in test mode', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByText('Development Workflow')).toBeInTheDocument();
  });

  it('shows first step by default', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByText('Step 1: Write Code')).toBeInTheDocument();
  });

  it('displays command line', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByText('$')).toBeInTheDocument();
    const commandElements = screen.getAllByText('vim src/components/Feature.tsx');
    expect(commandElements.length).toBeGreaterThan(0);
  });

  it('shows progress bar', () => {
    render(<FloatingCLI testMode />);
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('displays step counter', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByText('1 / 6')).toBeInTheDocument();
  });

  it('handles window minimize', () => {
    render(<FloatingCLI testMode />);
    const minimizeButton = screen.getByTitle('Minimize');
    fireEvent.click(minimizeButton);
    
    expect(screen.getByTitle('Restore Developer Workflow')).toBeInTheDocument();
  });

  it('handles window maximize', () => {
    render(<FloatingCLI testMode />);
    const maximizeButton = screen.getByTitle('Maximize');
    fireEvent.click(maximizeButton);
    
    // Should still be visible but maximized
    expect(screen.getByText('Development Workflow')).toBeInTheDocument();
  });

  it('handles window close', () => {
    render(<FloatingCLI testMode />);
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    
    expect(screen.getByTitle('Reopen Developer Workflow')).toBeInTheDocument();
  });

  it('handles reopen from closed state', () => {
    render(<FloatingCLI testMode />);
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    
    const reopenButton = screen.getByTitle('Reopen Developer Workflow');
    fireEvent.click(reopenButton);
    
    expect(screen.getByText('Development Workflow')).toBeInTheDocument();
  });

  it('handles reopen from minimized state', () => {
    render(<FloatingCLI testMode />);
    const minimizeButton = screen.getByTitle('Minimize');
    fireEvent.click(minimizeButton);
    
    const restoreButton = screen.getByTitle('Restore Developer Workflow');
    fireEvent.click(restoreButton);
    
    expect(screen.getByText('Development Workflow')).toBeInTheDocument();
  });

  it('navigates to next step', () => {
    render(<FloatingCLI testMode />);
    const nextButton = screen.getByTitle('Next Step');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Step 2: Run Unit & Functional Tests')).toBeInTheDocument();
    expect(screen.getByText('2 / 6')).toBeInTheDocument();
  });

  it('navigates to previous step', () => {
    render(<FloatingCLI testMode />);
    const nextButton = screen.getByTitle('Next Step');
    fireEvent.click(nextButton);
    
    const prevButton = screen.getByTitle('Previous Step');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('Step 1: Write Code')).toBeInTheDocument();
    expect(screen.getByText('1 / 6')).toBeInTheDocument();
  });

  it('disables navigation at boundaries', () => {
    render(<FloatingCLI testMode />);
    
    const prevButton = screen.getByTitle('Previous Step');
    expect(prevButton).toBeDisabled();
    
    // Navigate to last step
    const nextButton = screen.getByTitle('Next Step');
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton);
    }
    
    expect(nextButton).toBeDisabled();
  });

  it('toggles auto-play', () => {
    render(<FloatingCLI testMode />);
    const autoPlayButton = screen.getByTitle('Pause Auto-play');
    fireEvent.click(autoPlayButton);
    
    expect(screen.getByTitle('Resume Auto-play')).toBeInTheDocument();
  });

  it('displays correct step content', () => {
    render(<FloatingCLI testMode />);
    // Check first step - use getAllByText since we now have both mobile and desktop versions
    const commandElements = screen.getAllByText('vim src/components/Feature.tsx');
    expect(commandElements.length).toBeGreaterThan(0);
    
    // Navigate to second step
    const nextButton = screen.getByTitle('Next Step');
    fireEvent.click(nextButton);
    
    const secondCommandElements = screen.getAllByText('npm test -- --coverage');
    expect(secondCommandElements.length).toBeGreaterThan(0);
    
    // Check for a substring from the output in both mobile and desktop
    const outputElements = screen.getAllByText((content) => content.includes('vitest --coverage'));
    expect(outputElements.length).toBeGreaterThan(0);
  });

  it('shows status indicators', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('displays step icons', () => {
    render(<FloatingCLI testMode />);
    expect(screen.getByTestId('code-icon')).toBeInTheDocument();
  });

  it('handles all steps navigation', () => {
    render(<FloatingCLI testMode />);
    const nextButton = screen.getByTitle('Next Step');
    
    const expectedSteps = [
      'Write Code',
      'Run Unit & Functional Tests', 
      '1 FT Failed',
      'Write Some Other Code',
      'Now All Tests Pass',
      'Deploy & Check Coverage'
    ];
    
    expectedSteps.forEach((step, index) => {
      if (index > 0) {
        fireEvent.click(nextButton);
      }
      expect(screen.getByText(new RegExp(step))).toBeInTheDocument();
    });
  });

  it('maintains state during window operations', () => {
    render(<FloatingCLI testMode />);
    
    // Navigate to step 2
    const nextButton = screen.getByTitle('Next Step');
    fireEvent.click(nextButton);
    
    // Minimize and restore
    const minimizeButton = screen.getByTitle('Minimize');
    fireEvent.click(minimizeButton);
    
    const restoreButton = screen.getByTitle('Restore Developer Workflow');
    fireEvent.click(restoreButton);
    
    // Should still be on step 2
    expect(screen.getByText('Step 2: Run Unit & Functional Tests')).toBeInTheDocument();
  });
}); 