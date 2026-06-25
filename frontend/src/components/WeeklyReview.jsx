import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function WeeklyReview({ review, loading }) {
  if (loading) {
    return (
      <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 animate-pulse h-64" />
    );
  }
  if (!review) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/90">Weekly Review</h2>
        <span className="text-2xs text-nexus-subtle/30">{review.weekStart} — {review.weekEnd}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Summary label="Study Hours" value={`${review.studyHours}h`} />
        <Summary label="Tasks Done" value={review.completedTasks} />
        <Summary label="Topics Completed" value={review.completedTopics} />
        <Summary label="Active Days" value={`${review.activeDays}/7`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <span className="text-2xs text-nexus-subtle/30 block mb-1">Projects</span>
          <ProgressBar value={review.avgProjectProgress} size="sm" showLabel={false} />
          <span className="text-2xs text-nexus-subtle/20 mt-0.5 block">{review.avgProjectProgress}%</span>
        </div>
        <div>
          <span className="text-2xs text-nexus-subtle/30 block mb-1">Goals</span>
          <ProgressBar value={review.avgGoalProgress} size="sm" showLabel={false} />
          <span className="text-2xs text-nexus-subtle/20 mt-0.5 block">{review.avgGoalProgress}%</span>
        </div>
        <div>
          <span className="text-2xs text-nexus-subtle/30 block mb-1">Task Completion</span>
          <ProgressBar value={review.taskCompletionRate} size="sm" color={review.taskCompletionRate >= 70 ? 'high' : 'medium'} showLabel={false} />
          <span className="text-2xs text-nexus-subtle/20 mt-0.5 block">{review.taskCompletionRate}%</span>
        </div>
        <div>
          <span className="text-2xs text-nexus-subtle/30 block mb-1">Productivity</span>
          <ProgressBar value={review.avgProductivityScore} size="sm" color={review.avgProductivityScore >= 70 ? 'high' : 'medium'} showLabel={false} />
          <span className="text-2xs text-nexus-subtle/20 mt-0.5 block">{review.avgProductivityScore}/100</span>
        </div>
      </div>

      {review.achievements?.length > 0 && (
        <div className="mb-3">
          <span className="text-2xs text-emerald-400/60 uppercase tracking-wider mb-2 block">Achievements</span>
          <div className="space-y-1">
            {review.achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-emerald-400/50">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {review.areasToImprove?.length > 0 && (
        <div>
          <span className="text-2xs text-amber-400/60 uppercase tracking-wider mb-2 block">Areas to Improve</span>
          <div className="space-y-1">
            {review.areasToImprove.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-amber-400/50">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {review.dailyBreakdown?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <span className="text-2xs text-nexus-subtle/30 uppercase tracking-wider mb-2 block">Daily Breakdown</span>
          <div className="flex items-end gap-1.5 h-14">
            {review.dailyBreakdown.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full rounded-t-sm transition-all"
                  style={{ height: `${Math.max(4, d.score || 0)}%`, background: (d.score || 0) > 60 ? 'rgba(34,197,94,0.4)' : (d.score || 0) > 30 ? 'rgba(234,179,8,0.3)' : 'rgba(100,116,139,0.2)' }}
                />
                <span className="text-2xs text-nexus-subtle/20">{d.date?.slice(5, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="bg-nexus-card/20 border border-white/[0.03] rounded-lg p-3">
      <div className="text-sm font-semibold text-white/90 tabular-nums">{value}</div>
      <div className="text-2xs text-nexus-subtle/30 mt-0.5">{label}</div>
    </div>
  );
}
