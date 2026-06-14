import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ProgressBar from './ProgressBar';

const placeholderGoal = {
  title: 'Build a Portfolio Website',
  category: 'Career',
  priority: 'high',
  progress: 45,
  targetDate: '2026-08-15',
};

const placeholderStreaks = [
  { category: 'Coding', currentStreak: 7, longestStreak: 12, maintainedToday: true },
  { category: 'Learning', currentStreak: 3, longestStreak: 8, maintainedToday: false },
  { category: 'Workout', currentStreak: 0, longestStreak: 5, maintainedToday: false },
];

const placeholderTasks = [
  { id: '1', title: 'Review PR comments', category: 'Coding', status: 'Pending' },
  { id: '2', title: 'Read chapter 5 of ML book', category: 'Learning', status: 'Completed' },
  { id: '3', title: 'Morning run', category: 'Workout', status: 'Completed' },
  { id: '4', title: 'Write API documentation', category: 'Coding', status: 'Pending' },
];

const placeholderProjects = [
  { id: '1', name: 'Nexus Life OS', status: 'active', progress: 65 },
  { id: '2', name: 'Personal Blog', status: 'active', progress: 30 },
];

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDone = placeholderTasks.filter((t) => t.status === 'Completed').length;
  const todayTotal = placeholderTasks.length;
  const taskPercent = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl font-semibold text-white/90">
            Welcome Back 🚀
          </h1>
          <p className="text-sm text-nexus-subtle/40 mt-1">
            How can I assist you today?
          </p>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-nexus-accent/80">{placeholderGoal.progress}%</div>
            <div className="text-2xs text-nexus-subtle/30 mt-0.5">Current Goal</div>
          </div>
          <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-nexus-accent/80">{todayDone}/{todayTotal}</div>
            <div className="text-2xs text-nexus-subtle/30 mt-0.5">Today's Tasks</div>
          </div>
          <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-nexus-accent/80">{placeholderProjects.length}</div>
            <div className="text-2xs text-nexus-subtle/30 mt-0.5">Active Projects</div>
          </div>
          <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-nexus-accent/80">{placeholderStreaks.reduce((max, s) => Math.max(max, s.currentStreak), 0)}</div>
            <div className="text-2xs text-nexus-subtle/30 mt-0.5">Best Streak</div>
          </div>
        </div>

        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Current Goal */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">🎯 Current Goal</span>
              <button onClick={() => onNavigate('goals')} className="text-2xs text-nexus-accent/40 hover:text-nexus-accent/70 transition-colors">View all</button>
            </div>
            <h3 className="text-sm font-medium text-white/90 mb-2">{placeholderGoal.title}</h3>
            <ProgressBar value={placeholderGoal.progress} size="sm" color={placeholderGoal.priority} />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-nexus-accent/10 text-nexus-accent/60 border border-nexus-accent/15">{placeholderGoal.category}</span>
              <span className="text-2xs text-nexus-subtle/20">Target: {new Date(placeholderGoal.targetDate).toLocaleDateString()}</span>
            </div>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">✅ Today's Tasks</span>
              <button onClick={() => onNavigate('tasks')} className="text-2xs text-nexus-accent/40 hover:text-nexus-accent/70 transition-colors">View all</button>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-lg font-bold text-nexus-accent/80">{taskPercent}%</span>
              <span className="text-2xs text-nexus-subtle/30">complete ({todayDone}/{todayTotal})</span>
            </div>
            <div className="space-y-1.5">
              {placeholderTasks.map((task) => (
                <div key={task.id} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${task.status === 'Completed' ? 'bg-emerald-500/3 border-emerald-500/8' : 'bg-nexus-card/20 border-white/[0.03]'}`}>
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${task.status === 'Completed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10'}`}>
                    {task.status === 'Completed' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className={`text-xs flex-1 ${task.status === 'Completed' ? 'text-nexus-subtle/20 line-through' : 'text-nexus-subtle/60'}`}>{task.title}</span>
                  <span className="text-2xs text-nexus-subtle/20">{task.category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">🔥 Streaks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {placeholderStreaks.map((s) => (
              <PlaceholderStreakCard key={s.category} streak={s} />
            ))}
          </div>
        </motion.div>

        {/* Active Projects + Recent Achievement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">📦 Active Projects</span>
              <button onClick={() => onNavigate('projects')} className="text-2xs text-nexus-accent/40 hover:text-nexus-accent/70 transition-colors">View all</button>
            </div>
            {placeholderProjects.map((p) => (
              <div key={p.id} className="mb-2 last:mb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70">{p.name}</span>
                  <span className="text-nexus-subtle/30">{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} size="sm" color="high" showLabel={false} />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">🏆 Recent Achievement</span>
            </div>
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-lg mb-2">⭐</div>
              <p className="text-xs text-white/70 font-medium">7-Day Coding Streak</p>
              <p className="text-2xs text-nexus-subtle/30 mt-0.5">You've coded every day for a week. Keep it going!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderStreakCard({ streak }) {
  const emojis = { Coding: '💻', Learning: '📚', Workout: '💪' };
  const colors = {
    Coding: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
    Learning: 'from-amber-500/10 to-amber-500/5 border-amber-500/15',
    Workout: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/15',
  };
  const accents = { Coding: 'text-blue-400', Learning: 'text-amber-400', Workout: 'text-emerald-400' };
  const isActive = streak.currentStreak > 0;
  const isRecord = streak.currentStreak === streak.longestStreak && streak.currentStreak > 0;

  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${colors[streak.category] || 'from-white/5 to-white/[0.02] border-white/[0.06]'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emojis[streak.category] || '🔥'}</span>
          <span className="text-xs font-medium text-nexus-subtle/60">{streak.category}</span>
        </div>
        {isRecord && <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/15">Best</span>}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-2xl font-bold tracking-tight ${isActive ? (accents[streak.category] || 'text-white') : 'text-nexus-subtle/30'}`}>
          {streak.currentStreak}
        </span>
        <span className="text-xs text-nexus-subtle/30">days</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-2xs ${streak.maintainedToday ? 'text-emerald-400/60' : 'text-nexus-subtle/20'}`}>
          {streak.maintainedToday ? 'Active today' : streak.currentStreak > 0 ? 'Not yet today' : 'Inactive'}
        </span>
        <span className="text-2xs text-nexus-subtle/20">Best: {streak.longestStreak}</span>
      </div>
    </div>
  );
}
