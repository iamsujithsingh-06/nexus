import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const categoryColors = {
  Career: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  Learning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Coding: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Health: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Fitness: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Finance: 'bg-green-500/10 text-green-300 border-green-500/20',
  Personal: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  Projects: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Business: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  General: 'bg-white/5 text-white/50 border-white/10',
};

const priorityLabels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
const priorityColors = { critical: 'text-rose-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-nexus-subtle/40' };

function getDaysLeft(deadline) {
  if (!deadline) return null;
  const diff = Math.round((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function GoalCard({ goal, onEdit, onDelete, onComplete, onReactivate, onClick }) {
  const completedMilestones = (goal.milestones || []).filter(m => m.completed || m.status === 'completed').length;
  const totalMilestones = (goal.milestones || []).length;
  const daysLeft = getDaysLeft(goal.deadline);
  const deadlineColor = daysLeft <= 0 ? 'text-rose-400' : daysLeft <= 3 ? 'text-orange-400' : 'text-nexus-subtle/40';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-nexus-card/40 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 hover:border-nexus-accent/20 hover:bg-nexus-card/60 transition-all duration-200 cursor-pointer"
      onClick={() => onClick?.(goal)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`text-2xs font-medium px-2 py-0.5 rounded-md border ${categoryColors[goal.category] || categoryColors.General}`}>
              {goal.category || 'General'}
            </span>
            {goal.priorityLabel && (
              <span className={`text-2xs font-medium ${priorityColors[goal.priorityLabel] || priorityColors.medium}`}>
                {priorityLabels[goal.priorityLabel] || goal.priorityLabel}
              </span>
            )}
            {goal.status === 'paused' && (
              <span className="text-2xs text-amber-400/60 font-medium">⏸ Paused</span>
            )}
            {goal.status === 'planned' && (
              <span className="text-2xs text-blue-400/60 font-medium">📋 Planned</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/90 truncate">{goal.title || goal.name}</h3>
          {goal.description && (
            <p className="text-xs text-nexus-subtle/50 mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {(goal.status === 'active' || goal.status === 'Active') ? (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete?.(goal._id || goal.id); }}
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-nexus-subtle/30 hover:text-emerald-400 transition-all"
              title="Mark complete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onReactivate?.(goal._id || goal.id); }}
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-nexus-subtle/30 hover:text-amber-400 transition-all"
              title="Reactivate"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(goal); }}
            className="p-1.5 rounded-lg hover:bg-nexus-accent/10 text-nexus-subtle/30 hover:text-nexus-accent transition-all"
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(goal._id || goal.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-nexus-subtle/30 hover:text-red-400 transition-all"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar value={goal.progress || 0} size="sm" showLabel={false} />
        <div className="flex items-center justify-between text-2xs text-nexus-subtle/40">
          <span className="font-medium">{goal.progress || 0}% complete</span>
          <div className="flex items-center gap-3">
            {totalMilestones > 0 && <span>{completedMilestones}/{totalMilestones} milestones</span>}
            {daysLeft !== null && (
              <span className={deadlineColor}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
