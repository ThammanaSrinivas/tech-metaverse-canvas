import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

// Mock the theme context
const mockThemeContext = {
  theme: 'dark' as const,
  setTheme: vi.fn(),
  effectiveTheme: 'dark' as const,
  toggleTheme: vi.fn(),
};

// Mock the useTheme hook
vi.mock('@/contexts/ThemeContext', async () => {
  const actual = await vi.importActual('@/contexts/ThemeContext');
  return {
    ...actual,
    useTheme: () => mockThemeContext,
  };
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('displays correct icon for dark theme', () => {
    mockThemeContext.theme = 'dark';
    mockThemeContext.effectiveTheme = 'dark';
    
    render(<ThemeToggle />);
    // Look for the Moon icon (lucide-moon class)
    const moonIconSvg = screen.getByTestId('theme-icon').querySelector('svg');
    expect(moonIconSvg).toHaveClass('lucide-moon');
  });

  it('displays correct icon for light theme', () => {
    mockThemeContext.theme = 'light';
    mockThemeContext.effectiveTheme = 'light';
    
    render(<ThemeToggle />);
    // Look for the Sun icon (lucide-sun class)
    const sunIconSvg = screen.getByTestId('theme-icon').querySelector('svg');
    expect(sunIconSvg).toHaveClass('lucide-sun');
  });

  it('displays correct icon for system theme', () => {
    mockThemeContext.theme = 'system';
    mockThemeContext.effectiveTheme = 'dark';
    
    render(<ThemeToggle />);
    // Look for the Monitor icon (lucide-monitor class)
    const monitorIconSvg = screen.getByTestId('theme-icon').querySelector('svg');
    expect(monitorIconSvg).toHaveClass('lucide-monitor');
  });

  it('has correct styling classes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('border-primary/50', 'bg-background/50', 'backdrop-blur-sm');
  });
}); 