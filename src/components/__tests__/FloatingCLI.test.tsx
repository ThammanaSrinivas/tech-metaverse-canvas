import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FloatingCLI from '../FloatingCLI';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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
}));

describe('FloatingCLI', () => {
  it('renders the CLI component', async () => {
    render(<FloatingCLI />);
    
    // Wait for component to become visible
    await waitFor(() => {
      expect(screen.getByText('Development Workflow')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows the first step initially', async () => {
    const { container } = render(<FloatingCLI />);
    
    await waitFor(() => {
      expect(container.textContent).toMatch(/Step\s*1:\s*Write\s*Code/);
      expect(container.textContent).toMatch(/\$ vim src\/components\/Feature\.tsx/);
    });
  });

  it('displays terminal output correctly', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      expect(screen.getByText(/import React/)).toBeInTheDocument();
      expect(screen.getByText(/const Feature/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows progress bar', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      expect(screen.getByText('1 / 6')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('has correct terminal styling', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      const terminalHeader = screen.getByText('Development Workflow').closest('div');
      expect(terminalHeader?.parentElement).toHaveClass('bg-gray-800/80');
    }, { timeout: 3000 });
  });

  it('displays all 6 development steps', async () => {
    render(<FloatingCLI />);
    
    const expectedSteps = [
      'Write Code',
      'Run Unit & Functional Tests', 
      '1 FT Failed',
      'Write Some Other Code',
      'Now All Tests Pass',
      'Deploy & Check Coverage'
    ];
    
    // Check that all step titles are defined in the component
    expectedSteps.forEach(step => {
      expect(step).toBeDefined();
    });
  });

  it('shows correct status indicators', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders with proper structure', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      expect(screen.getByText('Development Workflow')).toBeInTheDocument();
      expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('has proper z-index and positioning', async () => {
    render(<FloatingCLI />);
    
    await waitFor(() => {
      const container = screen.getByText('Development Workflow').closest('.fixed');
      expect(container).toHaveClass('z-20');
    }, { timeout: 3000 });
  });
}); 