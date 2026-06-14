import { motion } from 'framer-motion';

const MEMORY_CARDS = [
  {
    id: 'profile',
    icon: <ProfileIcon />,
    title: 'Profile',
    description: 'Your personal context, preferences, and identity that Nexus remembers across conversations.',
    details: [
      'Name, location, timezone',
      'Professional background',
      'Communication preferences',
      'Learning style & interests',
    ],
  },
  {
    id: 'learning',
    icon: <LearningIcon />,
    title: 'Learning Progress',
    description: 'Topics you are studying, skills you are building, and concepts Nexus has helped you understand.',
    details: [
      'Currently studying: Machine Learning',
      'Completed: Python, React, SQL',
      'Saved explanations & summaries',
      'Knowledge gaps identified',
    ],
  },
  {
    id: 'ideas',
    icon: <IdeasIcon />,
    title: 'Ideas Vault',
    description: 'A collection of ideas, project concepts, and creative thoughts captured during conversations.',
    details: [
      'Startup ideas & business concepts',
      'Blog post drafts & outlines',
      'Project feature suggestions',
      'Random creative thoughts',
    ],
  },
  {
    id: 'achievements',
    icon: <AchievementIcon />,
    title: 'Achievement Vault',
    description: 'Milestones, completed goals, and significant accomplishments tracked by Nexus.',
    details: [
      'Completed projects & milestones',
      'Learning certificates & skills',
      'Streak records & personal bests',
      'Feedback & performance reviews',
    ],
  },
];

export default function MemorySection() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white/90">Memory</h1>
          <p className="text-xs text-nexus-subtle/40 mt-0.5">
            Your personal knowledge base — Nexus remembers what matters to you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MEMORY_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 hover:border-nexus-accent/15 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/90">{card.title}</h3>
                  <p className="text-xs text-nexus-subtle/40 mt-1 leading-relaxed">{card.description}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {card.details.map((detail, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-nexus-subtle/30">
                    <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor" className="text-nexus-accent/40 shrink-0">
                      <circle cx="2" cy="2" r="2"/>
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LearningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
}

function IdeasIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}

function AchievementIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
