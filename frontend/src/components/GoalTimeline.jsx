import { motion } from 'framer-motion';

const typeIcons = {
  created: { icon: '🎯', bg: 'bg-blue-500/20 text-blue-300' },
  milestone: { icon: '📍', bg: 'bg-amber-500/20 text-amber-300' },
  milestone_completed: { icon: '✅', bg: 'bg-emerald-500/20 text-emerald-300' },
  task_completed: { icon: '✔️', bg: 'bg-emerald-500/20 text-emerald-300' },
  started: { icon: '🚀', bg: 'bg-violet-500/20 text-violet-300' },
  paused: { icon: '⏸️', bg: 'bg-amber-500/20 text-amber-300' },
  completed: { icon: '🏆', bg: 'bg-emerald-500/20 text-emerald-300' },
  deadline: { icon: '⏰', bg: 'bg-rose-500/20 text-rose-300' },
};

export default function GoalTimeline({ events, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-nexus-card/30" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-nexus-card/20" />
              <div className="h-2 w-48 rounded bg-nexus-card/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-2xl mb-2 block">📋</span>
        <p className="text-xs text-nexus-subtle/40">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />
      <div className="space-y-0">
        {events.map((event, i) => {
          const meta = typeIcons[event.type] || { icon: '📌', bg: 'bg-white/10 text-white/60' };
          return (
            <motion.div
              key={`${event.type}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-3 pb-4 last:pb-0 relative"
            >
              <div className={`shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs ${meta.bg} z-10`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">{event.label}</span>
                  <span className="text-2xs text-nexus-subtle/30">
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-2xs text-nexus-subtle/50 mt-0.5 line-clamp-2">{event.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
