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

export interface GitHubEvent {
  type: string;
  created_at: string;
}

export interface GitHubUser {
  public_repos: number;
  followers: number;
  avatar_url: string;
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

export const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dockerfile: '#384d54',
  Shell: '#89e051',
};

const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };

export const fetchGitHubData = async () => {
  const [userRes, reposRes, eventsRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`, { headers }),
    fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`, { headers }),
    fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=100`, { headers }),
  ]);

  if (!userRes.ok || !reposRes.ok || !eventsRes.ok) {
    throw new Error('GitHub API rate limit or fetch error');
  }

  const user: GitHubUser = await userRes.json();
  const repos: GitHubRepo[] = await reposRes.json();
  const events: GitHubEvent[] = await eventsRes.json();

  return { user, repos, events };
};

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
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repoName}/branches?per_page=100`,
    { headers }
  );
  if (!res.ok) throw new Error(`Failed to fetch branches for ${repoName}`);
  return res.json();
};

export const fetchRepoCommits = async (
  repoName: string,
  perPage = 30,
  branch?: string
): Promise<GitHubCommit[]> => {
  const branchParam = branch ? `&sha=${encodeURIComponent(branch)}` : '';
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=${perPage}${branchParam}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Failed to fetch commits for ${repoName}`);
  return res.json();
};

export const fetchCommitDetail = async (
  repoName: string,
  sha: string
): Promise<GitHubCommit> => {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repoName}/commits/${sha}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Failed to fetch commit ${sha}`);
  return res.json();
};
