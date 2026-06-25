import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectsApi } from '../hooks/useProjectsApi';
import * as projectApi from '../services/projectApi';
import ProjectsDashboard from '../components/ProjectsDashboard';
import ProjectCardV2 from '../components/ProjectCardV2';
import ProjectFilters from '../components/ProjectFilters';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectOverview from '../components/ProjectOverview';
import FeatureBoard from '../components/FeatureBoard';
import SprintBoard from '../components/SprintBoard';
import BugTracker from '../components/BugTracker';
import ProjectTimeline from '../components/ProjectTimeline';
import ProjectStatistics from '../components/ProjectStatistics';

export default function ProjectsPage() {
  const { projects, loading, dashboard, selectedProject, loadDashboard, create, update, remove, refresh, setSelectedProject } = useProjectsApi();

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'All', status: 'All', priority: 'All' });
  const [dashLoading, setDashLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [features, setFeatures] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    loadDashboard().then(() => setDashLoading(false));
  }, [loadDashboard]);

  useEffect(() => {
    if (!selectedProject?.project?._id) return;
    setSubLoading(true);
    const pid = selectedProject.project._id;
    Promise.all([
      projectApi.getFeatures(pid).then(r => setFeatures(r.features || [])).catch(() => {}),
      projectApi.getSprints(pid).then(r => setSprints(r.sprints || [])).catch(() => {}),
      projectApi.getBugs(pid).then(r => setBugs(r.bugs || [])).catch(() => {}),
      projectApi.getProjectTimeline(pid).then(r => setTimeline(r.timeline || [])).catch(() => {}),
      projectApi.getProjectStats(pid).then(r => setStats(r.stats || null)).catch(() => {}),
    ]).then(() => setSubLoading(false));
    setActiveTab('overview');
  }, [selectedProject?.project?._id]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) && !p.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'All' && p.category !== filters.category) return false;
      if (filters.status !== 'All' && p.status !== filters.status) return false;
      if (filters.priority !== 'All' && p.priority !== filters.priority) return false;
      return true;
    });
  }, [projects, filters]);

  const handleCreate = useCallback(async (data) => {
    const res = await create(data);
    if (res) { setShowCreate(false); setEditingProject(null); loadDashboard(); }
  }, [create, loadDashboard]);

  const handleEdit = useCallback(async (data) => {
    const res = await update(editingProject._id, data);
    if (res) { setShowCreate(false); setEditingProject(null); loadDashboard(); }
  }, [update, editingProject, loadDashboard]);

  const handleStatusChange = useCallback(async (id, status) => {
    await update(id, { status });
    if (selectedProject?.project?._id === id) {
      setSelectedProject(prev => prev ? { ...prev, project: { ...prev.project, status } } : prev);
    }
    loadDashboard();
  }, [update, selectedProject, loadDashboard, setSelectedProject]);

  const handleOpen = useCallback(async (project) => {
    const res = await projectApi.getProject(project._id);
    if (res) setSelectedProject(res);
  }, [setSelectedProject]);

  // Sub-resource handlers
  const handleCreateFeature = useCallback(async (data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.createFeature(selectedProject.project._id, data);
    if (res?.feature) setFeatures(prev => [...prev, res.feature]);
  }, [selectedProject]);

  const handleUpdateFeature = useCallback(async (featureId, data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.updateFeature(selectedProject.project._id, featureId, data);
    if (res?.feature) setFeatures(prev => prev.map(f => f._id === featureId ? res.feature : f));
  }, [selectedProject]);

  const handleDeleteFeature = useCallback(async (featureId) => {
    if (!selectedProject?.project?._id) return;
    await projectApi.deleteFeature(selectedProject.project._id, featureId);
    setFeatures(prev => prev.filter(f => f._id !== featureId));
  }, [selectedProject]);

  const handleCreateSprint = useCallback(async (data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.createSprint(selectedProject.project._id, data);
    if (res?.sprint) setSprints(prev => [res.sprint, ...prev]);
  }, [selectedProject]);

  const handleUpdateSprint = useCallback(async (sprintId, data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.updateSprint(selectedProject.project._id, sprintId, data);
    if (res?.sprint) setSprints(prev => prev.map(s => s._id === sprintId ? res.sprint : s));
  }, [selectedProject]);

  const handleDeleteSprint = useCallback(async (sprintId) => {
    if (!selectedProject?.project?._id) return;
    await projectApi.deleteSprint(selectedProject.project._id, sprintId);
    setSprints(prev => prev.filter(s => s._id !== sprintId));
  }, [selectedProject]);

  const handleCreateBug = useCallback(async (data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.createBug(selectedProject.project._id, data);
    if (res?.bug) setBugs(prev => [res.bug, ...prev]);
  }, [selectedProject]);

  const handleUpdateBug = useCallback(async (bugId, data) => {
    if (!selectedProject?.project?._id) return;
    const res = await projectApi.updateBug(selectedProject.project._id, bugId, data);
    if (res?.bug) setBugs(prev => prev.map(b => b._id === bugId ? res.bug : b));
  }, [selectedProject]);

  const handleDeleteBug = useCallback(async (bugId) => {
    if (!selectedProject?.project?._id) return;
    await projectApi.deleteBug(selectedProject.project._id, bugId);
    setBugs(prev => prev.filter(b => b._id !== bugId));
  }, [selectedProject]);

  // If viewing a single project detail
  if (selectedProject?.project) {
    const tabs = [
      { key: 'overview', label: 'Overview' },
      { key: 'features', label: `Features (${features.length})` },
      { key: 'sprints', label: `Sprints (${sprints.length})` },
      { key: 'bugs', label: `Bugs (${bugs.length})` },
      { key: 'timeline', label: 'Timeline' },
    ];
    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-1 mb-4 border-b border-white/[0.06] pb-3 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`text-2xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === t.key ? 'bg-nexus-accent/10 text-nexus-accent/80 border border-nexus-accent/20'
                    : 'text-nexus-subtle/40 hover:text-white/60 border border-transparent'
                }`}>{t.label}</button>
            ))}
            <button onClick={() => setSelectedProject(null)}
              className="ml-auto text-2xs text-nexus-subtle/30 hover:text-white/60 px-2 py-1">Close</button>
          </div>
          {activeTab === 'overview' && (
            <>
              <ProjectOverview project={selectedProject} onBack={() => setSelectedProject(null)} />
              <div className="mt-4">
                <ProjectStatistics stats={stats} loading={subLoading} />
              </div>
            </>
          )}
          {activeTab === 'features' && (
            <FeatureBoard features={features} projectId={selectedProject.project._id}
              onCreate={handleCreateFeature} onUpdate={handleUpdateFeature} onDelete={handleDeleteFeature} />
          )}
          {activeTab === 'sprints' && (
            <SprintBoard sprints={sprints} projectId={selectedProject.project._id}
              onCreate={handleCreateSprint} onUpdate={handleUpdateSprint} onDelete={handleDeleteSprint} />
          )}
          {activeTab === 'bugs' && (
            <BugTracker bugs={bugs} projectId={selectedProject.project._id}
              onCreate={handleCreateBug} onUpdate={handleUpdateBug} onDelete={handleDeleteBug} />
          )}
          {activeTab === 'timeline' && (
            <ProjectTimeline timeline={timeline} loading={subLoading} />
          )}
        </div>
      </div>
    );
  }

  // Main projects list view
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Projects</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Manage your software development projects</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
        </div>

        <ProjectsDashboard data={dashboard} loading={dashLoading} />
        <ProjectFilters onFilter={setFilters} />

        {loading && projects.length === 0 && (
          <div className="text-center py-12"><span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" /></div>
        )}

        {!loading && (
          <div className="space-y-6">
            {filteredProjects.length > 0 && (
              <div className="space-y-2">
                {filteredProjects.map(p => (
                  <ProjectCardV2
                    key={p._id}
                    project={p}
                    onOpen={handleOpen}
                    onEdit={(p) => { setEditingProject(p); setShowCreate(true); }}
                    onDelete={remove}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
            {!loading && filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                <p className="text-sm text-nexus-subtle/40">No Projects Yet</p>
                <p className="text-xs text-nexus-subtle/20 mt-1">Create your first project to start tracking.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            key={editingProject?._id || 'new'}
            initial={editingProject}
            onSubmit={editingProject ? handleEdit : handleCreate}
            onCancel={() => { setShowCreate(false); setEditingProject(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
