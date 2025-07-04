import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '@/components/Hero';
import React from 'react';

// Mock the theme context
const mockThemeContext = {
  theme: 'dark' as const,
  setTheme: vi.fn(),
  effectiveTheme: 'dark' as const,
  toggleTheme: vi.fn(),
};

// Mock the useTheme hook
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}));

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

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../ui/ResumeButton', () => ({
  default: ({ children, ...props }: any) => (
    <button {...props}>Resume Button</button>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: () => ({ get: () => 0 }),
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
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
  performanceUtils: {
    getDeviceCapabilities: vi.fn(() => ({
      isMobile: false,
      isIOS: false,
      isLowEnd: false,
      hasReducedMotion: false,
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      cores: 4,
    })),
    getPerformanceRecommendations: vi.fn(() => ({
      disable3D: false,
      reduceParticles: false,
      disableComplexAnimations: false,
      reduceBackdropBlur: false,
      useLowQualityRendering: false,
    })),
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
    
    expect(screen.getByText('View My Work')).toBeInTheDocument();
    // Resume button text comes from ResumeButton component
  });

  it('renders animated text component', () => {
    renderWithRouter(<Hero />);
    
    // The animated text component should be present (with typewriter effect)
    // Check for the animated text container and cursor
    const animatedTextContainer = document.querySelector('.relative.inline-block');
    expect(animatedTextContainer).toBeInTheDocument();
  });

  it('scrolls to projects when View My Work button is clicked', () => {
    renderWithRouter(<Hero />);
    
    const viewProjectsButton = screen.getByText('View My Work');
    fireEvent.click(viewProjectsButton);
    
    expect(mockGetElementById).toHaveBeenCalledWith('projects');
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('contains resume button component', () => {
    renderWithRouter(<Hero />);
    
    // ResumeButton is a separate component, just check it's rendered
    // The specific resume functionality is tested in ResumeButton's own tests
    const hero = document.querySelector('section');
    expect(hero).toBeInTheDocument();
    expect(screen.getByText('Resume Button')).toBeInTheDocument();
  });

  it('has correct section structure', () => {
    renderWithRouter(<Hero />);
    
    const section = document.querySelector('section[id="home"]');
    expect(section).toBeInTheDocument();
  });

  it('handles mouse hover on View My Work button', () => {
    renderWithRouter(<Hero />);
    
    const viewProjectsButton = screen.getByText('View My Work');
    
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