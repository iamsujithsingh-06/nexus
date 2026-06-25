import { useState, useCallback, useEffect } from 'react';
import * as goalApi from '../services/goalApi';

export function useTasksApi() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await goalApi.getTasks();
      if (res?.tasks) setTasks(res.tasks);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (data) => {
    try {
      const res = await goalApi.createTask(data);
      if (res?.task) {
        setTasks(prev => [res.task, ...prev]);
        return res.task;
      }
    } catch { return null; }
  }, []);

  const update = useCallback(async (id, updates) => {
    try {
      const res = await goalApi.updateTask(id, updates);
      if (res?.task) {
        setTasks(prev => prev.map(t => t._id === id ? res.task : t));
        return res.task;
      }
    } catch { return null; }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await goalApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(async (id) => {
    try {
      const res = await goalApi.toggleTask(id);
      if (res?.task) {
        setTasks(prev => prev.map(t => t._id === id ? { ...t, status: res.task.status, completedAt: res.task.completedAt } : t));
        return res.task;
      }
    } catch { return null; }
  }, []);

  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return new Date(t.dueDate).toISOString().split('T')[0] === today;
  });

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return {
    tasks, loading, refresh,
    create, update, remove, toggle,
    todayTasks, pendingTasks, completedTasks,
  };
}
