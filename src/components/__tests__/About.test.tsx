import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '@/components/About';

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
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
  });

  it('renders journey and philosophy cards', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('My Journey')).toBeInTheDocument();
    expect(screen.getByText('Philosophy')).toBeInTheDocument();
  });

  it('displays all skill categories', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('Frameworks & Libraries')).toBeInTheDocument();
    expect(screen.getByText('Tools & Platforms')).toBeInTheDocument();
    expect(screen.getByText('Databases')).toBeInTheDocument();
    expect(screen.getByText('Concepts & Expertise')).toBeInTheDocument();
  });

  it('displays programming language skills', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('C/C++')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('HTML/CSS')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('displays framework skills', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('Spring MVC')).toBeInTheDocument();
    expect(screen.getByText('Socket.IO')).toBeInTheDocument();
  });

  it('displays tool and platform skills', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('Git')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('Kafka')).toBeInTheDocument();
    expect(screen.getByText('REST APIs')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
  });

  it('displays database skills', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('MySQL')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
  });

  it('displays concept and expertise skills', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('System Design')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Development')).toBeInTheDocument();
    expect(screen.getByText('WebSockets')).toBeInTheDocument();
  });

  it('displays skill levels', () => {
    renderWithRouter(<About />);
    
    const advancedLevels = screen.getAllByText('Advanced');
    const intermediateLevels = screen.getAllByText('Intermediate');
    
    expect(advancedLevels.length).toBeGreaterThan(0);
    expect(intermediateLevels.length).toBeGreaterThan(0);
  });

  it('renders skill icons', () => {
    renderWithRouter(<About />);
    
    // Check for emoji icons
    expect(screen.getByText('🐍')).toBeInTheDocument(); // Python
    expect(screen.getByText('☕')).toBeInTheDocument(); // Java
    expect(screen.getByText('🍃')).toBeInTheDocument(); // Spring Boot
    expect(screen.getByText('🐳')).toBeInTheDocument(); // Docker
    expect(screen.getByText('🐬')).toBeInTheDocument(); // MySQL
  });

  it('has correct section structure', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByRole('region', { hidden: true }) || document.querySelector('section');
    expect(section).toHaveAttribute('id', 'about');
  });
}); 