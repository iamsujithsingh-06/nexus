import { motion } from 'framer-motion';

export default function RevisionPanel({ revisions, onComplete, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-nexus-card/20 border border-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!revisions || revisions.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-nexus-card/40 border border-white/[0.04] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
        <p className="text-xs text-nexus-subtle/40">No revisions due</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {revisions.map((rev, i) => (
        <motion.div
          key={rev._id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-nexus-card/30 border border-white/[0.05] hover:border-white/[0.08] transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/80">{rev.topicId?.title || 'Topic'}</div>
            <div className="text-2xs text-nexus-subtle/30">
              Due {new Date(rev.dueDate).toLocaleDateString()} ({Math.ceil((new Date(rev.dueDate) - new Date()) / 86400000)}d)
            </div>
          </div>
          <button
            onClick={() => onComplete?.(rev._id)}
            className="px-2.5 py-1 text-2xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80 rounded-lg hover:bg-emerald-500/20 transition-all shrink-0 opacity-0 group-hover:opacity-100"
          >
            Complete
          </button>
        </motion.div>
      ))}
    </div>
  );
}
