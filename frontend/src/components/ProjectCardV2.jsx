import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const catColors = {
  'Web Development': 'border-blue-500/20 bg-blue-500/10 text-blue-300',
  AI: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
  'Machine Learning': 'border-purple-500/20 bg-purple-500/10 text-purple-300',
  Mobile: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  'Game Development': 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  Research: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  Personal: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
  Business: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  'Open Source': 'border-green-500/20 bg-green-500/10 text-green-300',
  Other: 'border-white/[0.06] bg-white/[0.03] text-nexus-subtle/50',
};

const prioDots = { critical: 'bg-rose-400', high: 'bg-orange-400', medium: 'bg-nexus-accent', low: 'bg-white/20' };

export default function ProjectCardV2({ project, onOpen, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-nexus-card/30 border border-white/[0.05] hover:border-white/[0.1] rounded-xl p-4 transition-all cursor-pointer"
      onClick={() => onOpen?.(project)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${prioDots[project.priority] || prioDots.medium}`} />
            <h3 className="text-sm font-medium text-white/90 truncate">{project.title}</h3>
          </div>
          {project.description && (
            <p className="text-xs text-nexus-subtle/40 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
          {project.status === 'active' ? (
            <button onClick={(e) => { e.stopPropagation(); onStatusChange?.(project._id, 'completed'); }}
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-nexus-subtle/30 hover:text-emerald-400" title="Complete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onStatusChange?.(project._id, 'active'); }}
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-nexus-subtle/30 hover:text-amber-400" title="Reactivate">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
            className="p-1.5 rounded-lg hover:bg-nexus-accent/10 text-nexus-subtle/30 hover:text-nexus-accent" title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(project._id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-nexus-subtle/30 hover:text-red-400" title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-2xs px-1.5 py-0.5 rounded border ${catColors[project.category] || catColors.Other}`}>{project.category}</span>
        {project.status && (
          <span className={`text-2xs px-1.5 py-0.5 rounded border ${
            project.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400/70'
            : project.status === 'paused' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400/70'
            : project.status === 'completed' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400/70'
            : 'border-white/[0.04] bg-white/[0.03] text-nexus-subtle/40'
          }`}>{project.status}</span>
        )}
      </div>

      {project.techStack?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {project.techStack.slice(0, 4).map(t => (
            <span key={t} className="text-2xs text-nexus-subtle/30 bg-white/[0.03] px-1.5 py-0.5 rounded">{t}</span>
          ))}
          {project.techStack.length > 4 && <span className="text-2xs text-nexus-subtle/20">+{project.techStack.length - 4}</span>}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1">
          <ProgressBar value={project.progress} size="sm" color={project.progress >= 80 ? 'high' : project.progress >= 40 ? 'medium' : 'low'} showLabel={false} />
        </div>
        <span className="text-2xs text-nexus-subtle/30 shrink-0">{project.progress}%</span>
        {project.version && <span className="text-2xs text-nexus-subtle/20 ml-auto">{project.version}</span>}
      </div>
    </motion.div>
  );
}
