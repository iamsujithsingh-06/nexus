import { motion } from 'framer-motion';

const actions = [
  { id: 'newChat', icon: ChatActionIcon, label: 'New Chat', desc: 'Start a conversation', shortcut: 'Ctrl+K' },
  { id: 'memory', icon: BrainActionIcon, label: 'Remember Something', desc: 'Store a memory', shortcut: 'Ctrl+M' },
  { id: 'goals', icon: GoalActionIcon, label: 'Create Goal', desc: 'Set a new objective', shortcut: 'Ctrl+G' },
  { id: 'learning', icon: LearnActionIcon, label: 'Continue Learning', desc: 'Pick up where you left', shortcut: 'Ctrl+L' },
  { id: 'projects', icon: ProjectActionIcon, label: 'Open Projects', desc: 'View your workspace', shortcut: 'Ctrl+P' },
  { id: 'journal', icon: JournalActionIcon, label: 'Daily Journal', desc: 'Reflect on your day', shortcut: 'Ctrl+J' },
];

export default function QuickActions({ onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.04, duration: 0.35 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAction?.(action.id)}
            className="group relative bg-nexus-card/20 border border-white/[0.04] rounded-xl p-3.5 text-left hover:bg-nexus-card/40 hover:border-nexus-accent/20 hover:shadow-[0_0_30px_rgba(96,165,250,0.06)] transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center mb-2.5 group-hover:bg-nexus-accent/15 group-hover:border-nexus-accent/25 transition-all duration-300">
              <action.icon />
            </div>
            <div className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">{action.label}</div>
            <div className="text-2xs text-nexus-subtle/30 mt-0.5">{action.desc}</div>
            <div className="text-2xs text-nexus-subtle/15 mt-1 font-mono">{action.shortcut}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ChatActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function BrainActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}

function GoalActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

function LearnActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

function ProjectActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>;
}

function JournalActionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
