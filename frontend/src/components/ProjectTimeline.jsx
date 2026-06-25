import { motion } from 'framer-motion';

const typeConfig = {
  feature: { icon: FeatureIcon, color: 'border-blue-500/20 bg-blue-500/6' },
  sprint: { icon: SprintIcon, color: 'border-amber-500/20 bg-amber-500/6' },
  bug: { icon: BugIcon, color: 'border-rose-500/20 bg-rose-500/6' },
  task: { icon: TaskIcon, color: 'border-emerald-500/20 bg-emerald-500/6' },
};

export default function ProjectTimeline({ timeline = [], loading }) {
  if (loading) {
    return (
      <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-4">
        <div className="h-48 animate-pulse bg-white/[0.02] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-4">
      <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-4">Timeline</h3>
      {timeline.length === 0 ? (
        <p className="text-xs text-nexus-subtle/20 text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          {timeline.map((event, i) => {
            const cfg = typeConfig[event.type] || typeConfig.task;
            return (
              <motion.div
                key={`${event.type}-${event.title}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg border ${cfg.color}`}
              >
                <cfg.icon className="w-3.5 h-3.5 text-nexus-subtle/40 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70 truncate">{event.title}</span>
                    <span className="text-2xs text-nexus-subtle/30 capitalize shrink-0">{event.action}</span>
                  </div>
                  <span className="text-2xs text-nexus-subtle/20">{new Date(event.date).toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeatureIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function SprintIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
function BugIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M4 8h16"/><path d="M4 8v6a8 8 0 0 0 16 0V8"/><path d="M4 14H2"/><path d="M20 14h2"/><path d="M9 20l-1 2"/><path d="M15 20l1 2"/></svg>; }
function TaskIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
