import api from './api';

// ── Goals ──
export const getGoals = (params = {}) => api.get('/goals', { params }).then(r => r.data);
export const getGoal = (id) => api.get(`/goals/${id}`).then(r => r.data);
export const createGoal = (data) => api.post('/goals', data).then(r => r.data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data).then(r => r.data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`).then(r => r.data);

// ── Roadmap Phases ──
export const addPhase = (goalId, data) => api.post(`/goals/${goalId}/phases`, data).then(r => r.data);
export const removePhase = (goalId, phaseId) => api.delete(`/goals/${goalId}/phases/${phaseId}`).then(r => r.data);
export const renamePhase = (goalId, phaseId, data) => api.put(`/goals/${goalId}/phases/${phaseId}`, data).then(r => r.data);

// ── Milestones ──
export const getMilestones = (goalId) => api.get(`/goals/${goalId}/milestones`).then(r => r.data);
export const createMilestone = (goalId, data) => api.post(`/goals/${goalId}/milestones`, data).then(r => r.data);
export const toggleMilestone = (milestoneId) => api.patch(`/goals/milestones/${milestoneId}/toggle`).then(r => r.data);
export const editMilestone = (milestoneId, data) => api.put(`/goals/milestones/${milestoneId}`, data).then(r => r.data);
export const deleteMilestone = (milestoneId) => api.delete(`/goals/milestones/${milestoneId}`).then(r => r.data);

// ── Tasks ──
export const getTasks = (params = {}) => api.get('/tasks', { params }).then(r => r.data);
export const createTask = (data) => api.post('/tasks', data).then(r => r.data);
export const toggleTask = (taskId) => api.patch(`/tasks/${taskId}/toggle`).then(r => r.data);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data).then(r => r.data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`).then(r => r.data);

// ── Statistics ──
export const getGoalStats = () => api.get('/goals/stats').then(r => r.data);

// ── Timeline ──
export const getGoalTimeline = (goalId) => api.get(`/goals/${goalId}/timeline`).then(r => r.data);

// ── Suggestions ──
export const getGoalSuggestions = (goalId) => api.get(`/goals/${goalId}/suggestions`).then(r => r.data);

// ── Dashboard ──
export const getDashboard = () => api.get('/goals/dashboard').then(r => r.data);

// ── Coach ──
export const getCoachInsights = () => api.get('/goals/coach').then(r => r.data);

// ── Achievements ──
export const getAchievements = () => api.get('/goals/achievements').then(r => r.data);

// ── Activity ──
export const getActivity = (limit = 30) => api.get('/goals/activity', { params: { limit } }).then(r => r.data);

// ── Streaks ──
export const getStreaks = () => api.get('/goals/streaks').then(r => r.data);

// ── Weekly Reports ──
export const getWeeklyReports = () => api.get('/goals/reports').then(r => r.data);
export const generateWeeklyReport = () => api.post('/goals/reports/generate').then(r => r.data);
