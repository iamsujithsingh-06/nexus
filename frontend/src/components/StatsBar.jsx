import { motion } from 'framer-motion';

const statItems = [
  { label: 'Chats', getValue: (d) => d.chats, icon: ChatStatsIcon, trend: '+2 today' },
  { label: 'Memories', getValue: (d) => d.memories, icon: MemoryStatsIcon, trend: '+5 today' },
  { label: 'Goals', getValue: (d) => d.goals, icon: GoalStatsIcon, trend: '+1 this week' },
  { label: 'Projects', getValue: (d) => d.projects, icon: ProjectStatsIcon, trend: '2 active' },
];

export default function StatsBar({ data = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2.5"
    >
      {statItems.map((item, i) => {
        const value = item.getValue(data);
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
            className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-3 hover:bg-nexus-card/50 hover:border-white/[0.08] transition-all duration-300 group"
          >
            <div className="w-9 h-9 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center shrink-0 group-hover:bg-nexus-accent/12 group-hover:border-nexus-accent/20 transition-all duration-300">
              <item.icon />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/90">{value ?? '--'}</div>
              <div className="text-2xs text-nexus-subtle/40">{item.label}</div>
              <div className="text-2xs text-emerald-400/60">{item.trend}</div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function ChatStatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function MemoryStatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function GoalStatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function ProjectStatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
    </svg>
  );
}
