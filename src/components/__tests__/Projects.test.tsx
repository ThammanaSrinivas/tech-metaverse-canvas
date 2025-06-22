import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from '@/components/Projects';

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders projects section', () => {
    renderWithRouter(<Projects />);
    
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText('All Projects')).toBeInTheDocument();
    expect(screen.getByText('Web Apps')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('displays all projects by default', () => {
    renderWithRouter(<Projects />);
    
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Metaverse Portfolio')).toBeInTheDocument();
    expect(screen.getByText('AI Art Generator')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AR Shopping Experience')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Voting System')).toBeInTheDocument();
  });

  it('filters projects by category', () => {
    renderWithRouter(<Projects />);
    
    // Click on Web Apps filter
    const webAppsButton = screen.getByText('Web Apps');
    fireEvent.click(webAppsButton);
    
    // Should only show web app projects
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
    expect(screen.getByText('AI Art Generator')).toBeInTheDocument();
    expect(screen.queryByText('Metaverse Portfolio')).not.toBeInTheDocument();
  });

  it('shows featured badge on featured projects', () => {
    renderWithRouter(<Projects />);
    
    const featuredBadges = screen.getAllByText('Featured');
    expect(featuredBadges).toHaveLength(3); // 3 featured projects
  });

  it('opens project demo when demo button is clicked', () => {
    renderWithRouter(<Projects />);
    
    // Find the first project card and hover to show buttons
    const projectCards = screen.getAllByText('Neural Network Visualizer');
    const firstCard = projectCards[0].closest('.group');
    
    if (firstCard) {
      fireEvent.mouseEnter(firstCard);
      
      // Wait for demo button to appear and click it
      setTimeout(() => {
        const demoButton = screen.getByText('Demo');
        fireEvent.click(demoButton);
        
        expect(mockOpen).toHaveBeenCalledWith(
          'https://demo.neural-network-visualizer.com',
          '_blank'
        );
      }, 100);
    }
  });

  it('opens GitHub profile when view all projects button is clicked', () => {
    renderWithRouter(<Projects />);
    
    const viewAllButton = screen.getByText('View All Projects on GitHub');
    fireEvent.click(viewAllButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/yourusername',
      '_blank'
    );
  });

  it('displays project technologies as badges', () => {
    renderWithRouter(<Projects />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Three.js')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('WebGL')).toBeInTheDocument();
  });

  it('filters projects correctly for different categories', () => {
    renderWithRouter(<Projects />);
    
    // Test Portfolio filter
    const portfolioButton = screen.getByText('Portfolio');
    fireEvent.click(portfolioButton);
    
    expect(screen.getByText('Metaverse Portfolio')).toBeInTheDocument();
    expect(screen.queryByText('Neural Network Visualizer')).not.toBeInTheDocument();
    
    // Test Dashboard filter
    const dashboardButton = screen.getByText('Dashboards');
    fireEvent.click(dashboardButton);
    
    expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Metaverse Portfolio')).not.toBeInTheDocument();
  });

  it('shows all projects when All Projects filter is selected', () => {
    renderWithRouter(<Projects />);
    
    // First filter by a category
    const webAppsButton = screen.getByText('Web Apps');
    fireEvent.click(webAppsButton);
    
    // Then select All Projects
    const allProjectsButton = screen.getByText('All Projects');
    fireEvent.click(allProjectsButton);
    
    // Should show all projects again
    expect(screen.getByText('Neural Network Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Metaverse Portfolio')).toBeInTheDocument();
    expect(screen.getByText('AI Art Generator')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AR Shopping Experience')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Voting System')).toBeInTheDocument();
  });
}); 