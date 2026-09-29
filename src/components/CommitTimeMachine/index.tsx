import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { GitBranch, Play, Pause, AlertCircle, ChevronDown, Keyboard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGitHubRepos, useRepoCommits, useRepoBranches, useCommitDetail } from '@/hooks/useCommitHistory';
import { fetchCommitDetail } from '@/lib/github';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';
import RepoSelector from './RepoSelector';
import TimelineScrubber from './TimelineScrubber';
import CommitDetailPanel from './CommitDetailPanel';

// three.js is the heaviest dependency on the page; load it only when this section renders.
const CommitTimelineScene = lazy(() => import('./CommitTimelineScene'));

// Bot/automation branches (Claude Code worktrees, nightly routines) are noise on a portfolio.
const HIDDEN_BRANCH = /^(claude|routine)\//;

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

const CommitTimeMachine: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(-1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hoveredCommitIndex, setHoveredCommitIndex] = useState<number | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  const queryClient = useQueryClient();
  // The section is always an ink band, so nodes use the on-ink accent (zen.300).
  const nodeColor = '#5BDF62';

  const { data: repos, isLoading: reposLoading, error: reposError } = useGitHubRepos();
  const { data: branches, isLoading: branchesLoading } = useRepoBranches(selectedRepo);
  const { data: newestFirst, isLoading: commitsLoading, error: commitsError } = useRepoCommits(selectedRepo, 30, selectedBranch);
  // GitHub returns newest first; the timeline reads left to right, oldest → newest.
  const commits = useMemo(() => (newestFirst ? [...newestFirst].reverse() : undefined), [newestFirst]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const sortedBranches = useMemo(() => {
    if (!branches) return [];
    const defaultNames = ['main', 'master', 'develop', 'dev'];
    return branches.filter((b) => !HIDDEN_BRANCH.test(b.name)).sort((a, b) => {
      const aIdx = defaultNames.indexOf(a.name);
      const bIdx = defaultNames.indexOf(b.name);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [branches]);

  useEffect(() => {
    if (sortedBranches.length > 0 && selectedBranch === undefined) setSelectedBranch(sortedBranches[0].name);
  }, [sortedBranches, selectedBranch]);

  useEffect(() => {
    if (repos && repos.length > 0 && !selectedRepo) setSelectedRepo(repos[0].name);
  }, [repos, selectedRepo]);

  const selectedSha = commits && selectedCommitIndex >= 0 ? commits[selectedCommitIndex]?.sha ?? null : null;
  const { data: commitDetail } = useCommitDetail(selectedRepo, selectedSha);

  const summary = useMemo(() => {
    if (!commits?.length) return null;
    const authors = new Set(commits.map((c) => c.author?.login ?? c.commit.author.name));
    return {
      count: commits.length,
      from: fmt(commits[0].commit.author.date),
      to: fmt(commits[commits.length - 1].commit.author.date),
      authors: authors.size,
    };
  }, [commits]);

  const openDetail = useCallback(
    (index: number) => {
      setSelectedCommitIndex(index);
      setDetailOpen(true);
      const sha = commits?.[index]?.sha;
      if (sha && selectedRepo) {
        queryClient
          .fetchQuery({
            queryKey: ['commit-detail', selectedRepo, sha],
            queryFn: () => fetchCommitDetail(selectedRepo, sha),
            staleTime: 10 * 60 * 1000,
          })
          .catch(() => {
            // Rate-limited or offline: the panel falls back to the list data it already has.
          });
      }
    },
    [commits, selectedRepo, queryClient]
  );

  const resetView = () => {
    setAutoplay(false);
    setSelectedCommitIndex(-1);
    setDetailOpen(false);
    setHoveredCommitIndex(null);
    setIsExploring(false);
    setProgress(0);
  };

  const handleRepoSelect = useCallback((repoName: string) => {
    setSelectedRepo(repoName);
    setSelectedBranch(undefined);
    resetView();
  }, []);

  const handleBranchSelect = useCallback((branchName: string) => {
    setSelectedBranch(branchName);
    resetView();
    setBranchDropdownOpen(false);
  }, []);

  // ← / → walk the timeline, Enter opens the commit under the cursor.
  const onSceneKey = (e: React.KeyboardEvent) => {
    if (!commits?.length) return;
    const last = commits.length - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const cur = selectedCommitIndex < 0 ? 0 : selectedCommitIndex;
      const next = Math.min(last, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)));
      setSelectedCommitIndex(next);
      setDetailOpen(false);
      setAutoplay(false);
      setIsExploring(true);
      setProgress(last ? next / last : 0);
    } else if (e.key === 'Enter' && selectedCommitIndex >= 0) {
      openDetail(selectedCommitIndex);
    } else if (e.key === 'Escape') {
      setDetailOpen(false);
    }
  };

  // Fly: glide the camera from the first commit to the latest over ~12s. Any manual input stops it.
  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setProgress((p) => {
        const next = Math.min(1, p + dt / 12);
        if (next >= 1) setAutoplay(false);
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoplay]);

  const error = (reposError || commitsError) as Error | null;

  return (
    <Section id="time-machine" ink>
      <SectionHeader
        index="05"
        title="Time Machine"
        kicker="Fly through the last 30 commits of my public repos. Drag to orbit, click a node for the diff."
      />

      {error ? (
        <div className="zen-card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">{error.message}</p>
          <a href="https://github.com/ThammanaSrinivas" target="_blank" rel="noopener noreferrer" className="zen-label text-primary">
            browse on github ↗
          </a>
        </div>
      ) : (
        <Reveal>
          <div className="zen-card p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {reposLoading ? (
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-secondary" />
                  ))}
                </div>
              ) : repos ? (
                <RepoSelector repos={repos} selectedRepo={selectedRepo} onSelect={handleRepoSelect} />
              ) : null}

              {selectedRepo && (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                    disabled={branchesLoading}
                    className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-mono text-xs transition-colors hover:border-primary disabled:opacity-50"
                    aria-haspopup="listbox"
                    aria-expanded={branchDropdownOpen}
                  >
                    <GitBranch className="h-3.5 w-3.5 text-primary" />
                    {branchesLoading ? 'loading…' : selectedBranch || 'branch'}
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {branchDropdownOpen && sortedBranches.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setBranchDropdownOpen(false)} />
                      <ul role="listbox" className="absolute right-0 top-full z-20 mt-2 max-h-64 w-56 overflow-y-auto rounded-2xl border bg-popover p-1 shadow-xl">
                        {sortedBranches.map((branch) => (
                          <li key={branch.name}>
                            <button
                              role="option"
                              aria-selected={selectedBranch === branch.name}
                              onClick={() => handleBranchSelect(branch.name)}
                              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-mono text-xs hover:bg-secondary ${
                                selectedBranch === branch.name ? 'text-primary' : ''
                              }`}
                            >
                              <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{branch.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            {summary && (
              <p className="zen-label mt-4 text-muted-foreground">
                <span className="text-primary">{summary.count}</span> commits · {summary.from} → {summary.to} ·{' '}
                {summary.authors} author{summary.authors === 1 ? '' : 's'}
              </p>
            )}

            <div
              className="relative mt-4 rounded-[20px] outline-none"
              tabIndex={commits?.length ? 0 : -1}
              onKeyDown={onSceneKey}
              aria-label="Commit timeline. Use left and right arrows to move, Enter for details."
            >
              {commitsLoading ? (
                <div className="flex h-[320px] w-full animate-pulse items-center justify-center rounded-[20px] border bg-secondary/50 md:h-[420px]">
                  <GitBranch className="h-8 w-8 text-primary/40" />
                </div>
              ) : commits && commits.length > 0 ? (
                isMobile ? (
                  <ol className="relative max-h-[420px] overflow-y-auto rounded-[20px] border bg-background/50 py-3 pl-8 pr-4">
                    <span className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-border" aria-hidden />
                    {commits.map((commit, i) => ({ commit, i })).reverse().slice(0, 20).map(({ commit, i }) => (
                      <li key={commit.sha}>
                        <button onClick={() => openDetail(i)} className="relative w-full py-2 text-left">
                          <span
                            className="absolute -left-[0.95rem] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-card"
                            style={{ background: selectedCommitIndex === i ? '#FFC800' : nodeColor }}
                          />
                          <span className="line-clamp-1 text-sm">{commit.commit.message.split('\n')[0]}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {fmt(commit.commit.author.date)} · {commit.sha.slice(0, 7)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <Suspense fallback={<div className="h-[320px] w-full animate-pulse rounded-[20px] border bg-secondary/50 md:h-[420px]" />}>
                  <CommitTimelineScene
                    commits={commits}
                    color={nodeColor}
                    selectedIndex={hoveredCommitIndex ?? selectedCommitIndex}
                    isExploring={isExploring}
                    progress={progress}
                    onCommitHover={setHoveredCommitIndex}
                    onCommitClick={openDetail}
                  />
                  </Suspense>
                )
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center rounded-[20px] border">
                  <p className="text-muted-foreground">No commits on this branch yet.</p>
                </div>
              )}

              {hoveredCommitIndex !== null && commits?.[hoveredCommitIndex] && !detailOpen && (
                <div className="pointer-events-none absolute left-4 top-4 max-w-[70%] rounded-xl border bg-popover/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
                  <p className="line-clamp-1">{commits[hoveredCommitIndex].commit.message.split('\n')[0]}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {fmt(commits[hoveredCommitIndex].commit.author.date)} · click for diff
                  </p>
                </div>
              )}

              {detailOpen && commits?.[selectedCommitIndex] && (
                <CommitDetailPanel
                  commit={commitDetail ?? commits[selectedCommitIndex]}
                  onClose={() => setDetailOpen(false)}
                />
              )}
            </div>

            {commits && commits.length > 1 && !isMobile && (
              <div className="mt-5 flex flex-col items-center gap-4 md:flex-row">
                <button
                  onClick={() => {
                    if (autoplay || isExploring) {
                      setAutoplay(false);
                      setIsExploring(false);
                    } else {
                      setProgress(0);
                      setIsExploring(true);
                      setAutoplay(true);
                    }
                  }}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  {isExploring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isExploring ? 'Back to overview' : 'Fly the timeline'}
                </button>
                <div className="w-full flex-1">
                  <TimelineScrubber
                    value={Math.round(progress * 100)}
                    max={100}
                    onChange={(v) => {
                      setAutoplay(false);
                      setProgress(v / 100);
                      setIsExploring(true);
                    }}
                    label={`${Math.round(progress * (commits.length - 1)) + 1} / ${commits.length}`}
                  />
                </div>
                <p className="zen-label hidden shrink-0 items-center gap-2 text-muted-foreground lg:flex">
                  <Keyboard className="h-3.5 w-3.5" /> ← → · enter
                </p>
              </div>
            )}
          </div>
        </Reveal>
      )}
    </Section>
  );
};

export default CommitTimeMachine;
