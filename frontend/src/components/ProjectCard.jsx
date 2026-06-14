import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const categoryColors = {
  Software: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Design: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  Writing: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Learning: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Other: 'bg-white/5 text-nexus-subtle/50 border-white/10',
};

export default function ProjectCard({ project, onEdit, onDelete, onComplete, onReactivate }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl p-4 border transition-all duration-200 group ${
        project.status === 'Completed'
          ? 'bg-nexus-card/30 border-white/[0.04]'
          : 'bg-nexus-card/40 border-white/[0.06] hover:border-nexus-accent/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${project.status === 'Completed' ? 'text-nexus-subtle/60' : 'text-white/90'}`}>
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-nexus-subtle/40 mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {project.status === 'Active' ? (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete?.(project.id); }}
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-nexus-subtle/30 hover:text-emerald-400 transition-all"
              title="Mark complete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onReactivate?.(project.id); }}
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-nexus-subtle/30 hover:text-amber-400 transition-all"
              title="Reactivate"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
            className="p-1.5 rounded-lg hover:bg-nexus-accent/10 text-nexus-subtle/30 hover:text-nexus-accent transition-all"
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(project.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-nexus-subtle/30 hover:text-red-400 transition-all"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${categoryColors[project.category] || categoryColors.Other}`}>
          {project.category}
        </span>
      </div>

      {project.status === 'Active' && (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <ProgressBar value={project.progress} size="sm" color="high" showLabel={false} />
          </div>
          <span className="text-2xs text-nexus-subtle/30 shrink-0">{project.progress}%</span>
        </div>
      )}
    </motion.div>
  );
}
