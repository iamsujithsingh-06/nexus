import { motion } from 'framer-motion';

const cards = [
  {
    key: 'streak',
    icon: StreakCardIcon,
    title: 'Current Streak',
    getValue: (d) => `${d.streak || 0} days`,
    desc: (d) => d.streak > 0 ? 'Keep going!' : 'Start a streak today',
    color: 'from-orange-500/10 to-amber-500/5',
    border: 'border-orange-500/15',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/15',
    iconBorder: 'border-orange-500/20',
  },
  {
    key: 'goal',
    icon: GoalCardIcon,
    title: 'Current Goal',
    getValue: (d) => d.currentGoal?.title || 'No goal set',
    desc: (d) => d.currentGoal ? `${d.currentGoal.progress || 0}% complete` : 'Create your first goal',
    color: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/15',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15',
    iconBorder: 'border-blue-500/20',
  },
  {
    key: 'tasks',
    icon: TasksCardIcon,
    title: 'Pending Tasks',
    getValue: (d) => `${d.pendingTasks ?? 0}`,
    desc: (d) => d.pendingTasks > 0 ? `${d.todayTasks ?? 0} due today` : 'All caught up!',
    color: 'from-emerald-500/10 to-green-500/5',
    border: 'border-emerald-500/15',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/15',
    iconBorder: 'border-emerald-500/20',
  },
  {
    key: 'learning',
    icon: LearningCardIcon,
    title: 'Learning Progress',
    getValue: (d) => `${d.learningProgress || 0}%`,
    desc: (d) => d.learningProgress > 0 ? `${d.lessonsCompleted || 0} lessons done` : 'Start learning',
    color: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-500/15',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/15',
    iconBorder: 'border-violet-500/20',
  },
  {
    key: 'chats',
    icon: ChatsCardIcon,
    title: 'Recent Chats',
    getValue: (d) => `${d.recentChats ?? 0}`,
    desc: (d) => d.recentChats > 0 ? 'Sessions active' : 'Start a conversation',
    color: 'from-rose-500/10 to-pink-500/5',
    border: 'border-rose-500/15',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/15',
    iconBorder: 'border-rose-500/20',
  },
];

export default function OverviewCards({ data = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
          className={`group relative bg-gradient-to-br ${card.color} bg-nexus-card/30 border ${card.border} rounded-xl p-3.5 hover:bg-nexus-card/50 hover:-translate-y-0.5 transition-all duration-300 cursor-default overflow-hidden`}
        >
          <div className={`w-8 h-8 rounded-lg ${card.iconBg} border ${card.iconBorder} flex items-center justify-center mb-2.5 transition-all duration-300`}>
            <card.icon />
          </div>
          <div className="text-lg font-semibold text-white/90 tracking-tight">{card.getValue(data)}</div>
          <div className="text-2xs text-nexus-subtle/40 mt-0.5">{card.title}</div>
          <div className="text-2xs text-nexus-subtle/25 mt-0.5">{card.desc(data)}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StreakCardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
}

function GoalCardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

function TasksCardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}

function LearningCardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

function ChatsCardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
