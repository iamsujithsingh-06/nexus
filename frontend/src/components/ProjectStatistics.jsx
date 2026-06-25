import { motion } from 'framer-motion';

export default function ProjectStatistics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-32 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
        <div className="h-32 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Project Completion" value={`${stats.projectCompletion}%`} desc="Overall progress" />
        <StatBox label="Sprint Completion" value={`${stats.sprintCompletion}%`} desc="Sprints finished" />
        <StatBox label="Feature Completion" value={`${stats.featureCompletion}%`} desc="Features done" />
        <StatBox label="Velocity" value={stats.velocity} desc="Features / sprint" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Open Bugs" value={stats.openBugCount} desc={`${stats.bugCount} total`} color={stats.openBugCount > 0 ? 'rose' : 'emerald'} />
        <StatBox label="Est. Hours" value={stats.developmentHours?.estimated || 0} desc="Total estimated" />
        <StatBox label="Actual Hours" value={stats.developmentHours?.actual || 0} desc="Total spent" />
        <StatBox label="Avg Sprint Time" value={stats.avgSprintTimeMs ? `${Math.round(stats.avgSprintTimeMs / 86400000)}d` : '—'} desc="Average duration" />
      </div>
    </div>
  );
}

function StatBox({ label, value, desc, color = 'default' }) {
  const c = { default: 'text-white/90', rose: 'text-rose-400', emerald: 'text-emerald-400' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/30 border border-white/[0.05] rounded-xl p-4"
    >
      <div className={`text-base font-semibold tabular-nums ${c[color] || c.default}`}>{value}</div>
      <div className="text-xs font-medium text-nexus-subtle/50 mt-0.5">{label}</div>
      <div className="text-2xs text-nexus-subtle/20 mt-0.5">{desc}</div>
    </motion.div>
  );
}
