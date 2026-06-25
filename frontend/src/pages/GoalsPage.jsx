import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalsApi } from '../hooks/useGoalsApi';
import * as goalApi from '../services/goalApi';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import GoalDetail from '../components/GoalDetail';

function normalizeGoal(g) {
  return {
    ...g,
    id: g._id || g.id,
    milestones: g.milestones || [],
    status: g.status === 'active' ? 'Active' : g.status === 'completed' ? 'Completed' : g.status === 'paused' ? 'Paused' : g.status,
    priority: g.priority === 3 ? 'Medium' : g.priority === 2 ? 'Low' : g.priority === 1 ? 'Lowest' : g.priority === 4 ? 'High' : g.priority === 5 ? 'Highest' : g.priority,
  };
}

export default function GoalsPage() {
  const {
    goals, activeGoals, completedGoals, pausedGoals, loading,
    create, createWithPlan, update, remove,
    completeGoal, reactivateGoal, pauseGoal, showForm, setShowForm,
    editingGoal, setEditingGoal,
    addMilestone, toggleMilestone, removeMilestone, refresh,
  } = useGoalsApi();
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [detailMilestones, setDetailMilestones] = useState([]);
  const [detailTasks, setDetailTasks] = useState([]);

  const rawSelected = selectedGoalId
    ? goals.find((g) => g._id === selectedGoalId) || goalDetail
    : null;
  const selectedGoal = rawSelected ? normalizeGoal(rawSelected) : null;

  useEffect(() => {
    if (selectedGoalId) {
      goalApi.getGoal(selectedGoalId).then(res => {
        if (res?.goal) setGoalDetail(res.goal);
        if (res?.milestones) setDetailMilestones(res.milestones);
        if (res?.tasks) setDetailTasks(res.tasks);
      }).catch(() => {});
    } else {
      setGoalDetail(null);
      setDetailMilestones([]);
      setDetailTasks([]);
    }
  }, [selectedGoalId]);

  if (selectedGoal) {
    const goalWithMilestones = {
      ...selectedGoal,
      milestones: detailMilestones.map(m => ({
        id: m._id,
        _id: m._id,
        name: m.title,
        completed: m.status === 'completed',
        status: m.status,
      })),
      tasks: detailTasks,
    };
    const goalId = selectedGoal._id || selectedGoal.id;

    const handleToggleMilestone = async (msId) => {
      const result = await toggleMilestone(msId);
      if (result) {
        goalApi.getGoal(goalId).then(res => {
          if (res?.milestones) setDetailMilestones(res.milestones);
        }).catch(() => {});
      }
    };

    const handleRemoveMilestone = async (msId) => {
      const result = await removeMilestone(msId);
      if (result) {
        goalApi.getGoal(goalId).then(res => {
          if (res?.goal) setGoalDetail(res.goal);
          if (res?.milestones) setDetailMilestones(res.milestones);
        }).catch(() => {});
      }
    };

    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <GoalDetail
            goal={goalWithMilestones}
            onBack={() => setSelectedGoalId(null)}
            onUpdate={(updates) => { update(goalId, updates); }}
            onAddMilestone={(name) => { addMilestone(goalId, name); setDetailMilestones([]); }}
            onToggleMilestone={handleToggleMilestone}
            onRemoveMilestone={handleRemoveMilestone}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Goals</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Track your long-term objectives</p>
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
        </div>

        <AnimatePresence>
          {showForm && (
            <GoalForm
              goal={editingGoal ? normalizeGoal(editingGoal) : null}
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
              }}
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
            />
          )}
        </AnimatePresence>

        {loading && goals.length === 0 && (
          <div className="text-center py-12">
            <span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Active Goals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeGoals.map((goal) => {
                const normal = normalizeGoal(goal);
                return (
                  <GoalCard
                    key={normal.id}
                    goal={normal}
                    onClick={(g) => setSelectedGoalId(g._id || g.id)}
                    onEdit={(g) => { setEditingGoal(goal); setShowForm(true); }}
                    onDelete={(id) => remove(id)}
                    onComplete={(id) => completeGoal(id)}
                    onReactivate={(id) => reactivateGoal(id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {!loading && pausedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Paused</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pausedGoals.map((goal) => {
                const normal = normalizeGoal(goal);
                return (
                  <GoalCard
                    key={normal.id}
                    goal={normal}
                    onClick={(g) => setSelectedGoalId(g._id || g.id)}
                    onEdit={(g) => { setEditingGoal(goal); setShowForm(true); }}
                    onDelete={(id) => remove(id)}
                    onComplete={(id) => completeGoal(id)}
                    onReactivate={(id) => reactivateGoal(id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {!loading && completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Completed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedGoals.map((goal) => {
                const normal = normalizeGoal(goal);
                return (
                  <GoalCard
                    key={normal.id}
                    goal={normal}
                    onClick={(g) => setSelectedGoalId(g._id || g.id)}
                    onEdit={(g) => { setEditingGoal(goal); setShowForm(true); }}
                    onDelete={(id) => remove(id)}
                    onComplete={(id) => completeGoal(id)}
                    onReactivate={(id) => reactivateGoal(id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {!loading && goals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No Goals Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first goal to start tracking what matters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
