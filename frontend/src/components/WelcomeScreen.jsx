import { motion } from 'framer-motion';

const suggestions = [
  {
    icon: <CodeIcon />,
    title: 'Code & Debug',
    desc: 'Write, review, or debug code with AI assistance',
    prompt: 'Help me debug this error: "TypeError: Cannot read property..."',
  },
  {
    icon: <BrainIcon />,
    title: 'Learn & Explore',
    desc: 'Understand concepts, deep-dive into any topic',
    prompt: 'Explain how the JavaScript event loop works with examples',
  },
  {
    icon: <BuildIcon />,
    title: 'Plan & Build',
    desc: 'Architecture, roadmaps, and project planning',
    prompt: 'Design a microservices architecture for an e-commerce platform',
  },
  {
    icon: <WriteIcon />,
    title: 'Write & Create',
    desc: 'Drafts, documentation, and creative writing',
    prompt: 'Write a technical blog post about building real-time apps with WebSockets',
  },
];

export default function WelcomeScreen({ onCreateChat, onSendMessage }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg mb-12"
      >
        <div className="w-12 h-12 rounded-xl bg-nexus-accent/8 border border-nexus-accent/15 flex items-center justify-center mx-auto mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
            <line x1="12" y1="22" x2="12" y2="15.5"/>
            <polyline points="22 8.5 12 15.5 2 8.5"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-nexus-text mb-2">
          Good morning
        </h1>
        <p className="text-sm text-nexus-subtle/60 leading-relaxed max-w-md mx-auto">
          Your AI operating system. Ask anything, build anything.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
      >
        {suggestions.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSendMessage?.(s.prompt)}
            className="suggestion-card text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center mb-3">
              {s.icon}
            </div>
            <h3 className="text-sm font-medium text-nexus-text/90 mb-1">{s.title}</h3>
            <p className="text-xs text-nexus-muted/50 leading-relaxed">{s.desc}</p>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <button
          onClick={onCreateChat}
          className="text-xs text-nexus-subtle/30 hover:text-nexus-subtle/60 transition-colors"
        >
          or start a blank conversation
        </button>
      </motion.div>
    </div>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v1h2a4 4 0 0 1 4 4v1a4 4 0 0 1-2.34 3.65A4 4 0 0 1 16 18.76V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.24a4 4 0 0 1-3.66-2.11A4 4 0 0 1 2 12v-1a4 4 0 0 1 4-4h2V6a4 4 0 0 1 4-4z"/>
    </svg>
  );
}

function BuildIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>
    </svg>
  );
}

function WriteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
