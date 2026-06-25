import { motion } from 'framer-motion';

const statItems = [
  { key: 'totalPaths', label: 'Learning Paths', icon: PathsIcon, color: 'from-blue-400 to-blue-500' },
  { key: 'activePaths', label: 'Active', icon: ActiveIcon, color: 'from-emerald-400 to-emerald-500' },
  { key: 'completedTopics', label: 'Topics Done', icon: TopicsIcon, color: 'from-purple-400 to-purple-500' },
  { key: 'totalStudyHours', label: 'Study Hours', icon: HoursIcon, color: 'from-amber-400 to-amber-500' },
  { key: 'solvedProblems', label: 'Problems Solved', icon: ProblemsIcon, color: 'from-rose-400 to-rose-500' },
  { key: 'dueRevisions', label: 'Due Revisions', icon: RevisionIcon, color: 'from-cyan-400 to-cyan-500' },
];

export default function LearningStatistics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statItems.map((item, i) => {
        const value = stats[item.key] ?? 0;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl bg-nexus-card/40 border border-white/[0.06] p-3.5 group hover:border-white/[0.1] transition-all"
          >
            <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${item.color}`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <item.icon className="w-4 h-4 text-nexus-subtle/40" />
              </div>
              <div className="text-lg font-semibold text-white/90 tabular-nums">{value}</div>
              <div className="text-2xs text-nexus-subtle/40 mt-0.5">{item.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function PathsIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>;
}
function ActiveIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function TopicsIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function HoursIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function ProblemsIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function RevisionIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><polyline points="17 8 12 13 9 10"/></svg>;
}
