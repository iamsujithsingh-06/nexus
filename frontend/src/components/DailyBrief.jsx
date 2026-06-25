import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const urgencyStyles = {
  high: 'border-rose-500/20 bg-rose-500/6 text-rose-400/70',
  medium: 'border-amber-500/20 bg-amber-500/6 text-amber-400/70',
  low: 'border-white/[0.04] bg-nexus-card/20 text-nexus-subtle/50',
};

export default function DailyBrief({ brief, loading }) {
  if (loading) {
    return (
      <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 animate-pulse h-64" />
    );
  }
  if (!brief) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/90">
          {brief.greeting}
        </h2>
        <div className="flex items-center gap-2 text-2xs text-nexus-subtle/30">
          {brief.date && <span>{brief.date}</span>}
          {brief.currentStreak > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400/70">
              Streak: {brief.currentStreak}d
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-nexus-subtle/40">Today's focus:</span>
          <span className="text-xs font-medium text-white/80">{brief.todaysFocus}</span>
        </div>

        {brief.highestPriorityGoal && (
          <div className="bg-nexus-card/20 border border-white/[0.03] rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xs text-nexus-subtle/30 uppercase tracking-wider">Highest Priority Goal</span>
              <span className="text-2xs text-nexus-subtle/30">{brief.highestPriorityGoal.progress}%</span>
            </div>
            <p className="text-xs text-white/80">{brief.highestPriorityGoal.title}</p>
            <ProgressBar value={brief.highestPriorityGoal.progress} size="sm" className="mt-1.5" />
          </div>
        )}

        {brief.recommendedTasks?.length > 0 && (
          <div>
            <span className="text-2xs text-nexus-subtle/30 uppercase tracking-wider mb-2 block">Recommended Tasks</span>
            <div className="space-y-1">
              {brief.recommendedTasks.map((t, i) => (
                <div key={t._id || i} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-nexus-accent/50 shrink-0" />
                  <span className="flex-1">{t.title}</span>
                  <span className={`text-2xs px-1.5 py-0.5 rounded border ${urgencyStyles[t.priority] || urgencyStyles.low}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-2xs text-nexus-subtle/30 pt-2 border-t border-white/[0.04]">
          {brief.activeProjects > 0 && <span>{brief.activeProjects} active projects</span>}
          {brief.avgGoalProgress > 0 && <span>Goal progress: {brief.avgGoalProgress}%</span>}
          {brief.estimatedStudyTime > 0 && <span>Est. {brief.estimatedStudyTime}min of work</span>}
          {brief.weeklyActiveDays > 0 && <span>{brief.weeklyActiveDays}/7 active days</span>}
        </div>
      </div>

      {brief.motivationalMessage && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <p className="text-xs text-nexus-subtle/50 italic">{brief.motivationalMessage}</p>
        </div>
      )}
    </motion.div>
  );
}
