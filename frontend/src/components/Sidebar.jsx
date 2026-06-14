import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  chats, currentChat, isLoading, onSelectChat, onCreateChat, onDeleteChat, user, onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-nexus-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
                <line x1="12" y1="22" x2="12" y2="15.5"/>
                <polyline points="22 8.5 12 15.5 2 8.5"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-nexus-text">NEXUS</span>
          </div>
          <button
            onClick={onCreateChat}
            disabled={isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center btn-primary"
            title="New chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-muted/50 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full nexus-input rounded-lg pl-8 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-1.5 px-2">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-8 h-8 mx-auto mb-3 text-nexus-muted/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-xs text-nexus-muted/40">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredChats.map((chat, i) => (
              <motion.div
                key={chat._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.02, type: 'spring', damping: 25, stiffness: 300 }}
              >
                <ChatItem
                  chat={chat}
                  isActive={currentChat?._id === chat._id}
                  onSelect={() => onSelectChat(chat._id)}
                  onDelete={() => onDeleteChat(chat._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="p-3 border-t border-nexus-border/40">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-nexus-border/20 transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center text-xs font-medium text-nexus-accent/80">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-nexus-text/80 truncate">{user?.name || 'User'}</p>
            <p className="text-2xs text-nexus-muted/40 truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 btn-ghost transition-all"
            title="Sign out"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatItem({ chat, isActive, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5 ${
        isActive
          ? 'bg-nexus-accent-subtle border border-nexus-accent/10'
          : 'hover:bg-nexus-border/20 border border-transparent'
      }`}
    >
      <svg
        className={`w-3.5 h-3.5 shrink-0 ${
          isActive ? 'text-nexus-accent/70' : 'text-nexus-muted/30 group-hover:text-nexus-muted/50'
        }`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span
        className={`flex-1 truncate text-xs ${
          isActive ? 'text-nexus-text' : 'text-nexus-muted/60'
        }`}
      >
        {chat.title}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-1 rounded opacity-0 group-hover:opacity-100 btn-danger transition-all"
        title="Delete"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  );
}
