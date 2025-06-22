import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from '@/components/Contact';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

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

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText("Let's Connect")).toBeInTheDocument();
    expect(screen.getByText('Send a Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    renderWithRouter(<Contact />);
    
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    renderWithRouter(<Contact />);
    
    const submitButton = screen.getByText('Send Message');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive",
      });
    });
  });

  it('submits form with valid data', async () => {
    renderWithRouter(<Contact />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'This is a test message with more than 10 characters.' } });
    
    const submitButton = screen.getByText('Send Message');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon!",
      });
    });
  });

  it('opens resume link when download button is clicked', () => {
    renderWithRouter(<Contact />);
    
    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://drive.google.com/drive/folders/1IBzvupAZQm3L6FZDAeirg0MpKIThNcQS',
      '_blank'
    );
  });

  it('validates email format', async () => {
    renderWithRouter(<Contact />);
    
    // Fill form with invalid email
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'This is a test message with more than 10 characters.' } });
    
    const submitButton = screen.getByText('Send Message');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    });
  });

  it('validates message length', async () => {
    renderWithRouter(<Contact />);
    
    // Fill form with short message
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Short' } });
    
    const submitButton = screen.getByText('Send Message');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Invalid Message",
        description: "Please enter a message with at least 10 characters.",
        variant: "destructive",
      });
    });
  });
}); 