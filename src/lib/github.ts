export const GITHUB_USERNAME = 'ThammanaSrinivas';
export const GITHUB_API = 'https://api.github.com';

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * GET a GitHub API path with a sessionStorage cache. Calls are unauthenticated
 * (60/hour per visitor IP), so reloads and repo switching reuse earlier answers.
 */
let snapshot: Promise<Record<string, unknown>> | null = null;

/** Build-time copy of these same responses (scripts/snapshot-commits.mjs), used when the live API fails. */
async function fromSnapshot<T>(path: string): Promise<T | undefined> {
  snapshot ??= fetch('/gh-snapshot.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return (await snapshot)[path] as T | undefined;
}

async function getJson<T>(path: string): Promise<T> {
  try {
    return await getLive<T>(path);
  } catch (err) {
    const saved = await fromSnapshot<T>(path);
    if (saved !== undefined) return saved;
    throw err;
  }
}

async function getLive<T>(path: string): Promise<T> {
  const key = `gh:${path}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) {
      const { at, data } = JSON.parse(hit);
      if (Date.now() - at < CACHE_TTL_MS) return data as T;
    }
  } catch {
    // storage unavailable (private mode, blocked): just fetch
  }

  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const mins = Math.max(1, Math.ceil((reset - Date.now()) / 60000));
    throw new Error(`GitHub's hourly API limit is used up. Try again in about ${mins} min.`);
  }
  if (!res.ok) throw new Error(`GitHub request failed (${res.status})`);
  const data = (await res.json()) as T;
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // quota or unavailable: fine, cache is best-effort
  }
  return data;
}

export const fetchRepos = () =>
  getJson<GitHubRepo[]>(`/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=30`);

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export const fetchRepoBranches = async (
  repoName: string
): Promise<GitHubBranch[]> => {
  return getJson(`/repos/${GITHUB_USERNAME}/${repoName}/branches?per_page=100`);
};

export const fetchRepoCommits = async (
  repoName: string,
  perPage = 30,
  branch?: string
): Promise<GitHubCommit[]> => {
  const branchParam = branch ? `&sha=${encodeURIComponent(branch)}` : '';
  return getJson(`/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=${perPage}${branchParam}`);
};

export const fetchCommitDetail = async (
  repoName: string,
  sha: string
): Promise<GitHubCommit> => {
  return getJson(`/repos/${GITHUB_USERNAME}/${repoName}/commits/${sha}`);
};
