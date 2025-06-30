import React from 'react';
import { Button } from './button';
import { FileText } from 'lucide-react';

const RESUME_URL = 'https://drive.google.com/file/d/1dl6EqMYEaTCljbrqoKPbaH48pccvPxcX/view?usp=sharing';

interface ResumeButtonProps {
  className?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
}

const ResumeButton: React.FC<ResumeButtonProps> = ({ className = '', size = 'lg' }) => (
  <Button
    variant="outline"
    size={size}
    onClick={() => window.open(RESUME_URL, '_blank')}
    className={`border-primary text-foreground hover:bg-primary/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center gap-2 w-full sm:w-auto ${className}`}
  >
    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
    View Resume
  </Button>
);

export default ResumeButton; 