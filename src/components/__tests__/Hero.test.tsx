import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '@/components/Hero';
import React from 'react';

// Mock 3D components that cause ResizeObserver issues
vi.mock('../Scene3D', () => ({
  default: () => <div data-testid="scene3d">Scene3D</div>,
}));

vi.mock('../ParticleEffect', () => ({
  default: () => <div data-testid="particle-effect">ParticleEffect</div>,
}));

vi.mock('../FloatingCLI', () => ({
  default: () => <div data-testid="floating-cli">FloatingCLI</div>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: () => ({ get: () => 0 }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  Mouse: () => <div data-testid="mouse">Mouse</div>,
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  FileText: () => <div data-testid="file-text">FileText</div>,
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  animationUtils: {
    getMousePosition: vi.fn(() => ({ x: 0, y: 0 })),
  },
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Element.prototype.scrollIntoView = mockScrollIntoView;

// Mock getElementById
const mockGetElementById = vi.fn();
document.getElementById = mockGetElementById;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetElementById.mockReturnValue({ scrollIntoView: mockScrollIntoView });
  });

  it('renders hero section with title', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText('Digital Architect')).toBeInTheDocument();
  });

  it('renders hero description', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText(/Crafting immersive digital experiences/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText('View Projects')).toBeInTheDocument();
    expect(screen.getByText('View Resume')).toBeInTheDocument();
  });

  it('renders experience stats', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Full Stack')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('scrolls to projects when View Projects button is clicked', () => {
    renderWithRouter(<Hero />);
    
    const viewProjectsButton = screen.getByText('View Projects');
    fireEvent.click(viewProjectsButton);
    
    expect(mockGetElementById).toHaveBeenCalledWith('projects');
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('opens resume link when Download Resume button is clicked', () => {
    renderWithRouter(<Hero />);
    
    const downloadResumeButton = screen.getByText('View Resume');
    fireEvent.click(downloadResumeButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing',
      '_blank'
    );
  });

  it('has correct section structure', () => {
    renderWithRouter(<Hero />);
    
    const section = document.querySelector('section[id="home"]');
    expect(section).toBeInTheDocument();
  });

  it('handles mouse hover on View Projects button', () => {
    renderWithRouter(<Hero />);
    
    const viewProjectsButton = screen.getByText('View Projects');
    
    fireEvent.mouseEnter(viewProjectsButton);
    fireEvent.mouseLeave(viewProjectsButton);
    
    // Button should still be in document
    expect(viewProjectsButton).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    renderWithRouter(<Hero />);
    
    const section = document.querySelector('section');
    expect(section).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });
}); 