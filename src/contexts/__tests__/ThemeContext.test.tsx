import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Test component to access context
const TestComponent = () => {
  const { theme, setTheme, effectiveTheme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="effective-theme">{effectiveTheme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
  });

  it('loads saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('sets theme to light when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setLightButton = screen.getByText('Set Light');
    fireEvent.click(setLightButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
  });

  it('sets theme to dark when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByText('Set Dark');
    fireEvent.click(setDarkButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
  });

  it('sets theme to system when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setSystemButton = screen.getByText('Set System');
    fireEvent.click(setSystemButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('toggles theme correctly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle');
    
    // First click: system -> light
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    
    // Second click: light -> dark
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    
    // Third click: dark -> light
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('saves theme to localStorage when theme changes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setLightButton = screen.getByText('Set Light');
    fireEvent.click(setLightButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('applies theme classes to document element', () => {
    const mockRemove = vi.fn();
    const mockAdd = vi.fn();
    
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          remove: mockRemove,
          add: mockAdd,
        },
      },
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setLightButton = screen.getByText('Set Light');
    fireEvent.click(setLightButton);

    expect(mockRemove).toHaveBeenCalledWith('light', 'dark');
    expect(mockAdd).toHaveBeenCalledWith('light');
  });

  it('handles system theme preference', () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // prefers dark
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setSystemButton = screen.getByText('Set System');
    fireEvent.click(setSystemButton);

    expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
  });

  it('throws error when useTheme is used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
}); 