import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllTasks } from '../services/taskService';

const milestoneIcons = [
  '🔍', '📚', '🛠️', '🎯', '🚀', '🎨', '📊', '🏆',
];

export default function GoalRoadmap({ goal }) {
  const tasks = useMemo(() => {
    return getAllTasks().filter((t) => t.goalId === goal.id);
  }, [goal.id, goal.taskIds]);

  const tasksByMilestone = useMemo(() => {
    const map = {};
    goal.milestones.forEach((m) => {
      map[m.id] = tasks.filter((t) => t.milestoneId === m.id);
    });
    return map;
  }, [goal.milestones, tasks]);

  const completedCount = goal.milestones.filter((m) => m.completed).length;
  const totalCount = goal.milestones.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (totalCount === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Goal Roadmap</h3>

      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="flex-1">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-nexus-accent to-blue-400"
              style={{ boxShadow: '0 0 8px rgba(96,165,250,0.15)' }}
            />
          </div>
        </div>
        <span className="text-xs text-nexus-subtle/40 whitespace-nowrap">{completedCount}/{totalCount} milestones</span>
      </div>

      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/[0.06]" />

        <div className="space-y-3">
          {goal.milestones.map((ms, i) => {
            const msTasks = tasksByMilestone[ms.id] || [];
            const doneTasks = msTasks.filter((t) => t.status === 'Completed').length;
            const isCurrent = !ms.completed && (i === 0 || goal.milestones[i - 1].completed);
            const isCompleted = ms.completed;

            return (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex gap-4"
              >
                <div className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/40'
                    : isCurrent
                      ? 'bg-nexus-accent/15 border-nexus-accent/30'
                      : 'bg-nexus-card/50 border-white/[0.06]'
                }`}>
                  <span className="text-xs">{isCompleted ? '✓' : milestoneIcons[i % milestoneIcons.length]}</span>
                </div>

                <div className={`flex-1 min-w-0 pb-1 ${isCompleted ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-sm font-medium ${isCompleted ? 'text-nexus-subtle/60' : 'text-white/90'}`}>
                      {ms.name}
                    </span>
                    {isCompleted && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">Done</span>
                    )}
                    {isCurrent && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-nexus-accent/10 text-nexus-accent/70 border border-nexus-accent/15">In Progress</span>
                    )}
                  </div>

                  {msTasks.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 max-w-[120px] h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nexus-accent/40 transition-all duration-300"
                          style={{ width: `${msTasks.length > 0 ? (doneTasks / msTasks.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-2xs text-nexus-subtle/30">{doneTasks}/{msTasks.length} tasks</span>
                    </div>
                  )}

                  {msTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {msTasks.slice(0, 4).map((t) => (
                        <span key={t.id} className={`text-2xs px-1.5 py-0.5 rounded ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/8 text-emerald-400/50'
                            : 'bg-white/[0.03] text-nexus-subtle/30'
                        }`}>
                          {t.status === 'Completed' ? '✓ ' : ''}{t.title.length > 28 ? t.title.slice(0, 26) + '…' : t.title}
                        </span>
                      ))}
                      {msTasks.length > 4 && (
                        <span className="text-2xs text-nexus-subtle/20">+{msTasks.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
