import { motion } from 'framer-motion';

export default function RoadmapView({ milestones, topics, onSelectTopic }) {
  if ((!milestones || milestones.length === 0) && (!topics || topics.length === 0)) {
    return (
      <div className="text-center py-8">
        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <p className="text-xs text-nexus-subtle/40">No roadmap generated yet</p>
      </div>
    );
  }

  const hasTopics = topics && topics.length > 0;

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />
      <div className="space-y-0">
        {(milestones || []).map((ms, i) => (
          <div key={i} className="relative pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 border transition-all ${
                ms.completed
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-nexus-card/50 border-white/[0.06]'
              }`}>
                <span className="text-xs">{ms.completed ? '✓' : '○'}</span>
              </div>
              <span className={`text-xs font-medium ${ms.completed ? 'text-nexus-subtle/60' : 'text-white/70'}`}>
                {ms.title}
              </span>
            </div>
          </div>
        ))}

        {hasTopics && (
          <div className="ml-[45px] space-y-1 pb-2">
            {topics.map((topic, i) => (
              <motion.button
                key={topic._id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelectTopic?.(topic)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                  topic.status === 'completed'
                    ? 'text-nexus-subtle/40'
                    : topic.status === 'in_progress'
                      ? 'text-nexus-accent bg-nexus-accent/8 border border-nexus-accent/15'
                      : 'text-nexus-subtle/60 hover:text-white/70 hover:bg-white/[0.02]'
                }`}
              >
                <span className="text-2xs w-4 text-nexus-subtle/20">{i + 1}</span>
                <span className="text-xs truncate">{topic.title}</span>
                {topic.status === 'completed' && (
                  <svg className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {topic.difficulty && (
                  <span className={`text-2xs px-1 py-0.5 rounded shrink-0 ${
                    topic.difficulty === 'beginner' ? 'text-emerald-400/50 bg-emerald-500/8' :
                    topic.difficulty === 'intermediate' ? 'text-amber-400/50 bg-amber-500/8' :
                    topic.difficulty === 'advanced' ? 'text-rose-400/50 bg-rose-500/8' :
                    'text-purple-400/50 bg-purple-500/8'
                  }`}>
                    {topic.difficulty === 'beginner' ? 'B' : topic.difficulty === 'intermediate' ? 'I' : topic.difficulty === 'advanced' ? 'A' : 'E'}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
