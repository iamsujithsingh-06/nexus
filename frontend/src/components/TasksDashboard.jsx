import { motion } from 'framer-motion';

const stats = [
  { key: 'total', label: 'Total Tasks', icon: ListIcon, color: 'from-blue-400 to-blue-500' },
  { key: 'completedToday', label: 'Done Today', icon: CheckIcon, color: 'from-emerald-400 to-emerald-500' },
  { key: 'overdue', label: 'Overdue', icon: AlertIcon, color: 'from-rose-400 to-rose-500' },
  { key: 'completionRate', label: 'Completion Rate', icon: PercentIcon, color: 'from-purple-400 to-purple-500', suffix: '%' },
];

export default function TasksDashboard({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-nexus-card/30 border border-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((item, i) => {
        const value = item.key === 'completionRate' ? (data[item.key] ?? 0) : (data[item.key] ?? 0);
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl bg-nexus-card/40 border border-white/[0.06] p-3.5 group hover:border-white/[0.1] transition-all"
          >
            <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${item.color}`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <item.icon className="w-4 h-4 text-nexus-subtle/40" />
                {item.key === 'overdue' && data.overdue > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </div>
              <div className="text-lg font-semibold text-white/90 tabular-nums">
                {value}{item.suffix || ''}
              </div>
              <div className="text-2xs text-nexus-subtle/40 mt-0.5">{item.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ListIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function CheckIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>;
}
function AlertIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function PercentIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
}
