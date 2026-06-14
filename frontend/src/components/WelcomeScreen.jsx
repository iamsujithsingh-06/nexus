import { useState } from 'react';
import { motion } from 'framer-motion';
import CommandInput from './CommandInput';
import ActionCard from './ActionCard';

const ACTIONS = [
  {
    icon: <CodeIcon />,
    title: 'Coding',
    subtitle: 'Write, debug, and optimize code',
    prompt: 'Help me with a coding task. I need to write, debug, or optimize some code.',
  },
  {
    icon: <BookIcon />,
    title: 'Study',
    subtitle: 'Learn new topics and concepts',
    prompt: 'I want to study a new topic. Help me understand the key concepts and create a learning plan.',
  },
  {
    icon: <RocketIcon />,
    title: 'Projects',
    subtitle: 'Plan and build something great',
    prompt: 'I have a project idea I want to develop. Help me plan the architecture and implementation steps.',
  },
  {
    icon: <SparklesIcon />,
    title: 'AI Assistant',
    subtitle: 'Leverage AI for any task',
    prompt: 'Act as my AI assistant to help me with a task I need to complete.',
  },
];

export default function WelcomeScreen({ onSendMessage, onStartSession }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center px-6 pt-16 md:pt-20 pb-10 max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-7 mb-10 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-nexus-accent/8 rounded-full blur-[60px]"
              />
              <div className="relative rounded-2xl bg-nexus-card/40 backdrop-blur-sm border border-white/[0.06] p-3">
                <img
                  src="/GAMING NEXUS.jpg"
                  alt="NEXUS"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              </div>
            </div>

            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-xl md:text-2xl text-white/90 font-medium tracking-tight"
              >
                Hi there! How can I assist you today?
              </motion.h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              onSend={onSendMessage}
              isSending={false}
              placeholder="Ask anything..."
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-8"
        >
          {ACTIONS.map((action, i) => (
            <ActionCard
              key={action.title}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              index={i}
              onClick={() => setInputValue(action.prompt)}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={onStartSession}
            className="text-xs text-nexus-subtle/25 hover:text-nexus-subtle/50 transition-colors tracking-wider"
          >
            or begin with a blank session
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function RocketIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
}

function SparklesIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.91 5.09L19 10l-5.09 1.91L12 17l-1.91-5.09L5 10l5.09-1.91z"/><line x1="3" y1="18" x2="6" y2="18"/><line x1="18" y1="18" x2="21" y2="18"/><line x1="5" y1="21" x2="5" y2="15"/><line x1="19" y1="21" x2="19" y2="15"/></svg>;
}

function CodeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}

function BookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
}
