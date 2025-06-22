import React from 'react';
import { render, screen } from '@testing-library/react';
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
    
    expect(screen.getByText('My Journey')).toBeInTheDocument();
    expect(screen.getByText('Philosophy')).toBeInTheDocument();
  });

  it('displays core values section', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Core Values')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
  });

  it('displays expertise areas', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Expertise Areas')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();
    expect(screen.getByText('Cloud Architecture')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Dev')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('displays about description', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Software Engineer with 3 years of experience/)).toBeInTheDocument();
  });

  it('displays journey content', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Started as a computer science enthusiast/)).toBeInTheDocument();
  });

  it('displays philosophy content', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Code is architecture, design is communication/)).toBeInTheDocument();
  });

  it('displays innovation description', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Embracing cutting-edge technologies/)).toBeInTheDocument();
  });

  it('displays quality description', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Maintaining high standards in code quality/)).toBeInTheDocument();
  });

  it('displays collaboration description', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Working effectively in teams/)).toBeInTheDocument();
  });

  it('has correct section structure', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByRole('region', { hidden: true });
    expect(section).toHaveAttribute('id', 'about');
  });
}); 