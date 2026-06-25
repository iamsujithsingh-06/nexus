import { useState, useCallback, useEffect } from 'react';
import * as taskApi from '../services/taskApi';

export function useTasksApi() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await taskApi.getTasks({ limit: 100 });
      if (res?.tasks) setTasks(res.tasks);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await taskApi.getTaskDashboard();
      if (res) setDashboard(res);
      return res;
    } catch { return null; }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await taskApi.getTaskStats();
      if (res?.stats) setStats(res.stats);
      return res?.stats;
    } catch { return null; }
  }, []);

  const loadDailyPlan = useCallback(async () => {
    try {
      const res = await taskApi.getDailyPlan();
      if (res?.plan) setDailyPlan(res.plan);
      return res?.plan;
    } catch { return null; }
  }, []);

  const create = useCallback(async (data) => {
    try {
      const res = await taskApi.createTask(data);
      if (res?.task) { setTasks(prev => [res.task, ...prev]); return res.task; }
    } catch { return null; }
  }, []);

  const update = useCallback(async (id, updates) => {
    try {
      const res = await taskApi.updateTask(id, updates);
      if (res?.task) {
        setTasks(prev => prev.map(t => t._id === id ? res.task : t));
        return res.task;
      }
    } catch { return null; }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(async (id) => {
    try {
      const res = await taskApi.toggleTask(id);
      if (res?.task) {
        setTasks(prev => prev.map(t => t._id === id ? { ...t, status: res.task.status, completedAt: res.task.completedAt } : t));
        return res.task;
      }
    } catch { return null; }
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return new Date(t.dueDate).toISOString().split('T')[0] === today;
  });
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  });

  return {
    tasks, loading, dashboard, stats, dailyPlan,
    refresh, loadDashboard, loadStats, loadDailyPlan,
    create, update, remove, toggle,
    pendingTasks, completedTasks, todayTasks, overdueTasks,
  };
}
