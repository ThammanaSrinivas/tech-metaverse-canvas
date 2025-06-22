import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Contact from '../Contact';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Linkedin: () => <div data-testid="linkedin-icon">Linkedin</div>,
  Github: () => <div data-testid="github-icon">Github</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  Send: () => <div data-testid="send-icon">Send</div>,
}));

// Mock use-toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact section with title', () => {
    render(<Contact />);
    
    expect(screen.getByText("Let's Connect")).toBeInTheDocument();
    expect(screen.getByText(/Ready to bring your ideas to life/)).toBeInTheDocument();
  });

  it('renders contact form', () => {
    render(<Contact />);
    
    expect(screen.getByText('Send a Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Contact />);
    
    const emailElements = screen.getAllByText('Email');
    expect(emailElements.length).toBeGreaterThan(0);
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('View Resume')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    const { container } = render(<Contact />);
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const subjectInput = screen.getByLabelText('Subject');
    const messageInput = screen.getByLabelText('Message');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive"
      });
    });
  });

  it('validates email format', async () => {
    const { container } = render(<Contact />);
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const subjectInput = screen.getByLabelText('Subject');
    const messageInput = screen.getByLabelText('Message');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
    });
  });

  it('submits form with valid data', async () => {
    render(<Contact />);
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const subjectInput = screen.getByLabelText('Subject');
    const messageInput = screen.getByLabelText('Message');
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Fill form with valid data
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon!",
      });
    });
  });

  it('opens resume link when download button is clicked', async () => {
    render(<Contact />);
    const downloadButton = screen.getByText('View Resume');
    fireEvent.click(downloadButton);
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing',
        '_blank'
      );
    });
  });

  it('opens social links when clicked', () => {
    render(<Contact />);
    
    const linkedinLink = screen.getByText('LinkedIn').closest('a');
    const githubLink = screen.getByText('GitHub').closest('a');
    
    if (linkedinLink) {
      fireEvent.click(linkedinLink);
      expect(mockOpen).toHaveBeenCalledWith('https://linkedin.com/in/yourusername', '_blank');
    }
    
    if (githubLink) {
      fireEvent.click(githubLink);
      expect(mockOpen).toHaveBeenCalledWith('https://github.com/yourusername', '_blank');
    }
  });

  it('has correct section structure', () => {
    render(<Contact />);
    
    const section = document.querySelector('section[id="contact"]');
    expect(section).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    render(<Contact />);
    
    const section = document.querySelector('section');
    expect(section).toHaveClass('py-20', 'px-6');
  });
}); 