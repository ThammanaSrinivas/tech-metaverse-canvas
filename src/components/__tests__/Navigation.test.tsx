import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '../Navigation';

// Mock window.open
const mockOpen = vi.fn();
window.open = mockOpen;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders navigation with all menu items', () => {
    renderWithTheme(<Navigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders Portfolio text', () => {
    renderWithTheme(<Navigation />);
    
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('opens GitHub when Portfolio is clicked', () => {
    renderWithTheme(<Navigation />);
    
    const portfolioText = screen.getByText('Portfolio');
    fireEvent.click(portfolioText);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/ThammanaSrinivas/tech-metaverse-canvas',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('has correct navigation links', () => {
    renderWithTheme(<Navigation />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const aboutLink = screen.getByText('About').closest('a');
    const technicalSkillsLink = screen.getByText('Technical Skills').closest('a');
    const projectsLink = screen.getByText('Projects').closest('a');
    const contactLink = screen.getByText('Contact').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '#home');
    expect(aboutLink).toHaveAttribute('href', '#about');
    expect(technicalSkillsLink).toHaveAttribute('href', '#technical-skills');
    expect(projectsLink).toHaveAttribute('href', '#projects');
    expect(contactLink).toHaveAttribute('href', '#contact');
  });

  it('renders with proper styling classes', () => {
    renderWithTheme(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
  });
}); 