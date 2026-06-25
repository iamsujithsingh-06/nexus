import { motion } from 'framer-motion';

const statCards = [
  { key: 'totalGoals', label: 'Total Goals', icon: '🎯', color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20' },
  { key: 'activeGoals', label: 'Active', icon: '⚡', color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' },
  { key: 'completedGoals', label: 'Completed', icon: '✅', color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20' },
  { key: 'overdueGoals', label: 'Overdue', icon: '⚠️', color: 'from-rose-500/10 to-rose-600/5 border-rose-500/20' },
  { key: 'overallProgress', label: 'Progress', icon: '📈', color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20', isPercent: true },
  { key: 'completionRate', label: 'Task Rate', icon: '📊', color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20', isPercent: true },
];

export default function GoalStatistics({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-nexus-card/20 border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  const getValue = (key) => {
    if (key === 'overallProgress' || key === 'completionRate') {
      return stats[key] || 0;
    }
    return stats[key] ?? 0;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((card, i) => {
        const value = getValue(card.key);
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-3.5 bg-gradient-to-br ${card.color} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-nexus-subtle/50 font-medium">{card.label}</span>
              <span className="text-sm">{card.icon}</span>
            </div>
            <div className="text-lg font-semibold text-white/90">
              {card.isPercent ? `${value}%` : value}
            </div>
            {card.isPercent && (
              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, value)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-current to-transparent"
                  style={{ backgroundColor: value >= 50 ? '#34D399' : value >= 25 ? '#FBBF24' : '#F87171' }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
