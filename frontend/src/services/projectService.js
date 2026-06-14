import StorageService from './storage/StorageService';

const PROJECT_CATEGORIES = ['Software', 'Design', 'Writing', 'Learning', 'Other'];
const PROJECT_STATUSES = ['Active', 'Completed'];

let idCounter = Date.now();
function generateId() {
  return `project_${++idCounter}`;
}

const store = new StorageService('nexus_project');

export { PROJECT_CATEGORIES, PROJECT_STATUSES };

export function createProject({ name, description, category }) {
  const project = {
    id: generateId(),
    name,
    description: description || '',
    category: category || 'Other',
    progress: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.save(project);
  return project;
}

export function updateProject(id, updates) {
  const project = store.get(id);
  if (!project) return null;
  const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function deleteProject(id) {
  store.delete(id);
}

export function getProject(id) {
  return store.get(id);
}

export function getAllProjects() {
  return store.getAll();
}

export function getActiveProjects() {
  return store.getAll().filter((p) => p.status === 'Active');
}

export function getCompletedProjects() {
  return store.getAll().filter((p) => p.status === 'Completed');
}

export function completeProject(id) {
  return updateProject(id, { status: 'Completed', progress: 100 });
}

export function reactivateProject(id) {
  return updateProject(id, { status: 'Active' });
}
