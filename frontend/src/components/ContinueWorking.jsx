import { motion } from 'framer-motion';

const recentItems = [
  { title: 'Continue Java Learning', subtitle: 'DSA - Recursion & Backtracking', progress: 65, updated: '2 hours ago', color: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/15', icon: JavaIcon },
  { title: 'Continue DSA', subtitle: 'Arrays & Sliding Window', progress: 42, updated: 'Yesterday', color: 'from-emerald-500/10 to-green-500/5', border: 'border-emerald-500/15', icon: DSASIcon },
  { title: 'Resume Editing', subtitle: 'Portfolio Website - Hero Section', progress: 78, updated: '2 days ago', color: 'from-violet-500/10 to-purple-500/5', border: 'border-violet-500/15', icon: EditIcon },
  { title: 'Portfolio Development', subtitle: 'Project Showcase Page', progress: 33, updated: '3 days ago', color: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/15', icon: PortfolioIcon },
  { title: 'Forward Stroke', subtitle: 'React Native Learning Path', progress: 15, updated: '1 week ago', color: 'from-rose-500/10 to-pink-500/5', border: 'border-rose-500/15', icon: ForwardIcon },
];

export default function ContinueWorking({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Continue Working</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {recentItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.04, duration: 0.35 }}
            className={`group bg-gradient-to-br ${item.color} bg-nexus-card/20 border ${item.border} rounded-xl p-3.5 hover:bg-nexus-card/40 hover:-translate-y-0.5 transition-all duration-300`}
          >
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center shrink-0 group-hover:bg-nexus-accent/15 group-hover:border-nexus-accent/25 transition-all duration-300">
                <item.icon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white/85 truncate">{item.title}</div>
                <div className="text-2xs text-nexus-subtle/30 truncate mt-0.5">{item.subtitle}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-2xs">
                <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, rgba(96,165,250,0.6), rgba(96,165,250,0.3))',
                    }}
                  />
                </div>
                <span className="text-nexus-subtle/30 ml-2 shrink-0">{item.progress}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xs text-nexus-subtle/20">{item.updated}</span>
                <button
                  onClick={() => onContinue?.(item)}
                  className="text-2xs font-medium text-nexus-accent/60 hover:text-nexus-accent opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function JavaIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

function DSASIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}

function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

function PortfolioIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}

function ForwardIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
