import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Play, Pause, AlertCircle, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGitHubRepos, useRepoCommits, useRepoBranches, useCommitDetail } from '@/hooks/useCommitHistory';
import { languageColors } from '@/lib/github';
import RepoSelector from './RepoSelector';
import CommitTimelineScene from './CommitTimelineScene';
import TimelineScrubber from './TimelineScrubber';
import CommitDetailPanel from './CommitDetailPanel';

const CommitTimeMachine: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(-1);
  const [hoveredCommitIndex, setHoveredCommitIndex] = useState<number | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [progress, setProgress] = useState(0);

  const queryClient = useQueryClient();

  const { data: repos, isLoading: reposLoading, isError: reposError } = useGitHubRepos();
  const { data: branches, isLoading: branchesLoading } = useRepoBranches(selectedRepo);
  const {
    data: commits,
    isLoading: commitsLoading,
  } = useRepoCommits(selectedRepo, 30, selectedBranch);

  // Sort branches: common default names first, then alphabetical
  const sortedBranches = useMemo(() => {
    if (!branches) return [];
    const defaultNames = ['main', 'master', 'develop', 'dev'];
    return [...branches].sort((a, b) => {
      const aIdx = defaultNames.indexOf(a.name);
      const bIdx = defaultNames.indexOf(b.name);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [branches]);

  // Auto-select first sorted branch
  React.useEffect(() => {
    if (sortedBranches.length > 0 && selectedBranch === undefined) {
      setSelectedBranch(sortedBranches[0].name);
    }
  }, [sortedBranches, selectedBranch]);

  const activeIndex = hoveredCommitIndex ?? selectedCommitIndex;
  const activeSha = commits && activeIndex >= 0 ? commits[activeIndex]?.sha : null;

  const { data: commitDetail } = useCommitDetail(selectedRepo, activeSha);

  const handleCommitClick = useCallback(
    (index: number) => {
      setSelectedCommitIndex(index);
      if (commits && commits[index] && selectedRepo) {
        queryClient.fetchQuery({
          queryKey: ['commit-detail', selectedRepo, commits[index].sha],
          queryFn: async () => {
            const res = await fetch(
              `https://api.github.com/repos/ThammanaSrinivas/${selectedRepo}/commits/${commits[index].sha}`,
              { headers: { Accept: 'application/vnd.github.v3+json' } }
            );
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
          },
          staleTime: 10 * 60 * 1000,
        });
      }
    },
    [commits, selectedRepo, queryClient]
  );

  const handleRepoSelect = useCallback((repoName: string) => {
    setSelectedRepo(repoName);
    setSelectedBranch(undefined); // reset branch so it auto-selects default for new repo
    setSelectedCommitIndex(-1);
    setHoveredCommitIndex(null);
    setIsExploring(false);
    setProgress(0);
  }, []);

  const handleBranchSelect = useCallback((branchName: string) => {
    setSelectedBranch(branchName);
    setSelectedCommitIndex(-1);
    setHoveredCommitIndex(null);
    setIsExploring(false);
    setProgress(0);
    setBranchDropdownOpen(false);
  }, []);

  const repoLanguage = useMemo(() => {
    if (!repos || !selectedRepo) return null;
    const repo = repos.find((r) => r.name === selectedRepo);
    return repo?.language || null;
  }, [repos, selectedRepo]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;

  // Select first repo automatically
  React.useEffect(() => {
    if (repos && repos.length > 0 && !selectedRepo) {
      setSelectedRepo(repos[0].name);
    }
  }, [repos, selectedRepo]);

  return (
    <section
      id="commit-time-machine"
      className="py-20 px-6 relative overflow-hidden"
      role="region"
      aria-label="Commit History Time Machine"
    >
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-6 text-foreground heading-primary">
            Commit Time Machine
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore the evolution of projects through an interactive 3D timeline
          </p>
        </motion.div>

        {reposError ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">Unable to load repository data.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Repo selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {reposLoading ? (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 w-28 rounded-full bg-primary/10 animate-pulse" />
                  ))}
                </div>
              ) : repos ? (
                <RepoSelector
                  repos={repos}
                  selectedRepo={selectedRepo}
                  onSelect={handleRepoSelect}
                />
              ) : null}
            </motion.div>

            {/* Branch dropdown */}
            {selectedRepo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="relative">
                  <button
                    onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                    disabled={branchesLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 bg-background/50 text-sm font-medium text-foreground hover:border-primary/40 transition-all duration-200 disabled:opacity-50"
                  >
                    <GitBranch className="w-4 h-4 text-primary" />
                    <span>{branchesLoading ? 'Loading...' : selectedBranch || 'Select branch'}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {branchDropdownOpen && sortedBranches.length > 0 && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setBranchDropdownOpen(false)}
                      />
                      <div className="absolute top-full mt-1 left-0 z-20 w-56 max-h-64 overflow-y-auto rounded-lg border border-primary/20 bg-background/95 backdrop-blur-xl shadow-xl">
                        {sortedBranches.map((branch) => (
                          <button
                            key={branch.name}
                            onClick={() => handleBranchSelect(branch.name)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 flex items-center gap-2 ${
                              selectedBranch === branch.name
                                ? 'text-primary font-medium bg-primary/5'
                                : 'text-foreground'
                            }`}
                          >
                            <GitBranch className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">{branch.name}</span>
                            {selectedBranch === branch.name && (
                              <span className="ml-auto text-xs text-primary">current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3D Scene or 2D Fallback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {commitsLoading ? (
                <div className="w-full h-[320px] md:h-[420px] rounded-xl border border-primary/20 bg-background/30 animate-pulse flex items-center justify-center">
                  <GitBranch className="w-8 h-8 text-primary/30 animate-spin" />
                </div>
              ) : commits && commits.length > 0 ? (
                isMobile ? (
                  <div className="rounded-xl border border-primary/20 bg-background/30 p-4 max-h-[400px] overflow-y-auto">
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/30" />
                      {commits.slice(0, 20).map((commit, i) => {
                        const langColor = repoLanguage
                          ? languageColors[repoLanguage] || '#6366f1'
                          : '#6366f1';
                        return (
                          <div
                            key={commit.sha}
                            className={`relative mb-4 cursor-pointer group ${
                              selectedCommitIndex === i ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                            onClick={() => handleCommitClick(i)}
                          >
                            <div
                              className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-background transition-transform group-hover:scale-125"
                              style={{ backgroundColor: langColor }}
                            />
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {commit.commit.message.split('\n')[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(commit.commit.author.date).toLocaleDateString()} &middot;{' '}
                              <code className="text-primary">{commit.sha.slice(0, 7)}</code>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <CommitTimelineScene
                    commits={commits}
                    repoLanguage={repoLanguage}
                    selectedIndex={activeIndex}
                    isExploring={isExploring}
                    progress={progress}
                    onCommitHover={setHoveredCommitIndex}
                    onCommitClick={handleCommitClick}
                  />
                )
              ) : (
                <div className="w-full h-[320px] rounded-xl border border-primary/20 bg-background/30 flex items-center justify-center">
                  <p className="text-muted-foreground">No commits found for this repository.</p>
                </div>
              )}

              {commitDetail && selectedCommitIndex >= 0 && (
                <CommitDetailPanel
                  commit={commitDetail}
                  onClose={() => setSelectedCommitIndex(-1)}
                />
              )}
            </motion.div>

            {/* Controls */}
            {commits && commits.length > 1 && !isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-4"
              >
                <button
                  onClick={() => {
                    setIsExploring(!isExploring);
                    if (!isExploring) setProgress(0);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 text-sm font-medium"
                >
                  {isExploring ? (
                    <>
                      <Pause className="w-4 h-4" /> Stop Exploring
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Explore Timeline
                    </>
                  )}
                </button>

                <div className="flex-1 w-full">
                  <TimelineScrubber
                    value={Math.round(progress * 100)}
                    max={100}
                    onChange={(v) => {
                      setProgress(v / 100);
                      setIsExploring(true);
                    }}
                    label={
                      commits
                        ? `${Math.round(progress * (commits.length - 1)) + 1} / ${commits.length} commits`
                        : undefined
                    }
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CommitTimeMachine;
