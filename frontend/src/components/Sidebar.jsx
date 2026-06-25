import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'goals', label: 'Goals', icon: GoalsIcon },
  { id: 'learning', label: 'Learning', icon: LearningIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'projects', label: 'Projects', icon: ProjectsIcon },
  { id: 'memory', label: 'Memory', icon: MemoryIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({
  isExpanded, onToggle, activeItem, onNavigate,
  user, onLogout,
  sessions, activeSessionId, onNewSession, onSelectSession, onDeleteSession,
}) {
  return (
    <motion.nav
      layout
      animate={{ width: isExpanded ? 220 : 60 }}
      transition={{ type: 'spring', damping: 26, stiffness: 250 }}
      className="h-full glass-panel flex flex-col overflow-hidden rounded-none"
      onMouseEnter={() => !isExpanded && onToggle(true)}
      onMouseLeave={() => isExpanded && onToggle(false)}
    >
      <div className="flex items-center justify-center h-16 shrink-0 border-b border-white/[0.03]">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-3 px-5 w-full"
            >
              <div className="rounded-xl bg-nexus-card/50 border border-white/[0.05] p-1.5">
                <img src="/GAMING NEXUS.jpg" alt="NEXUS" className="w-7 h-7 object-contain shrink-0" />
              </div>
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="text-sm font-semibold text-white/90 tracking-wide"
              >
                NEXUS
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <div className="rounded-xl bg-nexus-card/50 border border-white/[0.05] p-1.5">
                <img src="/GAMING NEXUS.jpg" alt="NEXUS" className="w-6 h-6 object-contain" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-0.5 p-2.5 pt-3 shrink-0">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            isExpanded={isExpanded}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>

      {isExpanded && (
        <div className="border-t border-white/[0.03] pt-2.5 px-2.5 shrink-0">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-nexus-subtle/50 hover:text-white hover:bg-white/[0.04] transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="font-medium tracking-wide">New Chat</span>
          </button>
        </div>
      )}

      {isExpanded && sessions.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2.5 pt-1.5 space-y-0.5 min-h-0">
          {sessions.map((s) => (
            <div
              key={s._id}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                activeSessionId === s._id
                  ? 'bg-nexus-accent/8 text-white'
                  : 'text-nexus-subtle/40 hover:text-nexus-subtle/70 hover:bg-white/[0.02]'
              }`}
              onClick={() => onSelectSession(s._id)}
            >
              <ChatIcon className="shrink-0" />
              <span className="text-xs font-medium truncate flex-1 min-w-0">{s.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(s._id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-150"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-2.5 border-t border-white/[0.03] shrink-0">
        <SidebarItem
          icon={UserIcon}
          label={user?.name || 'User'}
          isExpanded={isExpanded}
          onClick={onLogout}
        />
      </div>
    </motion.nav>
  );
}

function SidebarItem({ icon: Icon, label, isActive, isExpanded, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`sidebar-item w-full group ${isActive ? 'active' : ''}`}
      style={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
    >
      <Icon className="shrink-0" />
      {!isExpanded && (
        <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-nexus-card/95 border border-white/[0.06] text-xs text-white/80 font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 shadow-xl z-50 pointer-events-none">
          {label}
        </div>
      )}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            className="text-xs font-medium overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function GoalsIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function LearningIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>
    </svg>
  );
}

function TasksIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function HomeIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function WorkspaceIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function ProjectsIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>
    </svg>
  );
}

function MemoryIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function AgentsIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
