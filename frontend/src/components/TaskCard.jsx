import { motion } from 'framer-motion';

const priorityColors = {
  critical: 'border-rose-500/30 bg-rose-500/8',
  high: 'border-orange-500/25 bg-orange-500/6',
  medium: 'border-nexus-accent/20 bg-nexus-accent/5',
  low: 'border-white/[0.04] bg-nexus-card/20',
};

const priorityBadge = {
  critical: 'text-rose-400/80 bg-rose-500/10 border-rose-500/20',
  high: 'text-orange-400/80 bg-orange-500/10 border-orange-500/20',
  medium: 'text-nexus-accent/70 bg-nexus-accent/10 border-nexus-accent/20',
  low: 'text-nexus-subtle/40 bg-nexus-card/40 border-white/[0.04]',
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const isDueToday = task.dueDate && task.status !== 'completed' && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        task.status === 'completed'
          ? 'bg-nexus-card/20 border-white/[0.03] opacity-70'
          : priorityColors[task.priority] || priorityColors.medium
      } hover:border-white/[0.1]`}
    >
      <button
        onClick={() => onToggle?.(task._id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          task.status === 'completed'
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : task.status === 'in_progress'
              ? 'border-nexus-accent bg-nexus-accent/10'
              : 'border-white/15 hover:border-nexus-accent/40'
        }`}
      >
        {task.status === 'completed' && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        )}
        {task.status === 'in_progress' && (
          <div className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-nexus-subtle/40 line-through' : 'text-white/85'}`}>
            {task.title}
          </span>
          <span className={`text-2xs px-1.5 py-0.5 rounded border ${priorityBadge[task.priority] || priorityBadge.medium}`}>
            {task.priority}
          </span>
          {isOverdue && (
            <span className="text-2xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400/70 border border-rose-500/15">Overdue</span>
          )}
          {isDueToday && !isOverdue && (
            <span className="text-2xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/15">Today</span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-nexus-subtle/40 mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-2xs text-nexus-subtle/30">
          {task.category && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.03]">{task.category}</span>
          )}
          {task.estimatedTime > 0 && (
            <span>{task.estimatedTime}min</span>
          )}
          {task.dueDate && (
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
          {task.actualTime > 0 && (
            <span>Actual: {task.actualTime}min</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onEdit?.(task)}
          className="p-1.5 text-nexus-subtle/20 hover:text-nexus-accent/70 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          onClick={() => onDelete?.(task._id)}
          className="p-1.5 text-nexus-subtle/20 hover:text-red-400 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </motion.div>
  );
}
