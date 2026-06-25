import { motion } from 'framer-motion';

export default function TaskStatistics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="h-40 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
        <div className="h-40 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
      >
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Category Breakdown</h3>
        {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
          <div className="space-y-2">
            {stats.categoryBreakdown.map((c) => (
              <div key={c._id} className="flex items-center gap-3">
                <span className="text-xs text-nexus-subtle/70 w-20 shrink-0 capitalize">{c._id}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? (c.count / stats.total) * 100 : 0}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-nexus-accent to-blue-400"
                  />
                </div>
                <span className="text-2xs text-nexus-subtle/30 w-16 text-right">{c.completed}/{c.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-nexus-subtle/20 text-center py-4">No data yet</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
      >
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <SummaryItem label="Total" value={stats.total} />
          <SummaryItem label="Completed" value={stats.completed} color="emerald" />
          <SummaryItem label="Pending" value={stats.pending} color="amber" />
          <SummaryItem label="In Progress" value={stats.inProgress} color="blue" />
          <SummaryItem label="Overdue" value={stats.overdue} color="rose" />
          <SummaryItem label="Completed Today" value={stats.completedToday} color="emerald" />
          <SummaryItem label="This Week" value={stats.weeklyCompleted || 0} color="purple" />
          <SummaryItem label="Rate" value={`${stats.completionRate || 0}%`} />
        </div>
      </motion.div>
    </div>
  );
}

function SummaryItem({ label, value, color = 'white' }) {
  const colorMap = {
    white: 'text-white/90',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="bg-nexus-card/20 border border-white/[0.03] rounded-lg p-3">
      <div className={`text-sm font-semibold tabular-nums ${colorMap[color] || colorMap.white}`}>{value}</div>
      <div className="text-2xs text-nexus-subtle/30 mt-0.5">{label}</div>
    </div>
  );
}
