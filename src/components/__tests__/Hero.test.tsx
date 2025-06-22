import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '@/components/Hero';

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
    
    expect(screen.getByText('Digital')).toBeInTheDocument();
    expect(screen.getByText('Architect')).toBeInTheDocument();
  });

  it('renders hero description', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText(/Crafting immersive digital experiences/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText('View Projects')).toBeInTheDocument();
    expect(screen.getByText('Download Resume')).toBeInTheDocument();
  });

  it('renders experience stats', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByText('5+')).toBeInTheDocument();
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
    
    const downloadResumeButton = screen.getByText('Download Resume');
    fireEvent.click(downloadResumeButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing',
      '_blank'
    );
  });

  it('scrolls to projects when scroll indicator is clicked', () => {
    renderWithRouter(<Hero />);
    
    const scrollIndicator = screen.getByRole('button', { name: /scroll/i }) || 
                          document.querySelector('.cursor-pointer');
    
    if (scrollIndicator) {
      fireEvent.click(scrollIndicator);
      expect(mockGetElementById).toHaveBeenCalledWith('projects');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    }
  });

  it('has correct section structure', () => {
    renderWithRouter(<Hero />);
    
    const section = screen.getByRole('region', { hidden: true }) || document.querySelector('section');
    expect(section).toHaveAttribute('id', 'home');
  });

  it('renders scroll indicator', () => {
    renderWithRouter(<Hero />);
    
    // Check for mouse icon (scroll indicator)
    const mouseIcon = document.querySelector('.w-6.h-6.text-primary\\/60');
    expect(mouseIcon).toBeInTheDocument();
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