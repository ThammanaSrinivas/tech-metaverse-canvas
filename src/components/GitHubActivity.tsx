import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Github,
  Star,
  GitFork,
  Code2,
  Activity,
  ExternalLink,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { GITHUB_USERNAME, fetchGitHubData, languageColors } from '@/lib/github';
import type { GitHubEvent } from '@/lib/github';

function buildHeatmapData(events: GitHubEvent[]) {
  const days = 91;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const counts: Record<string, number> = {};

  for (const event of events) {
    const date = new Date(event.created_at);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().split('T')[0];
    counts[key] = (counts[key] || 0) + 1;
  }

  const cells: { date: string; count: number; dayOfWeek: number; weekIndex: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const weekIndex = Math.floor((days - 1 - i + ((today.getDay() + 1) % 7)) / 7);
    cells.push({ date: key, count: counts[key] || 0, dayOfWeek, weekIndex });
  }

  return cells;
}

function getIntensityStyle(count: number): React.CSSProperties {
  if (count === 0) return { background: 'hsl(var(--primary) / 0.06)', borderColor: 'hsl(var(--primary) / 0.1)' };
  if (count <= 2) return { background: 'hsl(var(--primary) / 0.2)', borderColor: 'hsl(var(--primary) / 0.25)' };
  if (count <= 5) return { background: 'hsl(var(--primary) / 0.4)', borderColor: 'hsl(var(--primary) / 0.45)' };
  if (count <= 10) return { background: 'hsl(var(--primary) / 0.6)', borderColor: 'hsl(var(--primary) / 0.55)', boxShadow: '0 0 4px hsl(var(--primary) / 0.2)' };
  return { background: 'hsl(var(--primary) / 0.85)', borderColor: 'hsl(var(--primary) / 0.7)', boxShadow: '0 0 8px hsl(var(--primary) / 0.3)' };
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statIcons = [
  { key: 'repos', icon: Github, label: 'Repositories', gradient: 'from-blue-500/20 to-cyan-500/20' },
  { key: 'stars', icon: Star, label: 'Total Stars', gradient: 'from-amber-500/20 to-yellow-500/20' },
  { key: 'language', icon: Code2, label: 'Top Language', gradient: 'from-purple-500/20 to-pink-500/20' },
  { key: 'activity', icon: Flame, label: 'Recent Events', gradient: 'from-orange-500/20 to-red-500/20' },
];

const GitHubActivity: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['github-activity'],
    queryFn: fetchGitHubData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const stats = useMemo(() => {
    if (!data) return null;
    const { user, repos, events } = data;
    const ownRepos = repos.filter(r => !r.fork);
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

    const langCount: Record<string, number> = {};
    for (const r of ownRepos) {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
    const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      publicRepos: user.public_repos,
      totalStars,
      topLanguage,
      recentActivity: events.length,
      recentRepos: ownRepos.slice(0, 3),
    };
  }, [data]);

  const heatmapCells = useMemo(() => {
    if (!data) return [];
    return buildHeatmapData(data.events);
  }, [data]);

  const weeks = useMemo(() => {
    const w: typeof heatmapCells[] = [];
    for (const cell of heatmapCells) {
      if (!w[cell.weekIndex]) w[cell.weekIndex] = [];
      w[cell.weekIndex].push(cell);
    }
    return w;
  }, [heatmapCells]);

  const statValues = stats ? [
    stats.publicRepos,
    stats.totalStars,
    stats.topLanguage,
    stats.recentActivity,
  ] : [];

  return (
    <section
      id="github-activity"
      className="py-20 px-6 relative overflow-hidden"
      role="region"
      aria-label="GitHub Activity"
    >
      {/* Background accents */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-foreground heading-primary">
            GitHub Activity
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Open source contributions and coding activity
          </p>
        </motion.div>

        {isError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-6 text-lg">Unable to load GitHub data right now.</p>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              View profile on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-primary/10 p-5 sm:p-6 animate-pulse bg-background/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 mb-4" />
                    <div className="h-3 w-16 bg-primary/10 rounded mb-3" />
                    <div className="h-7 w-12 bg-primary/10 rounded" />
                  </div>
                ))
              ) : stats && (
                statIcons.map((s, i) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative rounded-xl border border-primary/20 p-5 sm:p-6 bg-background/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{statValues[i]}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl border border-primary/20 bg-background/30 backdrop-blur-sm overflow-hidden"
            >
              {/* Heatmap header */}
              <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground">Contribution Activity</h3>
                    <p className="text-xs text-muted-foreground">Last 13 weeks</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Less</span>
                  {[0, 2, 5, 10, 15].map((count) => (
                    <div
                      key={count}
                      className="w-3 h-3 rounded-sm border"
                      style={getIntensityStyle(count)}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>

              {isLoading ? (
                <div className="h-32 mx-5 sm:mx-6 mb-5 sm:mb-6 bg-primary/5 rounded-lg animate-pulse" />
              ) : (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <div className="overflow-x-auto">
                    <div className="inline-flex gap-0.5 min-w-fit">
                      {/* Day labels */}
                      <div className="flex flex-col gap-0.5 mr-2 pt-0.5">
                        {dayLabels.map((label, i) => (
                          <div key={label} className="h-[13px] flex items-center">
                            {i % 2 === 1 ? (
                              <span className="text-[10px] text-muted-foreground/60 font-mono leading-none">{label}</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      {/* Grid */}
                      {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-0.5">
                          {Array.from({ length: 7 }).map((_, di) => {
                            const cell = week?.find(c => c.dayOfWeek === di);
                            if (!cell) {
                              return <div key={di} className="w-[13px] h-[13px]" />;
                            }
                            return (
                              <div
                                key={di}
                                title={`${cell.date}: ${cell.count} event${cell.count !== 1 ? 's' : ''}`}
                                className="w-[13px] h-[13px] rounded-[3px] border transition-all duration-200 hover:scale-150 hover:z-10 cursor-default"
                                style={getIntensityStyle(cell.count)}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mobile legend */}
                  <div className="flex sm:hidden items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    {[0, 2, 5, 10, 15].map((count) => (
                      <div
                        key={count}
                        className="w-3 h-3 rounded-sm border"
                        style={getIntensityStyle(count)}
                      />
                    ))}
                    <span>More</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent repos */}
            {!isLoading && stats && stats.recentRepos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <GitFork className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground">Recently Active</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.recentRepos.map((repo, i) => (
                    <motion.a
                      key={repo.name}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="group block rounded-xl border border-primary/20 p-5 bg-background/30 backdrop-blur-sm hover:border-primary/40 hover:bg-background/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-primary flex-shrink-0" />
                          <h4 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {repo.name}
                          </h4>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                      {repo.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background"
                              style={{
                                backgroundColor: languageColors[repo.language] || '#888',
                                ringColor: languageColors[repo.language] || '#888',
                              }}
                            />
                            <span className="font-medium">{repo.language}</span>
                          </div>
                        )}
                        {repo.stargazers_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500/70" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                        )}
                        {repo.forks_count > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                        )}
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* View full profile link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center pt-4"
            >
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 font-medium text-sm group"
              >
                <Github className="w-5 h-5 text-primary" />
                View Full GitHub Profile
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GitHubActivity;
