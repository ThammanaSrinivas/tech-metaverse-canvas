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
    
    expect(screen.getByText('Random Android Project')).toBeInTheDocument();
    expect(screen.getByText('Tech Metaverse Canvas')).toBeInTheDocument();
    expect(screen.getByText('Habitica MCP Server')).toBeInTheDocument();
    expect(screen.getByText('Spring MVC Practice CRUD RESTful API')).toBeInTheDocument();
  });

  it('opens project source when source button is clicked', () => {
    render(<Projects />);
    
    const sourceButtons = screen.getAllByText('Code');
    fireEvent.click(sourceButtons[0]);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/randomAndroidProject/randomAndroidProject',
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
    
    expect(screen.getAllByText('Android').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Java').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Kotlin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('XML').length).toBeGreaterThan(0);
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
  });

  it('shows project descriptions', () => {
    render(<Projects />);
    
    expect(screen.getByText(/Android application demonstrating modern Android development practices/)).toBeInTheDocument();
    expect(screen.getByText(/Immersive 3D portfolio website with virtual reality support/)).toBeInTheDocument();
    expect(screen.getByText(/Server implementation for Habitica integration/)).toBeInTheDocument();
    expect(screen.getByText(/Complete CRUD operations with RESTful API design/)).toBeInTheDocument();
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