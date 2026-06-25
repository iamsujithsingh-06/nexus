import api from './api';

export const getTasks = (params = {}) => api.get('/tasks', { params }).then(r => r.data);
export const getTask = (id) => api.get(`/tasks/${id}`).then(r => r.data);
export const createTask = (data) => api.post('/tasks', data).then(r => r.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(r => r.data);
export const toggleTask = (id) => api.patch(`/tasks/${id}/toggle`).then(r => r.data);

export const getTaskDashboard = () => api.get('/tasks/dashboard').then(r => r.data);
export const getTaskStats = () => api.get('/tasks/stats').then(r => r.data);
export const getDailyPlan = () => api.get('/tasks/plan').then(r => r.data);

export const generateTasksFromGoal = (goalId) => api.post(`/tasks/generate/goal/${goalId}`).then(r => r.data);
export const generateTasksFromLearning = (pathId) => api.post(`/tasks/generate/learning/${pathId}`).then(r => r.data);
