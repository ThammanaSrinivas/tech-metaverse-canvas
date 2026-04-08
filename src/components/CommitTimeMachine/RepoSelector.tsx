import React from 'react';
import { motion } from 'framer-motion';
import { languageColors } from '@/lib/github';
import type { GitHubRepo } from '@/lib/github';

interface RepoSelectorProps {
  repos: GitHubRepo[];
  selectedRepo: string | null;
  onSelect: (repoName: string) => void;
}

const RepoSelector: React.FC<RepoSelectorProps> = ({ repos, selectedRepo, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {repos.map((repo) => {
        const isActive = selectedRepo === repo.name;
        const langColor = repo.language ? languageColors[repo.language] || '#888' : '#888';
        return (
          <motion.button
            key={repo.name}
            onClick={() => onSelect(repo.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              isActive
                ? 'bg-primary/20 border-primary/60 text-primary shadow-lg shadow-primary/10'
                : 'bg-background/50 border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              {repo.language && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: langColor }}
                />
              )}
              {repo.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RepoSelector;
