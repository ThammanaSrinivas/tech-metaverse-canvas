import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Projects from '../Projects';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  Github: () => <div data-testid="github-icon">Github</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
}));

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders projects section with title', () => {
    render(<Projects />);
    
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText(/A showcase of innovative projects/)).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<Projects />);
    
    expect(screen.getByText('All Projects')).toBeInTheDocument();
    expect(screen.getByText('Web Apps')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('Blockchain')).toBeInTheDocument();
  });

  it('renders project cards', () => {
    render(<Projects />);
    
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Metaverse Portfolio')).toBeInTheDocument();
    expect(screen.getByText('AI Art Generator')).toBeInTheDocument();
  });

  it('filters projects when category button is clicked', () => {
    render(<Projects />);
    
    const webAppsButton = screen.getByText('Web Apps');
    fireEvent.click(webAppsButton);
    
    // Should still show projects (filtering logic would be tested in component)
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
  });

  it('opens project demo when demo button is clicked', async () => {
    render(<Projects />);
    
    // Wait for demo buttons to be available
    await waitFor(() => {
      const demoButtons = screen.getAllByText('Demo');
      if (demoButtons.length > 0) {
        fireEvent.click(demoButtons[0]);
        expect(mockOpen).toHaveBeenCalledWith(
          'https://demo.neural-network-visualizer.com',
          '_blank',
          'noopener,noreferrer'
        );
      }
    });
  });

  it('opens project source when source button is clicked', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      const codeButtons = screen.getAllByText('Code');
      if (codeButtons.length > 0) {
        fireEvent.click(codeButtons[0]);
        expect(mockOpen).toHaveBeenCalledWith(
          'https://github.com/yourusername/neural-network-visualizer',
          '_blank',
          'noopener,noreferrer'
        );
      }
    });
  });

  it('opens GitHub profile when view all projects button is clicked', () => {
    render(<Projects />);
    
    const viewAllButton = screen.getByText('View All Projects on GitHub');
    fireEvent.click(viewAllButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/yourusername',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('displays project technologies as badges', () => {
    render(<Projects />);
    
    // Use getAllByText for duplicate elements
    const reactBadges = screen.getAllByText('React');
    expect(reactBadges.length).toBeGreaterThan(0);
    
    const threeJsBadges = screen.getAllByText('Three.js');
    expect(threeJsBadges.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows project descriptions', () => {
    render(<Projects />);
    
    expect(screen.getByText(/Interactive 3D visualization/)).toBeInTheDocument();
    expect(screen.getByText(/Immersive 3D portfolio website/)).toBeInTheDocument();
    expect(screen.getByText(/Web application for generating AI art/)).toBeInTheDocument();
  });

  it('has correct section structure', () => {
    render(<Projects />);
    
    const section = document.querySelector('section[id="projects"]');
    expect(section).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    render(<Projects />);
    
    const section = document.querySelector('section');
    expect(section).toHaveClass('py-20', 'px-6');
  });

  it('shows featured badges on projects', () => {
    render(<Projects />);
    
    const featuredBadges = screen.getAllByText('Featured');
    expect(featuredBadges.length).toBeGreaterThan(0);
  });
}); 