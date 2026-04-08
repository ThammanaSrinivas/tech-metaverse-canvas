import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useTheme } from '@/contexts/ThemeContext';
import { RESUME_URL } from '@/components/ui/ResumeButton';
import {
  Home,
  User,
  Briefcase,
  Code2,
  FolderKanban,
  Github,
  Mail,
  Sun,
  Moon,
  FileText,
  ExternalLink,
  Activity,
} from 'lucide-react';

const navCommands = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'About', href: '#about', icon: User },
  { name: 'Work Experience', href: '#work-experience', icon: Briefcase },
  { name: 'Technical Skills', href: '#technical-skills', icon: Code2 },
  { name: 'Projects', href: '#projects', icon: FolderKanban },
  { name: 'GitHub Activity', href: '#github-activity', icon: Activity },
  { name: 'Contact', href: '#contact', icon: Mail },
];

const projectCommands = [
  { name: 'Random Android Project', url: 'https://github.com/randomAndroidProject/randomAndroidProject' },
  { name: 'Tech Metaverse Canvas', url: 'https://github.com/ThammanaSrinivas/tech-metaverse-canvas' },
  { name: 'Habitica MCP Server', url: 'https://github.com/ThammanaSrinivas/habitica-mcp-server' },
  { name: 'Spring MVC CRUD API', url: 'https://github.com/ThammanaSrinivas/SpringMVCPracticeCRUDRestfulAPI' },
  { name: 'RAG Experiment', url: 'https://github.com/ThammanaSrinivas/RAG_experiment' },
  { name: 'SaiKiCoin', url: 'https://github.com/ThammanaSrinivas/SaiKiCoin' },
];

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navCommands.map((cmd) => (
            <CommandItem key={cmd.href} onSelect={() => scrollTo(cmd.href)}>
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{cmd.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Projects">
          {projectCommands.map((cmd) => (
            <CommandItem
              key={cmd.url}
              onSelect={() => {
                window.open(cmd.url, '_blank', 'noopener,noreferrer');
                setOpen(false);
              }}
            >
              <Github className="mr-2 h-4 w-4" />
              <span>{cmd.name}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              toggleTheme();
              setOpen(false);
            }}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
              setOpen(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>View Resume</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
