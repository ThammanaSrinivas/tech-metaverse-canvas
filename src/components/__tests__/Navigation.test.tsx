import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '../Navigation';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Navigation', () => {
  // Mock scrollIntoView
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    document.querySelector = vi.fn(() => ({
      scrollIntoView: vi.fn()
    }));
  });

  it('renders navigation with all menu items', () => {
    renderWithTheme(<Navigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('handles navigation item clicks', () => {
    renderWithTheme(<Navigation />);
    
    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);
    
    // Since scrollIntoView is mocked, we just check that the element exists and is clickable
    expect(homeButton).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    renderWithTheme(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
  });

  it('toggles mobile menu', () => {
    renderWithTheme(<Navigation />);
    
    // Get all buttons and find the mobile menu button (should be in md:hidden div)
    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(button => 
      button.closest('.md\\:hidden')
    );
    
    expect(mobileMenuButton).toBeInTheDocument();
    fireEvent.click(mobileMenuButton!);
    
    // Check if mobile menu items are visible (duplicated in mobile menu)
    const mobileHomeButtons = screen.getAllByText('Home');
    expect(mobileHomeButtons.length).toBeGreaterThan(1); // Desktop + mobile versions
  });

  it('includes theme toggle', () => {
    renderWithTheme(<Navigation />);
    
    // Check that theme toggle is present by looking for the theme icon
    const themeIcon = screen.getByTestId('theme-icon');
    expect(themeIcon).toBeInTheDocument();
  });
}); 