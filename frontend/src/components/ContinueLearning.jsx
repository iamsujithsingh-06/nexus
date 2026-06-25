import { motion } from 'framer-motion';

export default function ContinueLearning({ currentTopic, lastCompletedTopic, activePaths, onNavigate }) {
  if (!currentTopic && !lastCompletedTopic && (!activePaths || activePaths.length === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Continue Learning</h3>

      <div className="space-y-2">
        {currentTopic && (
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate?.('learning')}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-nexus-accent/10 to-nexus-accent/5 border border-nexus-accent/20 hover:border-nexus-accent/30 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-nexus-accent/15 border border-nexus-accent/25 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-nexus-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/90">Continue: {currentTopic.title}</div>
              {currentTopic.pathTitle && (
                <div className="text-2xs text-nexus-subtle/40 mt-0.5">{currentTopic.pathTitle}</div>
              )}
              {currentTopic.confidence > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 max-w-[60px] h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-nexus-accent/40" style={{ width: `${currentTopic.confidence}%` }} />
                  </div>
                  <span className="text-2xs text-nexus-subtle/30">Confidence: {currentTopic.confidence}%</span>
                </div>
              )}
            </div>
            <svg className="w-4 h-4 text-nexus-subtle/20 group-hover:text-nexus-subtle/50 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </motion.button>
        )}

        {!currentTopic && lastCompletedTopic && (
          <div className="p-3.5 rounded-xl bg-nexus-card/30 border border-white/[0.05]">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <div>
                <div className="text-xs text-nexus-subtle/70">Completed: {lastCompletedTopic.title}</div>
                <div className="text-2xs text-nexus-subtle/30 mt-0.5">
                  {lastCompletedTopic.daysAgo === 0 ? 'Today' : `${lastCompletedTopic.daysAgo} day(s) ago`}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePaths && activePaths.length > 0 && !currentTopic && (
          <div className="flex flex-wrap gap-1.5">
            {activePaths.slice(0, 3).map((p) => (
              <button
                key={p._id}
                onClick={() => onNavigate?.('learning')}
                className="text-2xs px-2 py-1 rounded-lg bg-nexus-card/30 border border-white/[0.05] text-nexus-subtle/50 hover:text-white/70 hover:border-white/[0.1] transition-all"
              >
                {p.title} ({p.progress}%)
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
