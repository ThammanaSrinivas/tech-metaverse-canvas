import React from 'react';
import { motion } from 'framer-motion';
import type { GitHubRepo } from '@/lib/github';

interface RepoSelectorProps {
  repos: GitHubRepo[];
  selectedRepo: string | null;
  onSelect: (repoName: string) => void;
}

const RepoSelector: React.FC<RepoSelectorProps> = ({ repos, selectedRepo, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {repos.map((repo) => {
        const isActive = selectedRepo === repo.name;
        return (
          <motion.button
            key={repo.name}
            onClick={() => onSelect(repo.name)}
            whileTap={{ scale: 0.97 }}
            aria-pressed={isActive}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
              isActive
                ? 'border-tint-line bg-tint text-primary'
                : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              {repo.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RepoSelector;
