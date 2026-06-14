import { AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';

export default function ProjectsSection() {
  const {
    activeProjects, completedProjects,
    create, update, remove, complete, reactivate,
    showForm, setShowForm, editingProject, setEditingProject,
  } = useProjects();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Projects</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">
              {activeProjects.length} active · {completedProjects.length} completed
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Project
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <ProjectForm
              project={editingProject}
              onSubmit={(data) => {
                if (editingProject) {
                  update(editingProject.id, data);
                } else {
                  create(data);
                }
                setShowForm(false);
                setEditingProject(null);
              }}
              onCancel={() => { setShowForm(false); setEditingProject(null); }}
            />
          )}
        </AnimatePresence>

        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Current Projects</h2>
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => { setEditingProject(p); setShowForm(true); }}
                  onDelete={remove}
                  onComplete={complete}
                  onReactivate={reactivate}
                />
              ))}
            </div>
          </div>
        )}

        {completedProjects.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Completed Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => { setEditingProject(p); setShowForm(true); }}
                  onDelete={remove}
                  onComplete={complete}
                  onReactivate={reactivate}
                />
              ))}
            </div>
          </div>
        )}

        {activeProjects.length === 0 && completedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No Projects Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first project to start tracking progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
