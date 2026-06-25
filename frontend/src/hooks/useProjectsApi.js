import { useState, useCallback, useEffect } from 'react';
import * as projectApi from '../services/projectApi';

export function useProjectsApi() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await projectApi.getProjects({ limit: 50 });
      if (res?.projects) setProjects(res.projects);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await projectApi.getProjectDashboard();
      if (res) setDashboard(res);
      return res;
    } catch { return null; }
  }, []);

  const loadProject = useCallback(async (id) => {
    try {
      const res = await projectApi.getProject(id);
      if (res?.project) { setSelectedProject(res); return res; }
    } catch { return null; }
  }, []);

  const create = useCallback(async (data) => {
    try {
      const res = await projectApi.createProject(data);
      if (res?.project) { setProjects(prev => [res.project, ...prev]); return res.project; }
    } catch { return null; }
  }, []);

  const update = useCallback(async (id, updates) => {
    try {
      const res = await projectApi.updateProject(id, updates);
      if (res?.project) {
        setProjects(prev => prev.map(p => p._id === id ? res.project : p));
        if (selectedProject?.project?._id === id) setSelectedProject(prev => prev ? { ...prev, project: res.project } : prev);
        return res.project;
      }
    } catch { return null; }
  }, [selectedProject]);

  const remove = useCallback(async (id) => {
    try {
      await projectApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (selectedProject?.project?._id === id) setSelectedProject(null);
    } catch { /* ignore */ }
  }, [selectedProject]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const archivedProjects = projects.filter(p => p.status === 'archived');
  const pausedProjects = projects.filter(p => p.status === 'paused');

  return {
    projects, loading, dashboard, selectedProject,
    refresh, loadDashboard, loadProject,
    create, update, remove,
    activeProjects, completedProjects, archivedProjects, pausedProjects,
    setSelectedProject,
  };
}
