import { useQuery } from '@tanstack/react-query';
import {
  fetchRepos,
  fetchRepoBranches,
  fetchRepoCommits,
  fetchCommitDetail,
  type GitHubRepo,
} from '@/lib/github';

/** Pinned repos first (flagship leads), then the most recently pushed originals. */
const PINNED = ['zenmode', 'tech-metaverse-canvas', 'habitica-mcp-server'];

export function useGitHubRepos() {
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: fetchRepos,
    staleTime: 15 * 60 * 1000,
    retry: false,
    select: (repos: GitHubRepo[]) => {
      const own = repos.filter((r) => !r.fork && r.name !== 'ThammanaSrinivas');
      const pinned = PINNED.map((n) => own.find((r) => r.name === n)).filter(Boolean) as GitHubRepo[];
      return [...pinned, ...own.filter((r) => !PINNED.includes(r.name))].slice(0, 6);
    },
  });
}

export function useRepoBranches(repoName: string | null) {
  return useQuery({
    queryKey: ['repo-branches', repoName],
    queryFn: () => fetchRepoBranches(repoName!),
    enabled: !!repoName,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useRepoCommits(repoName: string | null, perPage = 30, branch?: string) {
  return useQuery({
    queryKey: ['repo-commits', repoName, perPage, branch],
    queryFn: () => fetchRepoCommits(repoName!, perPage, branch),
    enabled: !!repoName,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useCommitDetail(repoName: string | null, sha: string | null) {
  return useQuery({
    queryKey: ['commit-detail', repoName, sha],
    queryFn: () => fetchCommitDetail(repoName!, sha!),
    enabled: false, // filled by an explicit click (see CommitTimeMachine), never on hover
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
