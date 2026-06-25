import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function CoachCard({ card, loading }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-nexus-accent/5 to-transparent border border-nexus-accent/10 rounded-xl p-4 animate-pulse h-32" />
    );
  }
  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-nexus-accent/5 to-transparent border border-nexus-accent/10 rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white/90">{card.greeting}</h3>
          <p className="text-xs text-nexus-accent/60 mt-0.5">{card.todaysFocus}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {card.bestStreak > 0 && (
            <span className="flex items-center gap-1 text-2xs px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400/70">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 8 22 12 18 16"/><polyline points="6 8 2 12 6 16"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              {card.bestStreak}d streak
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xs text-nexus-subtle/40">Productivity</span>
          <div className="w-16">
            <ProgressBar value={card.productivityScore} size="sm" color={card.productivityScore >= 70 ? 'high' : card.productivityScore >= 40 ? 'medium' : 'low'} showLabel={false} />
          </div>
          <span className="text-xs font-semibold text-white/80 tabular-nums">{card.productivityScore}%</span>
        </div>
        {card.topGoal && (
          <div className="flex items-center gap-2">
            <span className="text-2xs text-nexus-subtle/40">Top goal</span>
            <span className="text-xs text-white/70 truncate max-w-[140px]">{card.topGoal.title}</span>
            {card.topGoal.progress !== undefined && <span className="text-2xs text-nexus-subtle/30">{card.topGoal.progress}%</span>}
          </div>
        )}
      </div>

      {card.motivationalMessage && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <p className="text-xs text-nexus-subtle/50 italic">{card.motivationalMessage}</p>
        </div>
      )}
    </motion.div>
  );
}
