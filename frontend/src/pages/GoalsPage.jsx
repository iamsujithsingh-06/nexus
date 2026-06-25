import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalsApi } from '../hooks/useGoalsApi';
import * as goalApi from '../services/goalApi';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import GoalDetail from '../components/GoalDetail';
import GoalStatistics from '../components/GoalStatistics';
import GoalTimeline from '../components/GoalTimeline';
import GoalFilters from '../components/GoalFilters';
import MilestoneCard from '../components/MilestoneCard';

export default function GoalsPage() {
  const {
    goals, activeGoals, completedGoals, pausedGoals, loading,
    create, createWithPlan, update, remove,
    completeGoal, reactivateGoal, pauseGoal, showForm, setShowForm,
    editingGoal, setEditingGoal,
    addMilestone, toggleMilestone, removeMilestone, refresh,
  } = useGoalsApi();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [detailMilestones, setDetailMilestones] = useState([]);
  const [detailTasks, setDetailTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredGoals, setFilteredGoals] = useState([]);

  useEffect(() => { goalApi.getGoalStats().then(r => { if (r?.stats) setStats(r.stats); setStatsLoading(false); }).catch(() => setStatsLoading(false)); }, []);

  useEffect(() => {
    let filtered = [...goals];
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(g => (g.category || 'General').toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(g => g.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(g => (g.title || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q));
    }
    if (filters.sort === 'deadline') filtered.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    else if (filters.sort === 'priority') filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    else if (filters.sort === 'progress') filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    else filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setFilteredGoals(filtered);
  }, [goals, filters]);

  const handleFilter = useCallback((f) => setFilters(f), []);

  const handleGoalClick = useCallback(async (goal) => {
    const id = goal._id || goal.id;
    setSelectedGoalId(id);
    setShowTimeline(false);
    goalApi.getGoal(id).then(res => {
      if (res?.goal) setGoalDetail(res.goal);
      if (res?.milestones) setDetailMilestones(res.milestones);
      if (res?.tasks) setDetailTasks(res.tasks || []);
    }).catch(() => {});
  }, []);

  const handleToggleTimeline = useCallback(async (goalId) => {
    setShowTimeline(!showTimeline);
    if (!showTimeline && goalId) {
      setTimelineLoading(true);
      goalApi.getGoalTimeline(goalId).then(r => { if (r?.events) setTimelineEvents(r.events); setTimelineLoading(false); }).catch(() => setTimelineLoading(false));
    }
  }, [showTimeline]);

  const handleToggleMilestone = useCallback(async (msId) => {
    const result = await toggleMilestone(msId);
    if (result && selectedGoalId) {
      goalApi.getGoal(selectedGoalId).then(res => { if (res?.milestones) setDetailMilestones(res.milestones); }).catch(() => {});
    }
  }, [toggleMilestone, selectedGoalId]);

  const handleRemoveMilestone = useCallback(async (msId) => {
    const result = await removeMilestone(msId);
    if (result && selectedGoalId) {
      goalApi.getGoal(selectedGoalId).then(res => {
        if (res?.goal) setGoalDetail(res.goal);
        if (res?.milestones) setDetailMilestones(res.milestones);
      }).catch(() => {});
    }
  }, [removeMilestone, selectedGoalId]);

  // Detail view
  if (selectedGoalId) {
    const rawGoal = goalDetail || goals.find(g => (g._id || g.id) === selectedGoalId);
    if (rawGoal) {
      const goalWithMilestones = {
        ...rawGoal,
        milestones: (detailMilestones || []).map(m => ({ id: m._id, _id: m._id, name: m.title, completed: m.status === 'completed', status: m.status })),
        tasks: detailTasks || [],
      };
      const goalId = selectedGoalId;

      return (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setSelectedGoalId(null); setGoalDetail(null); setShowTimeline(false); refresh(); }}
                className="flex items-center gap-1.5 text-xs text-nexus-subtle/50 hover:text-white/70 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back to Goals
              </button>
              <button
                onClick={() => handleToggleTimeline(goalId)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${showTimeline ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/70' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10" y1="2" x2="10" y2="6"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="2" y1="8" x2="22" y2="8"/><rect x="4" y="10" width="16" height="12" rx="2"/>
                </svg>
                Timeline
              </button>
            </div>

            {showTimeline ? (
              <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-medium text-white/70 mb-4">Timeline</h2>
                <GoalTimeline events={timelineEvents} loading={timelineLoading} />
              </div>
            ) : (
              <GoalDetail
                goal={goalWithMilestones}
                onBack={() => {}}
                onUpdate={(updates) => { update(goalId, updates).then(() => goalApi.getGoal(goalId).then(r => { if (r?.goal) setGoalDetail(r.goal); })); }}
                onAddMilestone={(name) => { addMilestone(goalId, name); goalApi.getGoal(goalId).then(r => { if (r?.milestones) setDetailMilestones(r.milestones); }).catch(() => {}); }}
                onToggleMilestone={handleToggleMilestone}
                onRemoveMilestone={handleRemoveMilestone}
              />
            )}
          </div>
        </div>
      );
    }
  }

  // Dashboard view
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Goals Dashboard</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Track, manage, and achieve what matters</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Goal
          </button>
        </motion.div>

        <GoalStatistics stats={stats} loading={statsLoading} />

        <GoalFilters onFilter={handleFilter} />

        <AnimatePresence>
          {showForm && (
            <GoalForm
              goal={editingGoal ? { ...editingGoal, milestones: editingGoal.milestones || [] } : null}
              onSubmit={async (data) => {
                if (data.generatedPlan) {
                  await createWithPlan(data);
                } else if (editingGoal) {
                  await update(editingGoal._id || editingGoal.id, data);
                } else {
                  await create(data);
                }
                setShowForm(false);
                setEditingGoal(null);
                goalApi.getGoalStats().then(r => { if (r?.stats) setStats(r.stats); }).catch(() => {});
              }}
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
            />
          )}
        </AnimatePresence>

        {loading && filteredGoals.length === 0 && (
          <div className="text-center py-16">
            <span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filteredGoals.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal._id || goal.id}
                  goal={goal}
                  onClick={handleGoalClick}
                  onEdit={(g) => { setEditingGoal(goal); setShowForm(true); }}
                  onDelete={(id) => remove(id).then(() => goalApi.getGoalStats().then(r => { if (r?.stats) setStats(r.stats); }).catch(() => {}))}
                  onComplete={(id) => completeGoal(id).then(() => { refresh(); goalApi.getGoalStats().then(r => { if (r?.stats) setStats(r.stats); }).catch(() => {}); })}
                  onReactivate={(id) => reactivateGoal(id).then(() => { refresh(); })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredGoals.length === 0 && goals.length > 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No goals match your filters</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {!loading && goals.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/60 font-medium">No Goals Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first goal to start tracking what matters.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
            >
              Create Your First Goal
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
