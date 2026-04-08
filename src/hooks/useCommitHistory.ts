import { useQuery } from '@tanstack/react-query';
import {
  fetchGitHubData,
  fetchRepoBranches,
  fetchRepoCommits,
  fetchCommitDetail,
  type GitHubRepo,
} from '@/lib/github';

export function useGitHubRepos() {
  return useQuery({
    queryKey: ['github-activity'],
    queryFn: fetchGitHubData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    select: (data) =>
      data.repos
        .filter((r: GitHubRepo) => !r.fork)
        .slice(0, 6),
  });
}

export function useRepoBranches(repoName: string | null) {
  return useQuery({
    queryKey: ['repo-branches', repoName],
    queryFn: () => fetchRepoBranches(repoName!),
    enabled: !!repoName,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useRepoCommits(repoName: string | null, perPage = 30, branch?: string) {
  return useQuery({
    queryKey: ['repo-commits', repoName, perPage, branch],
    queryFn: () => fetchRepoCommits(repoName!, perPage, branch),
    enabled: !!repoName,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCommitDetail(repoName: string | null, sha: string | null) {
  return useQuery({
    queryKey: ['commit-detail', repoName, sha],
    queryFn: () => fetchCommitDetail(repoName!, sha!),
    enabled: false, // fetched on demand
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
