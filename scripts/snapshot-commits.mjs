// Writes public/gh-snapshot.json: the GitHub API answers the Time Machine needs,
// keyed by request path, trimmed to the fields the UI reads. The site falls back
// to it when the live API is rate-limited or offline.
//
// Usage: GITHUB_TOKEN=$(gh auth token) node scripts/snapshot-commits.mjs
import { writeFileSync } from 'node:fs';

const USER = 'ThammanaSrinivas';
const PINNED = ['zenmode', 'tech-metaverse-canvas', 'habitica-mcp-server'];
const headers = { Accept: 'application/vnd.github.v3+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const get = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
};

// Must match the paths built in src/lib/github.ts.
const reposPath = `/users/${USER}/repos?sort=pushed&per_page=30`;
const repos = await get(reposPath);
const own = repos.filter((r) => !r.fork && r.name !== USER);
const picked = [
  ...PINNED.map((n) => own.find((r) => r.name === n)).filter(Boolean),
  ...own.filter((r) => !PINNED.includes(r.name)),
].slice(0, 6);

const snapshot = {
  [reposPath]: repos.map(({ name, description, html_url, stargazers_count, forks_count, language, updated_at, fork }) => ({
    name, description, html_url, stargazers_count, forks_count, language, updated_at, fork,
  })),
};

for (const repo of picked) {
  const branch = repo.default_branch;
  snapshot[`/repos/${USER}/${repo.name}/branches?per_page=100`] = [{ name: branch, commit: { sha: '', url: '' }, protected: false }];
  const commits = await get(`/repos/${USER}/${repo.name}/commits?per_page=30&sha=${encodeURIComponent(branch)}`);
  snapshot[`/repos/${USER}/${repo.name}/commits?per_page=30&sha=${encodeURIComponent(branch)}`] = commits.map((c) => ({
    sha: c.sha,
    html_url: c.html_url,
    commit: { message: c.commit.message.split('\n')[0], author: { name: c.commit.author.name, date: c.commit.author.date } },
    author: c.author ? { login: c.author.login, avatar_url: '' } : null,
  }));
}

snapshot._generatedAt = new Date().toISOString();
writeFileSync(new URL('../public/gh-snapshot.json', import.meta.url), JSON.stringify(snapshot));
console.log(`snapshot: ${picked.length} repos → public/gh-snapshot.json`);
