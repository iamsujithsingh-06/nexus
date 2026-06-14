import { motion } from 'framer-motion';

const categoryEmojis = {
  Coding: '💻',
  Learning: '📚',
  Workout: '💪',
};

const categoryColors = {
  Coding: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
  Learning: 'from-amber-500/10 to-amber-500/5 border-amber-500/15',
  Workout: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/15',
};

const accentColors = {
  Coding: 'text-blue-400',
  Learning: 'text-amber-400',
  Workout: 'text-emerald-400',
};

export default function StreakCard({ streak }) {
  const isMaintainedToday = streak.maintainedToday;
  const isActive = streak.currentStreak > 0;
  const isRecord = streak.currentStreak === streak.longestStreak && streak.currentStreak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-4 bg-gradient-to-br ${categoryColors[streak.category] || 'from-white/5 to-white/[0.02] border-white/[0.06]'} overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryEmojis[streak.category] || '🔥'}</span>
          <span className="text-xs font-medium text-nexus-subtle/60">{streak.category}</span>
        </div>
        {isRecord && (
          <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/15">
            Best
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-2xl font-bold tracking-tight ${isActive ? (accentColors[streak.category] || 'text-white') : 'text-nexus-subtle/30'}`}>
          {streak.currentStreak}
        </span>
        <span className="text-xs text-nexus-subtle/30">days</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMaintainedToday ? (
            <span className="flex items-center gap-1 text-2xs text-emerald-400/60">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Active today
            </span>
          ) : isActive ? (
            <span className="text-2xs text-nexus-subtle/20">Not yet today</span>
          ) : (
            <span className="text-2xs text-nexus-subtle/20">Inactive</span>
          )}
        </div>
        <span className="text-2xs text-nexus-subtle/20">
          Best: {streak.longestStreak}
        </span>
      </div>

      {isActive && (
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: Math.min(streak.currentStreak, 14) }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < streak.currentStreak
                  ? (streak.category === 'Coding' ? 'bg-blue-500/40' : streak.category === 'Learning' ? 'bg-amber-500/40' : 'bg-emerald-500/40')
                  : 'bg-white/5'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
