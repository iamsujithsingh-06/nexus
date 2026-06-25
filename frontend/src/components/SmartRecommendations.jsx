import { useMemo } from 'react';
import { motion } from 'framer-motion';

function isTaskDone(task) {
  return task.status === 'completed' || task.status === 'Completed';
}

export default function SmartRecommendations({ goal }) {
  const tasks = goal.tasks || [];

  const recommendations = useMemo(() => {
    const results = [];
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter((m) => m.completed).length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(isTaskDone).length;

    if (goal.status === 'Completed') {
      results.push({ type: 'celebrate', icon: '🎉', text: 'Congratulations! You have completed this goal. Great work!' });
      return results;
    }

    if (totalMilestones === 0) {
      results.push({ type: 'start', icon: '🚀', text: 'Start by breaking down your goal into milestones. Click "Add Milestone" to begin.' });
      return results;
    }

    const incompleteMilestones = goal.milestones.filter((m) => !m.completed);
    const currentMilestone = incompleteMilestones[0];

    if (completedMilestones === 0) {
      results.push({ type: 'start', icon: '💪', text: 'You have not completed any milestones yet. Focus on finishing the first one to build momentum.' });
    } else if (completedMilestones / totalMilestones >= 0.75) {
      results.push({ type: 'almost', icon: '📈', text: 'You are over 75% done! Push through the final milestones to complete this goal.' });
    } else if (completedMilestones / totalMilestones >= 0.5) {
      results.push({ type: 'halfway', icon: '👍', text: 'More than halfway there! Keep up the consistent effort.' });
    } else if (completedMilestones >= 1) {
      results.push({ type: 'progress', icon: '🔥', text: `You have completed ${completedMilestones} of ${totalMilestones} milestones. Keep going!` });
    }

    if (currentMilestone) {
      const msId = currentMilestone.id || currentMilestone._id;
      const milestoneTasks = tasks.filter((t) => {
        const tMsId = t.milestoneId || t.milestone_id;
        return tMsId && String(tMsId) === String(msId);
      });
      const doneMilestoneTasks = milestoneTasks.filter(isTaskDone).length;
      const msName = currentMilestone.name || currentMilestone.title;

      if (milestoneTasks.length > 0 && doneMilestoneTasks === 0) {
        results.push({ type: 'focus', icon: '🎯', text: `Start working on "${msName}". Complete the first task to get started.` });
      } else if (milestoneTasks.length > 0 && doneMilestoneTasks === milestoneTasks.length) {
        results.push({ type: 'next', icon: '✅', text: `All tasks in "${msName}" are done! Mark this milestone as complete.` });
      } else if (milestoneTasks.length > 0 && doneMilestoneTasks / milestoneTasks.length >= 0.5) {
        results.push({ type: 'close', icon: '📋', text: `You are over 50% through "${msName}". Complete ${milestoneTasks.length - doneMilestoneTasks} more task(s) to finish it.` });
      }
    }

    if (totalTasks > 0 && completedTasks === 0) {
      results.push({ type: 'first', icon: '🌟', text: 'Complete your first task to start tracking progress.' });
    }

    const now = new Date();
    const recentTasks = tasks.filter((t) => {
      if (!isTaskDone(t) || !t.updatedAt) return false;
      return (now - new Date(t.updatedAt)) < 7 * 24 * 60 * 60 * 1000;
    });
    if (recentTasks.length === 0 && completedTasks > 0) {
      results.push({ type: 'inactive', icon: '⏰', text: 'It has been a while since your last completed task. Try completing one small task to regain momentum.' });
    }

    if (goal.targetDate || goal.deadline) {
      const target = new Date(goal.targetDate || goal.deadline);
      const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 7) {
        results.push({ type: 'deadline', icon: '⏳', text: `Only ${daysLeft} day(s) left until your target date. Focus on the most important tasks.` });
      } else if (daysLeft < 0) {
        results.push({ type: 'overdue', icon: '📅', text: 'Your target date has passed. Consider updating it or adjusting your plan.' });
      }
    }

    return results.slice(0, 4);
  }, [goal, tasks]);

  if (recommendations.length === 0) return null;

  const typeStyles = {
    celebrate: 'bg-emerald-500/8 border-emerald-500/15',
    start: 'bg-nexus-accent/8 border-nexus-accent/15',
    focus: 'bg-amber-500/8 border-amber-500/15',
    inactive: 'bg-rose-500/8 border-rose-500/15',
    deadline: 'bg-amber-500/8 border-amber-500/15',
    overdue: 'bg-rose-500/8 border-rose-500/15',
    almost: 'bg-blue-500/8 border-blue-500/15',
    halfway: 'bg-emerald-500/8 border-emerald-500/15',
    progress: 'bg-nexus-accent/8 border-nexus-accent/15',
    next: 'bg-emerald-500/8 border-emerald-500/15',
    close: 'bg-amber-500/8 border-amber-500/15',
    first: 'bg-purple-500/8 border-purple-500/15',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">AI Suggestions</h3>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-start gap-2.5 p-3 rounded-xl border ${typeStyles[rec.type] || 'bg-white/[0.02] border-white/[0.04]'}`}
          >
            <span className="text-base leading-none mt-0.5">{rec.icon}</span>
            <p className="text-xs text-nexus-subtle/60 leading-relaxed">{rec.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
