import { motion } from 'framer-motion';

const cards = [
  { key: 'active', label: 'Active', icon: ActiveIcon, color: 'from-blue-400 to-blue-500' },
  { key: 'completed', label: 'Completed', icon: CheckIcon, color: 'from-emerald-400 to-emerald-500' },
  { key: 'overallProgress', label: 'Progress', icon: PercentIcon, color: 'from-purple-400 to-purple-500', suffix: '%' },
  { key: 'openBugs', label: 'Open Bugs', icon: BugIcon, color: 'from-rose-400 to-rose-500' },
  { key: 'totalFeatures', label: 'Features', icon: ListIcon, color: 'from-cyan-400 to-cyan-500' },
  { key: 'activeSprints', label: 'Active Sprints', icon: SprintIcon, color: 'from-amber-400 to-amber-500' },
];

export default function ProjectsDashboard({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((item, i) => {
        const value = data[item.key] ?? 0;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative overflow-hidden rounded-xl bg-nexus-card/40 border border-white/[0.06] p-3 group hover:border-white/[0.1] transition-all"
          >
            <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${item.color}`} />
            <div className="relative z-10">
              <item.icon className="w-3.5 h-3.5 text-nexus-subtle/40 mb-1.5" />
              <div className="text-lg font-semibold text-white/90 tabular-nums">{value}{item.suffix || ''}</div>
              <div className="text-2xs text-nexus-subtle/40 mt-0.5">{item.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ActiveIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function CheckIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function PercentIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; }
function BugIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M4 8h16"/><path d="M4 8v6a8 8 0 0 0 16 0V8"/><path d="M4 14H2"/><path d="M20 14h2"/><path d="M9 20l-1 2"/><path d="M15 20l1 2"/></svg>; }
function ListIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function SprintIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
