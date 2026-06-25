import { motion } from 'framer-motion';

export default function MilestoneCard({ milestone, onToggle, onEdit, onDelete, index = 0 }) {
  const isCompleted = milestone.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
        isCompleted
          ? 'bg-emerald-500/5 border-emerald-500/10'
          : 'bg-nexus-card/20 border-white/[0.04] hover:border-white/[0.08]'
      }`}
    >
      <button
        onClick={() => onToggle(milestone._id)}
        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/20 hover:border-nexus-accent/40'
        }`}
      >
        {isCompleted && (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${isCompleted ? 'text-emerald-300/70 line-through' : 'text-white/70'}`}>
          {milestone.title}
        </p>
        {milestone.description && (
          <p className="text-2xs text-nexus-subtle/40 mt-0.5 line-clamp-1">{milestone.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {milestone.phase && (
          <span className="text-2xs text-nexus-subtle/30 px-1.5 py-0.5 rounded bg-white/5">{milestone.phase}</span>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(milestone)}
            className="p-1 rounded hover:bg-nexus-accent/10 text-nexus-subtle/30 hover:text-nexus-accent/60 transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(milestone._id)}
            className="p-1 rounded hover:bg-red-500/10 text-nexus-subtle/30 hover:text-red-400/60 transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
