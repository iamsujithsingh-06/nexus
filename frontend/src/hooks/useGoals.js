import { useState, useCallback, useEffect } from 'react';
import * as goalService from '../services/goalService';
import * as taskService from '../services/taskService';

export function useGoals() {
  const [goals, setGoals] = useState(() => goalService.getAllGoals());
  const [editingGoal, setEditingGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    setGoals(goalService.getAllGoals());
  }, []);

  useEffect(() => {
    const allTasks = taskService.getAllTasks();
    goals.forEach((g) => {
      const updated = goalService.recalculateProgress(g.id, allTasks);
      if (updated && updated.progress !== g.progress) {
        refresh();
      }
    });
  }, []);

  const create = useCallback((data) => {
    goalService.createGoal(data);
    refresh();
  }, [refresh]);

  const createWithPlan = useCallback((goalData, plan) => {
    goalService.saveAIPlan(goalData, plan, taskService);
    refresh();
  }, [refresh]);

  const update = useCallback((id, updates) => {
    goalService.updateGoal(id, updates);
    refresh();
  }, [refresh]);

  const remove = useCallback((id) => {
    goalService.deleteGoal(id);
    refresh();
  }, [refresh]);

  const complete = useCallback((id) => {
    goalService.completeGoal(id);
    refresh();
  }, [refresh]);

  const reactivate = useCallback((id) => {
    goalService.reactivateGoal(id);
    refresh();
  }, [refresh]);

  const addMilestone = useCallback((goalId, name) => {
    const updated = goalService.addMilestone(goalId, name);
    if (updated) refresh();
    return updated;
  }, [refresh]);

  const toggleMilestone = useCallback((goalId, milestoneId) => {
    const updated = goalService.toggleMilestone(goalId, milestoneId);
    if (updated) {
      const allTasks = taskService.getAllTasks();
      goalService.recalculateProgress(goalId, allTasks);
      refresh();
    }
    return updated;
  }, [refresh]);

  const removeMilestone = useCallback((goalId, milestoneId) => {
    const updated = goalService.removeMilestone(goalId, milestoneId);
    if (updated) {
      const allTasks = taskService.getAllTasks();
      goalService.recalculateProgress(goalId, allTasks);
      refresh();
    }
    return updated;
  }, [refresh]);

  const activeGoals = goals.filter((g) => g.status === 'Active');
  const completedGoals = goals.filter((g) => g.status === 'Completed');

  return {
    goals,
    activeGoals,
    completedGoals,
    editingGoal,
    showForm,
    setEditingGoal,
    setShowForm,
    create,
    createWithPlan,
    update,
    remove,
    complete,
    reactivate,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    refresh,
  };
}
