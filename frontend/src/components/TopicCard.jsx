import { motion } from 'framer-motion';

const statusStyles = {
  completed: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
  in_progress: 'bg-nexus-accent/15 border-nexus-accent/25 text-nexus-accent',
  pending: 'bg-white/5 border-white/[0.06] text-nexus-subtle/40',
  skipped: 'bg-rose-500/10 border-rose-500/15 text-rose-400/60',
};

const difficultyDots = {
  beginner: 1, intermediate: 2, advanced: 3, expert: 4,
};

export default function TopicCard({ topic, onToggle, onDelete, pathId }) {
  const dots = difficultyDots[topic.difficulty] || 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-nexus-card/20 border border-white/[0.04] hover:border-white/[0.08] transition-all"
    >
      <button
        onClick={() => onToggle?.(topic._id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          topic.status === 'completed'
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : topic.status === 'in_progress'
              ? 'border-nexus-accent bg-nexus-accent/10'
              : 'border-white/10 hover:border-nexus-accent/40'
        }`}
      >
        {topic.status === 'completed' && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {topic.status === 'in_progress' && (
          <div className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${topic.status === 'completed' ? 'text-nexus-subtle/50 line-through' : 'text-white/80'}`}>
            {topic.title}
          </span>
          <span className={`text-2xs px-1 py-0.5 rounded border ${statusStyles[topic.status] || statusStyles.pending}`}>
            {topic.status === 'in_progress' ? 'In Progress' : topic.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-nexus-subtle/30' : 'bg-white/[0.04]'}`} />
            ))}
          </div>
          {topic.confidenceScore > 0 && (
            <span className="text-2xs text-nexus-subtle/30">
              Confidence: {topic.confidenceScore}%
            </span>
          )}
          {topic.timeSpent > 0 && (
            <span className="text-2xs text-nexus-subtle/20">
              {topic.timeSpent.toFixed(1)}h
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete?.(topic._id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-nexus-subtle/20 hover:text-red-400 transition-all shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </motion.div>
  );
}
