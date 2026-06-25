import { motion } from 'framer-motion';

const suggestions = [
  {
    icon: RoadmapIcon,
    title: 'Continue your Java roadmap',
    desc: 'Next milestone: Recursion & Backtracking',
    action: 'Continue',
    color: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/15',
  },
  {
    icon: CodeIcon,
    title: 'Practice 2 Leetcode problems',
    desc: 'Focus on Sliding Window pattern',
    action: 'Solve',
    color: 'from-emerald-500/10 to-green-500/5',
    border: 'border-emerald-500/15',
  },
  {
    icon: BriefcaseIcon,
    title: 'Apply for internships today',
    desc: '3 new positions matching your skills',
    action: 'View',
    color: 'from-amber-500/10 to-orange-500/5',
    border: 'border-amber-500/15',
  },
  {
    icon: FileIcon,
    title: 'Review your resume',
    desc: 'Add latest projects section',
    action: 'Review',
    color: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-500/15',
  },
  {
    icon: GlobeIcon,
    title: 'Improve your portfolio',
    desc: 'Add DSA project showcase',
    action: 'Improve',
    color: 'from-rose-500/10 to-pink-500/5',
    border: 'border-rose-500/15',
  },
];

export default function Suggestions({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Nexus Suggestions</h2>
        <button className="text-2xs text-nexus-accent/50 hover:text-nexus-accent transition-colors">Refresh</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {suggestions.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.04, duration: 0.35 }}
            className={`group bg-gradient-to-br ${item.color} bg-nexus-card/20 border ${item.border} rounded-xl p-3.5 hover:bg-nexus-card/40 hover:-translate-y-0.5 transition-all duration-300`}
          >
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center shrink-0 group-hover:bg-nexus-accent/15 group-hover:border-nexus-accent/25 transition-all duration-300">
                <item.icon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white/85 truncate">{item.title}</div>
                <div className="text-2xs text-nexus-subtle/30 mt-0.5">{item.desc}</div>
              </div>
            </div>
            <button
              onClick={() => onSelect?.(item)}
              className="w-full mt-1 py-1.5 text-2xs font-medium bg-nexus-accent/8 border border-nexus-accent/15 text-nexus-accent/70 rounded-lg hover:bg-nexus-accent/15 hover:border-nexus-accent/25 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              {item.action}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RoadmapIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}

function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}

function BriefcaseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}

function FileIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function GlobeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
