import { motion } from 'framer-motion';

const activities = [
  { icon: CheckIcon, text: 'Learned Sliding Window technique', date: 'Today', time: '2:30 PM', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: EditActIcon, text: 'Updated Resume with new projects', date: 'Today', time: '11:15 AM', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: GoalActIcon, text: 'Created New Goal: Master DSA', date: 'Yesterday', time: '4:45 PM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: ChatActIcon, text: 'Chat with Nexus: OOP Concepts', date: 'Yesterday', time: '1:00 PM', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { icon: TaskActIcon, text: 'Completed 5 Java DSA problems', date: '2 days ago', time: '9:20 PM', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: MemoryActIcon, text: 'Saved memory: Java Collections notes', date: '2 days ago', time: '6:30 PM', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Recent Activity</h2>
        <button className="text-2xs text-nexus-accent/50 hover:text-nexus-accent transition-colors">View all</button>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-nexus-accent/20 via-nexus-accent/10 to-transparent" />
        <div className="space-y-0">
          {activities.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
              className="relative flex items-start gap-3 py-2.5 group"
            >
              <div className={`relative z-10 w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-sm text-white/80">{item.text}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xs text-nexus-subtle/30">{item.date}</span>
                  <span className="text-2xs text-nexus-subtle/20">·</span>
                  <span className="text-2xs text-nexus-subtle/20">{item.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CheckIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function EditActIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

function GoalActIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

function ChatActIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function TaskActIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}

function MemoryActIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
