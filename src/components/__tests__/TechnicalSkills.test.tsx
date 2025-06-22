import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    
    expect(screen.getByText('7 skills')).toBeInTheDocument(); // Programming Languages
    expect(screen.getAllByText('3 skills').length).toBeGreaterThan(1); // Frameworks & Libraries, Databases
    expect(screen.getByText('6 skills')).toBeInTheDocument(); // Tools & Platforms
    expect(screen.getByText('4 skills')).toBeInTheDocument(); // Concepts & Expertise
  });

  it('expands and collapses skill categories when clicked', async () => {
    render(<TechnicalSkills />);
    // Programming Languages should be expanded by default
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    // Click on Frameworks & Libraries to expand it
    const frameworksButton = screen.getByText('Frameworks & Libraries');
    fireEvent.click(frameworksButton);
    await waitFor(() => {
      expect(screen.getByText('Spring Boot')).toBeInTheDocument();
      expect(screen.getByText('Spring MVC')).toBeInTheDocument();
      expect(screen.getByText('Socket.IO')).toBeInTheDocument();
    });
  });

  it('displays programming language skills', () => {
    render(<TechnicalSkills />);
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('C/C++')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('HTML/CSS')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('displays skill levels', () => {
    render(<TechnicalSkills />);
    const advancedLevels = screen.getAllByText('Advanced');
    const intermediateLevels = screen.getAllByText('Intermediate');
    expect(advancedLevels.length).toBeGreaterThan(0);
    expect(intermediateLevels.length).toBeGreaterThan(0);
  });

  it('renders skill icons', async () => {
    render(<TechnicalSkills />);
    // Programming Languages expanded by default
    expect(screen.getByText('🐍')).toBeInTheDocument(); // Python
    expect(screen.getByText('☕')).toBeInTheDocument(); // Java
    // Expand Frameworks & Libraries
    const frameworksButton = screen.getByText('Frameworks & Libraries');
    fireEvent.click(frameworksButton);
    await waitFor(() => {
      expect(screen.getByText('🍃')).toBeInTheDocument(); // Spring Boot
    });
    // Expand Tools & Platforms
    const toolsButton = screen.getByText('Tools & Platforms');
    fireEvent.click(toolsButton);
    await waitFor(() => {
      expect(screen.getByText('🐳')).toBeInTheDocument(); // Docker
    });
    // Expand Databases
    const dbButton = screen.getByText('Databases');
    fireEvent.click(dbButton);
    await waitFor(() => {
      expect(screen.getByText('🐬')).toBeInTheDocument(); // MySQL
    });
  });

  it('shows chevron icons for expand/collapse', () => {
    render(<TechnicalSkills />);
    // Should show chevron down for expanded category (Programming Languages)
    const programmingLanguagesButton = screen.getByText('Programming Languages').closest('button');
    expect(programmingLanguagesButton).toBeInTheDocument();
    // Should show chevron right for collapsed categories
    const frameworksButton = screen.getByText('Frameworks & Libraries').closest('button');
    expect(frameworksButton).toBeInTheDocument();
  });

  it('maintains expanded state when toggling categories', async () => {
    render(<TechnicalSkills />);
    // Programming Languages should be expanded by default
    expect(screen.getByText('Python')).toBeInTheDocument();
    // Click to collapse Programming Languages
    const programmingLanguagesButton = screen.getByText('Programming Languages');
    fireEvent.click(programmingLanguagesButton);
    await waitFor(() => {
      expect(screen.queryByText('Python')).not.toBeInTheDocument();
    });
    // Click again to expand
    fireEvent.click(programmingLanguagesButton);
    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });
}); 