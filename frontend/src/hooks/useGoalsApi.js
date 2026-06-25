import { useState, useCallback, useEffect } from 'react';
import * as goalApi from '../services/goalApi';

export function useGoalsApi() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await goalApi.getGoals();
      if (res?.goals) setGoals(res.goals);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data) => {
    try {
      const res = await goalApi.createGoal(data);
      if (res?.goal) await refresh();
      return res;
    } catch { return null; }
  }, [refresh]);

  const createWithPlan = useCallback(async (goalData) => {
    try {
      const res = await goalApi.createGoal({
        title: goalData.title,
        description: goalData.description || '',
        category: goalData.category || 'general',
        generatePlan: true,
      });
      if (res?.goal) await refresh();
      return res;
    } catch { return null; }
  }, [refresh]);

  const update = useCallback(async (id, updates) => {
    try {
      const res = await goalApi.updateGoal(id, updates);
      if (res?.goal) setGoals(prev => prev.map(g => g._id === id ? res.goal : g));
      return res?.goal;
    } catch { return null; }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await goalApi.deleteGoal(id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch { /* ignore */ }
  }, []);

  const completeGoal = useCallback(async (id) => {
    const updated = await update(id, { status: 'completed' });
    return updated;
  }, [update]);

  const reactivateGoal = useCallback(async (id) => {
    const updated = await update(id, { status: 'active' });
    return updated;
  }, [update]);

  const pauseGoal = useCallback(async (id) => {
    const updated = await update(id, { status: 'paused' });
    return updated;
  }, [update]);

  // ── Milestones ──
  const addMilestone = useCallback(async (goalId, title, phase) => {
    try {
      const res = await goalApi.createMilestone(goalId, { title, phase });
      return res?.milestone;
    } catch { return null; }
  }, []);

  const toggleMilestone = useCallback(async (milestoneId) => {
    try {
      const res = await goalApi.toggleMilestone(milestoneId);
      if (res?.milestone) {
        setGoals(prev => prev.map(g =>
          g._id === res.milestone.goalId
            ? { ...g, progress: g.progress }
            : g
        ));
        refresh();
      }
      return res?.milestone;
    } catch { return null; }
  }, [refresh]);

  const removeMilestone = useCallback(async (milestoneId) => {
    try {
      await goalApi.deleteMilestone(milestoneId);
      return true;
    } catch { return false; }
  }, []);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const pausedGoals = goals.filter(g => g.status === 'paused');

  return {
    goals,
    activeGoals,
    completedGoals,
    pausedGoals,
    loading,
    editingGoal,
    showForm,
    setEditingGoal,
    setShowForm,
    create,
    createWithPlan,
    update,
    remove,
    completeGoal,
    reactivateGoal,
    pauseGoal,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    refresh,
  };
}
