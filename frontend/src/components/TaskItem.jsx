import { motion } from 'framer-motion';

const categoryStyles = {
  Coding: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Learning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Workout: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Other: 'bg-white/5 text-nexus-subtle/50 border-white/10',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
        task.status === 'Completed'
          ? 'bg-emerald-500/3 border-emerald-500/8'
          : 'bg-nexus-card/30 border-white/[0.04] hover:border-white/[0.08]'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
          task.status === 'Completed'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'border-white/10 hover:border-nexus-accent/30'
        }`}
        style={{ width: '18px', height: '18px' }}
      >
        {task.status === 'Completed' && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`text-sm ${task.status === 'Completed' ? 'text-nexus-subtle/30 line-through' : 'text-white/80'}`}>
          {task.title}
        </div>
        {task.description && (
          <div className={`text-xs mt-0.5 ${task.status === 'Completed' ? 'text-nexus-subtle/15' : 'text-nexus-subtle/40'}`}>
            {task.description}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${categoryStyles[task.category] || categoryStyles.Other}`}>
            {task.category}
          </span>
          {task.dueDate && (
            <span className="text-2xs text-nexus-subtle/30">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.goalId && (
            <span className="text-2xs text-nexus-accent/40">Linked to goal</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit?.(task)} className="p-1.5 rounded-lg hover:bg-nexus-accent/10 text-nexus-subtle/20 hover:text-nexus-accent transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button onClick={() => onDelete?.(task.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-nexus-subtle/20 hover:text-red-400 transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
