import { motion } from 'framer-motion';

const typeConfig = {
  task: { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-blue-400/60 bg-blue-400/6 border-blue-400/10' },
  goal: { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-purple-400/60 bg-purple-400/6 border-purple-400/10' },
  project: { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-emerald-400/60 bg-emerald-400/6 border-emerald-400/10' },
  learning: { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-cyan-400/60 bg-cyan-400/6 border-cyan-400/10' },
  overdue: { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-rose-400/60 bg-rose-400/6 border-rose-400/10' },
  streak: { icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', color: 'text-amber-400/60 bg-amber-400/6 border-amber-400/10' },
  feature: { icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', color: 'text-indigo-400/60 bg-indigo-400/6 border-indigo-400/10' },
  recovery: { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'text-teal-400/60 bg-teal-400/6 border-teal-400/10' },
};

const urgencyColors = {
  high: 'border-l-rose-500/40',
  medium: 'border-l-amber-500/30',
  low: 'border-l-white/[0.04]',
};

export default function RecommendationList({ recommendations, loading }) {
  if (loading) {
    return <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 animate-pulse h-48" />;
  }
  if (!recommendations?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
    >
      <h2 className="text-sm font-semibold text-white/90 mb-3">Recommendations</h2>
      <div className="space-y-2">
        {recommendations.map((r, i) => {
          const cfg = typeConfig[r.type] || typeConfig.task;
          return (
            <div
              key={r._id || i}
              className={`flex items-start gap-3 p-3 rounded-lg bg-nexus-card/10 border border-white/[0.03] border-l-2 ${urgencyColors[r.urgency] || urgencyColors.low}`}
            >
              <div className={`p-1.5 rounded-lg border ${cfg.color}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cfg.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80">{r.title}</p>
                {r.description && <p className="text-2xs text-nexus-subtle/40 mt-0.5">{r.description}</p>}
              </div>
              {r.actionUrl && (
                <button className="shrink-0 text-2xs px-2 py-1 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-colors">
                  Go
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
