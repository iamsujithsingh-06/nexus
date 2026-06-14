import { useState, useCallback, useMemo } from 'react';
import * as taskService from '../services/taskService';
import * as streakService from '../services/streakService';
import { linkTaskToGoal, unlinkTaskFromGoal, recalculateProgress } from '../services/goalService';
import { getAllGoals } from '../services/goalService';

export function useTasks() {
  const [tasks, setTasks] = useState(() => taskService.getAllTasks());
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const refresh = useCallback(() => {
    setTasks(taskService.getAllTasks());
  }, []);

  const create = useCallback((data) => {
    const task = taskService.createTask(data);
    if (data.goalId) {
      linkTaskToGoal(data.goalId, task.id);
    }
    refresh();
    return task;
  }, [refresh]);

  const update = useCallback((id, updates) => {
    const old = taskService.getTask(id);
    const updated = taskService.updateTask(id, updates);
    if (updated && old && old.goalId !== updates.goalId) {
      if (old.goalId) unlinkTaskFromGoal(old.goalId, id);
      if (updates.goalId) linkTaskToGoal(updates.goalId, id);
    }
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback((id) => {
    const task = taskService.getTask(id);
    if (task && task.goalId) {
      unlinkTaskFromGoal(task.goalId, id);
    }
    taskService.deleteTask(id);
    refresh();
  }, [refresh]);

  const toggleStatus = useCallback((id) => {
    const updated = taskService.toggleTaskStatus(id);
    if (updated) {
      streakService.markStreakFromTask(updated);
      if (updated.goalId) {
        const allTasks = taskService.getAllTasks();
        recalculateProgress(updated.goalId, allTasks);
      }
    }
    refresh();
    return updated;
  }, [refresh]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory);
    }
    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }
    result.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    return result;
  }, [tasks, filterCategory, filterStatus, sortBy]);

  const todayTasks = useMemo(() => taskService.getTodayTasks(), [tasks]);
  const todayCompletion = useMemo(() => taskService.getTodayCompletionCount(), [tasks]);
  const todayPercent = useMemo(() => taskService.getTodayCompletionPercent(), [tasks]);

  return {
    tasks,
    filteredTasks,
    todayTasks,
    todayCompletion,
    todayPercent,
    filterCategory,
    filterStatus,
    sortBy,
    setFilterCategory,
    setFilterStatus,
    setSortBy,
    create,
    update,
    remove,
    toggleStatus,
    refresh,
  };
}
