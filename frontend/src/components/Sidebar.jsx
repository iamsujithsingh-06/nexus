import { useState } from 'react';

export default function Sidebar({
  chats,
  currentChat,
  isLoading,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  user,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card text-cosmic-muted hover:text-white transition-all"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72
          bg-cosmic-surface border-r border-cosmic-border
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-cosmic-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg nexus-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold nexus-gradient-text">NEXUS</h1>
          </div>
          <button
            onClick={() => { onCreateChat(); setIsOpen(false); }}
            disabled={isLoading}
            className="w-full btn-primary rounded-lg py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-cosmic-muted text-sm">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-0.5 ${
                  currentChat?._id === chat._id
                    ? 'bg-cosmic-border/50 text-white'
                    : 'text-cosmic-muted hover:bg-cosmic-border/30 hover:text-white'
                }`}
                onClick={() => { onSelectChat(chat._id); setIsOpen(false); }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="flex-1 truncate text-sm">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-cosmic-muted hover:text-red-400 transition-all"
                  title="Delete chat"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-cosmic-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full nexus-gradient flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-cosmic-muted truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg btn-ghost"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
