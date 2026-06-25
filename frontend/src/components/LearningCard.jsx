import { motion } from 'framer-motion';

const categoryColors = {
  'Programming': 'from-blue-400/20 to-blue-500/10',
  'Web Development': 'from-sky-400/20 to-sky-500/10',
  'Artificial Intelligence': 'from-violet-400/20 to-violet-500/10',
  'Machine Learning': 'from-purple-400/20 to-purple-500/10',
  'Data Structures': 'from-emerald-400/20 to-emerald-500/10',
  'Algorithms': 'from-amber-400/20 to-amber-500/10',
  'System Design': 'from-rose-400/20 to-rose-500/10',
  'Cloud Computing': 'from-cyan-400/20 to-cyan-500/10',
  'DevOps': 'from-orange-400/20 to-orange-500/10',
  'Database': 'from-indigo-400/20 to-indigo-500/10',
  'Soft Skills': 'from-pink-400/20 to-pink-500/10',
  'Career': 'from-teal-400/20 to-teal-500/10',
};

const difficultyColors = {
  beginner: 'text-emerald-400/70 bg-emerald-500/10 border-emerald-500/15',
  intermediate: 'text-amber-400/70 bg-amber-500/10 border-amber-500/15',
  advanced: 'text-rose-400/70 bg-rose-500/10 border-rose-500/15',
  expert: 'text-purple-400/70 bg-purple-500/10 border-purple-500/15',
};

export default function LearningCard({ path, onClick, onDelete }) {
  const catColor = categoryColors[path.category] || 'from-nexus-accent/20 to-nexus-accent/10';
  const diffColor = difficultyColors[path.difficulty] || difficultyColors.beginner;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick?.(path)}
      className="group relative overflow-hidden rounded-xl bg-nexus-card/40 border border-white/[0.06] p-4 cursor-pointer hover:border-white/[0.12] hover:bg-nexus-card/60 transition-all"
    >
      <div className={`absolute inset-0 opacity-[0.04] bg-gradient-to-br ${catColor}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white/90 truncate">{path.title}</h3>
            {path.description && <p className="text-2xs text-nexus-subtle/40 mt-0.5 line-clamp-2">{path.description}</p>}
          </div>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <span className={`text-2xs px-1.5 py-0.5 rounded border ${diffColor}`}>{path.difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-nexus-subtle/50 border border-white/[0.04]">{path.category}</span>
          <span className={`text-2xs px-1.5 py-0.5 rounded ${
            path.status === 'active' ? 'bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15' :
            path.status === 'completed' ? 'bg-blue-500/10 text-blue-400/70 border border-blue-500/15' :
            path.status === 'paused' ? 'bg-amber-500/10 text-amber-400/70 border border-amber-500/15' :
            'bg-nexus-card/50 text-nexus-subtle/40 border border-white/[0.04]'
          }`}>{path.status}</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-nexus-subtle/40">{path.progress || 0}% complete</span>
            {path.actualHoursStudied > 0 && (
              <span className="text-2xs text-nexus-subtle/30">{path.actualHoursStudied}h studied</span>
            )}
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${path.progress || 0}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-nexus-accent to-blue-400"
              style={{ boxShadow: '0 0 6px rgba(96,165,250,0.15)' }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xs text-nexus-subtle/30">
            <span>{path.estimatedHours || '?'}h estimated</span>
            {path.targetCompletionDate && (
              <span>Due {new Date(path.targetCompletionDate).toLocaleDateString()}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(path._id); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-nexus-subtle/20 hover:text-red-400 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
