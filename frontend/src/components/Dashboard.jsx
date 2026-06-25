import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ProgressBar from './ProgressBar';
import * as goalApi from '../services/goalApi';
import * as coachApi from '../services/coachApi';
import CoachCard from './CoachCard';
import DailyBrief from './DailyBrief';
import ProductivityWidget from './ProductivityWidget';
import RecommendationList from './RecommendationList';
import MotivationCard from './MotivationCard';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [coach, setCoach] = useState({ card: null, brief: null, scores: null, recs: [], motivation: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [dash, oldCoach, ach, cardRes, briefRes, scoresRes, recsRes, motRes] = await Promise.all([
          goalApi.getDashboard().catch(() => null),
          goalApi.getCoachInsights().catch(() => null),
          goalApi.getAchievements().catch(() => []),
          coachApi.getCoachCard().catch(() => null),
          coachApi.getDailyBrief().catch(() => null),
          coachApi.getProductivityScores().catch(() => null),
          coachApi.getRecommendations().catch(() => null),
          coachApi.getMotivation().catch(() => null),
        ]);
        if (!mounted) return;
        if (dash) setData(dash);
        if (oldCoach) setInsights(oldCoach.insights);
        if (ach?.achievements) setAchievements(ach.achievements);
        setCoach({
          card: cardRes?.card || null,
          brief: briefRes?.brief || null,
          scores: scoresRes?.scores || null,
          recs: recsRes?.recommendations || [],
          motivation: motRes || null,
        });
      } catch { /* offline fallback */ }
      if (mounted) setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-nexus-subtle/30 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  const currentGoal = data?.currentGoal;
  const totalTasks = data?.totalTasks || 0;
  const completedTasks = data?.tasksCompleted || 0;
  const todayTasks = data?.todayTasks || [];
  const streaks = data?.streaks || [];
  const bestStreak = data?.currentStreak || 0;
  const focusScore = data?.focusScore || 0;
  const recentActivity = data?.activity || [];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl font-semibold text-white/90">
            {greeting()}, {user?.name || 'there'} {bestStreak >= 7 ? '🔥' : ''}
          </h1>
          {insights?.recommendations?.[0] && (
            <p className="text-xs text-nexus-accent/50 mt-1">{insights.recommendations[0]}</p>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Goal Progress" value={currentGoal ? `${currentGoal.progress}%` : '--'} />
          <StatCard label="Tasks Done" value={`${completedTasks}/${totalTasks}`} />
          <StatCard label="Best Streak" value={`${bestStreak}d`} accent={bestStreak >= 7} />
          <StatCard label="Focus Score" value={`${focusScore}%`} accent={focusScore >= 70} />
        </div>

        {/* Recent Activity Bar - Mini Coach Card at top */}
        <div className="space-y-4 mb-6">
          {coach.card && <CoachCard card={coach.card} />}
        </div>

        {/* Daily Brief */}
        {coach.brief && <div className="mb-6"><DailyBrief brief={coach.brief} /></div>}

        {/* Recommendations + Motivation row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <RecommendationList recommendations={coach.recs} />
          <MotivationCard motivation={coach.motivation} />
        </div>

        {/* Productivity Scores */}
        {coach.scores && <div className="mb-6"><ProductivityWidget scores={coach.scores} /></div>}

        {/* Two-column: Current Goal + Today Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Current Goal */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">🎯 Current Goal</span>
              <button onClick={() => onNavigate('goals')} className="text-2xs text-nexus-accent/40 hover:text-nexus-accent/70 transition-colors">View all</button>
            </div>
            {currentGoal ? (
              <>
                <h3 className="text-sm font-medium text-white/90 mb-2">{currentGoal.title}</h3>
                <ProgressBar value={currentGoal.progress} size="sm" />
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-nexus-subtle/30 mb-2">No active goals yet</p>
                <button onClick={() => onNavigate('goals')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-nexus-accent/10 text-nexus-accent/60 border border-nexus-accent/15 hover:bg-nexus-accent/20 transition-colors">
                  Create your first goal
                </button>
              </div>
            )}
          </motion.div>

          {/* Today's Tasks */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider">✅ Today's Tasks</span>
              <button onClick={() => onNavigate('tasks')} className="text-2xs text-nexus-accent/40 hover:text-nexus-accent/70 transition-colors">View all</button>
            </div>
            {todayTasks.length > 0 ? (
              <>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold text-nexus-accent/80">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
                  <span className="text-2xs text-nexus-subtle/30">complete</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {todayTasks.slice(0, 8).map((task) => (
                    <div key={task._id}
                      className="flex items-center gap-2.5 p-2 rounded-lg border transition-all bg-nexus-card/20 border-white/[0.03]">
                      <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 border-white/10" />
                      <span className="text-xs flex-1 text-nexus-subtle/60">{task.title}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-nexus-subtle/30">No tasks for today</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Activity Chart + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Weekly Activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4">
            <h2 className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider mb-3">📊 Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="flex items-end gap-1.5 h-20">
                {recentActivity.slice(0, 7).reverse().map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${Math.max(4, a.score || 0)}%`,
                        background: (a.score || 0) > 60 ? 'rgba(34,197,94,0.4)' : (a.score || 0) > 30 ? 'rgba(234,179,8,0.3)' : 'rgba(100,116,139,0.2)',
                      }}
                    />
                    <span className="text-2xs text-nexus-subtle/20">{a.date?.slice(5, 10)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center">
                <p className="text-xs text-nexus-subtle/20">No activity data yet</p>
              </div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4">
            <h2 className="text-2xs font-medium text-nexus-subtle/40 uppercase tracking-wider mb-3">🏆 Achievements</h2>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {achievements.slice(0, 4).map((a) => (
                  <div key={a._id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                    <span className="text-lg">{a.icon || '🏆'}</span>
                    <div>
                      <p className="text-xs text-white/70 font-medium">{a.title}</p>
                      <p className="text-2xs text-nexus-subtle/30">{new Date(a.earnedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-nexus-subtle/30">Complete goals to earn achievements</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Streaks */}
        {streaks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-6">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">🔥 Streaks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {streaks.map((s) => (
                <StreakCard key={s._id || s.category} streak={s} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-nexus-card/30 border border-white/[0.04] rounded-xl p-3 text-center">
      <div className={`text-lg font-bold ${accent ? 'text-emerald-400/80' : 'text-nexus-accent/80'}`}>{value}</div>
      <div className="text-2xs text-nexus-subtle/30 mt-0.5">{label}</div>
    </div>
  );
}

function StreakCard({ streak }) {
  const emojis = { coding: '💻', learning: '📚', workout: '💪', general: '🔥' };
  const colors = {
    coding: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
    learning: 'from-amber-500/10 to-amber-500/5 border-amber-500/15',
    workout: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/15',
    general: 'from-white/5 to-white/[0.02] border-white/[0.06]',
  };
  const isRecord = streak.currentStreak === streak.longestStreak && streak.currentStreak > 0;
  const isActive = streak.currentStreak > 0;
  const today = new Date().toISOString().split('T')[0];
  const maintainedToday = streak.lastActiveDate === today;

  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${colors[streak.category] || colors.general}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emojis[streak.category] || '🔥'}</span>
          <span className="text-xs font-medium text-nexus-subtle/60 capitalize">{streak.category}</span>
        </div>
        {isRecord && <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/15">Best</span>}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-2xl font-bold tracking-tight ${isActive ? 'text-white' : 'text-nexus-subtle/30'}`}>
          {streak.currentStreak}
        </span>
        <span className="text-xs text-nexus-subtle/30">days</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-2xs ${maintainedToday ? 'text-emerald-400/60' : isActive ? 'text-nexus-subtle/20' : 'text-nexus-subtle/20'}`}>
          {maintainedToday ? 'Active today' : isActive ? 'Not yet today' : 'Inactive'}
        </span>
        <span className="text-2xs text-nexus-subtle/20">Best: {streak.longestStreak}</span>
      </div>
    </div>
  );
}
