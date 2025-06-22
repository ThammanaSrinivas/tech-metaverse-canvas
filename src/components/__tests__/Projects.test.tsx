import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
window.open = mockOpen;

describe('Projects', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders projects section with title', () => {
    render(<Projects />);
    
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText(/A showcase of innovative projects/)).toBeInTheDocument();
  });

  it('renders project cards', () => {
    render(<Projects />);
    
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Metaverse Portfolio')).toBeInTheDocument();
    expect(screen.getByText('AI Art Generator')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AR Shopping Experience')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Voting System')).toBeInTheDocument();
  });

  it('opens project demo when demo button is clicked', () => {
    render(<Projects />);
    
    const demoButtons = screen.getAllByText('Demo');
    fireEvent.click(demoButtons[0]);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://demo.neural-network-visualizer.com',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens project source when source button is clicked', () => {
    render(<Projects />);
    
    const codeButtons = screen.getAllByText('Code');
    fireEvent.click(codeButtons[0]);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/yourusername/neural-network-visualizer',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens GitHub profile when view all projects button is clicked', () => {
    render(<Projects />);
    
    const viewAllButton = screen.getByText('View All Projects on GitHub');
    fireEvent.click(viewAllButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/ThammanaSrinivas',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('displays project technologies as badges', () => {
    render(<Projects />);
    
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Three.js').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WebGL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Next.js').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R3F').length).toBeGreaterThan(0);
  });

  it('shows project descriptions', () => {
    render(<Projects />);
    
    expect(screen.getByText(/Interactive 3D visualization of neural networks/)).toBeInTheDocument();
    expect(screen.getByText(/Immersive 3D portfolio website/)).toBeInTheDocument();
    expect(screen.getByText(/Web application for generating AI art/)).toBeInTheDocument();
  });

  it('has correct section structure', () => {
    render(<Projects />);
    
    const section = screen.getByRole('region', { hidden: true });
    expect(section).toHaveAttribute('id', 'projects');
  });

  it('renders with proper styling classes', () => {
    render(<Projects />);
    
    const section = screen.getByRole('region', { hidden: true });
    expect(section).toHaveClass('py-20', 'px-6');
  });

  it('shows featured badges on projects', () => {
    render(<Projects />);
    
    const featuredBadges = screen.getAllByText('Featured');
    expect(featuredBadges.length).toBeGreaterThan(0);
  });
}); 