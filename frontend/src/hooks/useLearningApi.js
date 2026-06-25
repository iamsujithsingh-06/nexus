import { useState, useCallback, useEffect } from 'react';
import * as learningApi from '../services/learningApi';

export function useLearningApi() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await learningApi.getLearningPaths();
      if (res?.paths) setPaths(res.paths);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await learningApi.getDashboard();
      if (res) setDashboard(res);
      return res;
    } catch { return null; }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await learningApi.getStats();
      if (res?.stats) setStats(res.stats);
      return res?.stats;
    } catch { return null; }
  }, []);

  const create = useCallback(async (data) => {
    try {
      const res = await learningApi.createLearningPath(data);
      if (res?.path) { setPaths(prev => [res.path, ...prev]); }
      return res?.path;
    } catch { return null; }
  }, []);

  const update = useCallback(async (id, data) => {
    try {
      const res = await learningApi.updateLearningPath(id, data);
      if (res?.path) { setPaths(prev => prev.map(p => p._id === id ? res.path : p)); }
      return res?.path;
    } catch { return null; }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await learningApi.deleteLearningPath(id);
      setPaths(prev => prev.filter(p => p._id !== id));
    } catch { /* ignore */ }
  }, []);

  return {
    paths, loading, dashboard, stats,
    refresh, loadDashboard, loadStats,
    create, update, remove,
  };
}
