import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../About';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('About', () => {
  it('renders about section with title', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('About Me')).toBeInTheDocument();
  });

  it('renders journey and philosophy cards', () => {
    renderWithRouter(<About />);
    
    // "My Journey" appears in both button and content, so use getAllByText
    expect(screen.getAllByText('My Journey')).toHaveLength(2);
    expect(screen.getByText('Philosophy')).toBeInTheDocument();
  });

  it('displays core values section when clicked', () => {
    renderWithRouter(<About />);
    
    // Core Values tab button should be present
    const coreValuesTab = screen.getByText('Core Values');
    expect(coreValuesTab).toBeInTheDocument();
    
    // Click on the Core Values tab
    fireEvent.click(coreValuesTab);
    
    // Now the core values content should be visible
    expect(screen.getByText('Innovation')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
  });

  it('displays expertise areas when clicked', () => {
    renderWithRouter(<About />);
    
    // Expertise tab button should be present 
    const expertiseTab = screen.getByText('Expertise');
    expect(expertiseTab).toBeInTheDocument();
    
    // Click on the Expertise tab
    fireEvent.click(expertiseTab);
    
    // Now the expertise content should be visible
    expect(screen.getByText('System Design')).toBeInTheDocument();
    expect(screen.getByText('Cloud Architecture')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Development')).toBeInTheDocument();
    expect(screen.getByText('Performance Optimization')).toBeInTheDocument();
  });

  it('displays about description', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Software Engineer with 3 years of experience/)).toBeInTheDocument();
  });

  it('displays journey content', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Started as a computer science enthusiast/)).toBeInTheDocument();
  });

  it('displays philosophy content when clicked', () => {
    renderWithRouter(<About />);
    
    // Click on the Philosophy tab
    const philosophyTab = screen.getByText('Philosophy');
    fireEvent.click(philosophyTab);
    
    expect(screen.getByText(/Code is architecture, design is communication/)).toBeInTheDocument();
  });

  it('has correct section structure', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByRole('region', { hidden: true });
    expect(section).toHaveAttribute('id', 'about');
  });
}); 