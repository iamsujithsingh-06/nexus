import StorageService from './storage/StorageService';

const TASK_CATEGORIES = ['Coding', 'Learning', 'Workout', 'Other'];
const TASK_STATUSES = ['Pending', 'Completed'];

let idCounter = Date.now();
function generateId() {
  return `task_${++idCounter}`;
}

const store = new StorageService('nexus_task');

export { TASK_CATEGORIES, TASK_STATUSES };

export function createTask({ title, description, category, dueDate, goalId, milestoneId }) {
  const task = {
    id: generateId(),
    title,
    description: description || '',
    status: 'Pending',
    category: category || 'Other',
    dueDate: dueDate || null,
    goalId: goalId || null,
    milestoneId: milestoneId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.save(task);
  return task;
}

export function updateTask(id, updates) {
  const task = store.get(id);
  if (!task) return null;
  const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function deleteTask(id) {
  store.delete(id);
}

export function getTask(id) {
  return store.get(id);
}

export function getAllTasks() {
  return store.getAll();
}

export function toggleTaskStatus(id) {
  const task = store.get(id);
  if (!task) return null;
  const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
  return updateTask(id, { status: newStatus });
}

export function getTodayTasks() {
  const today = new Date().toISOString().slice(0, 10);
  return store.getAll().filter((t) => {
    if (!t.dueDate) return false;
    return t.dueDate.slice(0, 10) === today;
  });
}

export function getTasksByCategory(category) {
  return store.getAll().filter((t) => t.category === category);
}

export function getTasksByGoal(goalId) {
  return store.getAll().filter((t) => t.goalId === goalId);
}

export function getTasksByMilestone(milestoneId) {
  return store.getAll().filter((t) => t.milestoneId === milestoneId);
}

export function getPendingTasks() {
  return store.getAll().filter((t) => t.status === 'Pending');
}

export function getCompletedTasks() {
  return store.getAll().filter((t) => t.status === 'Completed');
}

export function getTodayCompletionPercent() {
  const todayTasks = getTodayTasks();
  if (todayTasks.length === 0) return 100;
  const done = todayTasks.filter((t) => t.status === 'Completed').length;
  return Math.round((done / todayTasks.length) * 100);
}

export function getTodayCompletionCount() {
  const todayTasks = getTodayTasks();
  const done = todayTasks.filter((t) => t.status === 'Completed').length;
  return { done, total: todayTasks.length };
}
