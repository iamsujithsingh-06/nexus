import { useState, useCallback } from 'react';
import * as projectService from '../services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState(() => projectService.getAllProjects());
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const refresh = useCallback(() => {
    setProjects(projectService.getAllProjects());
  }, []);

  const create = useCallback((data) => {
    projectService.createProject(data);
    refresh();
  }, [refresh]);

  const update = useCallback((id, updates) => {
    projectService.updateProject(id, updates);
    refresh();
  }, [refresh]);

  const remove = useCallback((id) => {
    projectService.deleteProject(id);
    refresh();
  }, [refresh]);

  const complete = useCallback((id) => {
    projectService.completeProject(id);
    refresh();
  }, [refresh]);

  const reactivate = useCallback((id) => {
    projectService.reactivateProject(id);
    refresh();
  }, [refresh]);

  const activeProjects = projects.filter((p) => p.status === 'Active');
  const completedProjects = projects.filter((p) => p.status === 'Completed');

  return {
    projects,
    activeProjects,
    completedProjects,
    editingProject,
    setEditingProject,
    showForm,
    setShowForm,
    create,
    update,
    remove,
    complete,
    reactivate,
    refresh,
  };
}
