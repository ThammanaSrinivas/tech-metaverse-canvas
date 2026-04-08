import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, ExternalLink, Plus, Minus, FileText } from 'lucide-react';
import type { GitHubCommit } from '@/lib/github';

interface CommitDetailPanelProps {
  commit: GitHubCommit | null;
  onClose: () => void;
}

const CommitDetailPanel: React.FC<CommitDetailPanelProps> = ({ commit, onClose }) => {
  if (!commit) return null;

  const date = new Date(commit.commit.author.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20
          bg-background/90 backdrop-blur-xl border border-primary/30 rounded-xl p-5
          shadow-2xl shadow-primary/5"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close commit details"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
            <GitCommit className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {commit.commit.message.split('\n')[0]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {commit.commit.author.name} &middot; {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs mb-3">
          <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono">
            {commit.sha.slice(0, 7)}
          </code>
          {commit.stats && (
            <>
              <span className="flex items-center gap-1 text-green-500">
                <Plus className="w-3 h-3" />
                {commit.stats.additions}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <Minus className="w-3 h-3" />
                {commit.stats.deletions}
              </span>
            </>
          )}
        </div>

        {commit.files && commit.files.length > 0 && (
          <div className="border-t border-primary/10 pt-3 mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {commit.files.slice(0, 8).map((file) => (
                <div key={file.filename} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80 truncate flex-1 font-mono">
                    {file.filename.split('/').pop()}
                  </span>
                  <span className="flex-shrink-0 ml-2">
                    <span className="text-green-500">+{file.additions}</span>
                    {' '}
                    <span className="text-red-500">-{file.deletions}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommitDetailPanel;
