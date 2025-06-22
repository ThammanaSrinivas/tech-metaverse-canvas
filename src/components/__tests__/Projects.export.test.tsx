import React from 'react';
import { render } from '@testing-library/react';
import Projects from '../Projects';

describe('Projects Export Test', () => {
  it('should import Projects component as default export', () => {
    // This test verifies that the component can be imported correctly
    expect(Projects).toBeDefined();
    expect(typeof Projects).toBe('function');
  });

  it('should render Projects component without errors', () => {
    // This test verifies that the component renders without export/import errors
    const { container } = render(<Projects />);
    expect(container).toBeInTheDocument();
  });
}); 