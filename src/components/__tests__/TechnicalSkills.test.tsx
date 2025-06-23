import React from 'react';
import { render, screen } from '@testing-library/react';
import TechnicalSkills from '../TechnicalSkills';

describe('TechnicalSkills', () => {
  it('renders technical skills section with title', () => {
    render(<TechnicalSkills />);
    
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText(/A comprehensive overview of my technical expertise/)).toBeInTheDocument();
  });

  it('displays all skill categories', () => {
    render(<TechnicalSkills />);
    
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('Frameworks & Libraries')).toBeInTheDocument();
    expect(screen.getByText('Tools & Platforms')).toBeInTheDocument();
    expect(screen.getByText('Databases')).toBeInTheDocument();
    expect(screen.getByText('Concepts & Expertise')).toBeInTheDocument();
  });

  it('shows skill count badges', () => {
    render(<TechnicalSkills />);
    
    // Check for the main skill count badges that should be visible
    expect(screen.getByText('7 skills')).toBeInTheDocument();
    expect(screen.getAllByText('3 skills').length).toBeGreaterThan(0);
    expect(screen.getByText('6 skills')).toBeInTheDocument();
  });

  it('renders category buttons that are clickable', () => {
    render(<TechnicalSkills />);
    
    const programmingLanguagesButton = screen.getByText('Programming Languages');
    expect(programmingLanguagesButton).toBeInTheDocument();
    expect(programmingLanguagesButton.closest('button')).toBeInTheDocument();
  });

  it('shows SVG icons for expand/collapse', () => {
    render(<TechnicalSkills />);
    
    // Check that SVG elements are present
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(<TechnicalSkills />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-label', 'Technical Skills');
    expect(section).toHaveAttribute('id', 'technical-skills');
  });
}); 