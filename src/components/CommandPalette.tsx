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
import { LAB, LINKS, SECTIONS } from '@/data/profile';
import { emitZen } from '@/lib/zenEvents';
import { Github, Hash, Sun, Moon, FileText, ExternalLink, Terminal, Swords } from 'lucide-react';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const projects = [{ name: 'zenmode', url: LINKS.zenmode }, ...LAB.map(({ name, url }) => ({ name, url }))];

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

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const openUrl = (url: string) => run(() => window.open(url, '_blank', 'noopener,noreferrer'));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a section, project or action…" />
      <CommandList>
        <CommandEmpty>Nothing here. Try “work” or “shell”.</CommandEmpty>

        <CommandGroup heading="Sections">
          {SECTIONS.map(({ id, label }) => (
            <CommandItem
              key={id}
              onSelect={() => run(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))}
            >
              <Hash className="mr-2 h-4 w-4 text-primary" />
              <span>{label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Play">
          <CommandItem onSelect={() => run(() => emitZen('shell'))}>
            <Terminal className="mr-2 h-4 w-4 text-primary" />
            <span>Open zen shell</span>
            <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">`</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => emitZen('duel'))}>
            <Swords className="mr-2 h-4 w-4 text-primary" />
            <span>Start a coding duel</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem key={p.url} onSelect={() => openUrl(p.url)}>
              <Github className="mr-2 h-4 w-4" />
              <span>{p.name}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(toggleTheme)}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Switch to {theme === 'dark' ? 'light' : 'dark'} theme</span>
          </CommandItem>
          <CommandItem onSelect={() => openUrl(LINKS.resume)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>View resume</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
