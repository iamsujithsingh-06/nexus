import { useState } from 'react';
import { motion } from 'framer-motion';
import CommandInput from './CommandInput';
import DashboardGreeting from './DashboardGreeting';
import StatsBar from './StatsBar';
import OverviewCards from './OverviewCards';
import QuickActions from './QuickActions';
import ContinueWorking from './ContinueWorking';
import Suggestions from './Suggestions';
import RecentActivity from './RecentActivity';

export default function WelcomeScreen({ onSendMessage, onStartSession, onNavigate, user }) {
  const [inputValue, setInputValue] = useState('');

  const handleAction = (action) => {
    switch (action) {
      case 'newChat':
        onStartSession?.();
        break;
      case 'memory':
        onNavigate?.('memory');
        break;
      case 'goals':
        onNavigate?.('goals');
        break;
      case 'projects':
        onNavigate?.('projects');
        break;
      case 'learning':
        onSendMessage?.('Help me continue learning where I left off');
        break;
      case 'journal':
        onSendMessage?.('Let me write my daily journal entry');
        break;
      default:
        break;
    }
  };

  const handleContinue = (item) => {
    onSendMessage?.(`Continue working on: ${item.title} - ${item.subtitle}`);
  };

  const handleSuggestion = (item) => {
    onSendMessage?.(`${item.title}: ${item.desc}`);
  };

  const demoData = {
    chats: 12,
    memories: 47,
    goals: 5,
    projects: 3,
    streak: 7,
    currentGoal: { title: 'Master DSA in Java', progress: 42 },
    pendingTasks: 8,
    todayTasks: 3,
    learningProgress: 42,
    lessonsCompleted: 21,
    recentChats: 4,
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-full px-4 sm:px-6 md:px-8 pt-10 md:pt-14 pb-10 max-w-6xl mx-auto"
      >
        {/* Top section with logo, greeting and search */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-nexus-accent/8 rounded-full blur-[60px]"
              />
              <div className="relative rounded-2xl bg-nexus-card/40 backdrop-blur-sm border border-white/[0.06] p-2.5">
                <img
                  src="/GAMING NEXUS.jpg"
                  alt="NEXUS"
                  className="w-14 h-14 md:w-16 md:h-16 object-contain"
                />
              </div>
            </div>
          </motion.div>

          <DashboardGreeting userName={user?.name || 'there'} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl"
          >
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              onSend={(msg) => {
                onSendMessage?.(msg);
                setInputValue('');
              }}
              isSending={false}
              placeholder="Ask Nexus anything..."
            />
          </motion.div>
        </div>

        {/* Stats Bar */}
        <div className="mb-6">
          <StatsBar data={demoData} />
        </div>

        {/* Today's Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Today's Overview</h2>
          </div>
          <OverviewCards data={demoData} />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions onAction={handleAction} />
        </div>

        {/* Continue Working */}
        <div className="mb-6">
          <ContinueWorking onContinue={handleContinue} />
        </div>

        {/* Suggestions + Recent Activity side by side on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
          <div className="xl:col-span-3">
            <Suggestions onSelect={handleSuggestion} />
          </div>
          <div className="xl:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-4"
        >
          <button
            onClick={onStartSession}
            className="text-xs text-nexus-subtle/25 hover:text-nexus-subtle/50 transition-colors tracking-wider"
          >
            or begin with a blank session
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
