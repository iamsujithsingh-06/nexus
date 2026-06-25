import api from './api';

export const getProjects = (params = {}) => api.get('/projects', { params }).then(r => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = (data) => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);

export const getProjectDashboard = () => api.get('/projects/dashboard').then(r => r.data);
export const getProjectStats = (id) => api.get(`/projects/${id}/stats`).then(r => r.data);
export const getProjectTimeline = (id) => api.get(`/projects/${id}/timeline`).then(r => r.data);
export const getProjectVersion = (id) => api.get(`/projects/${id}/version`).then(r => r.data);
export const searchProjects = (q) => api.get('/projects/search', { params: { q } }).then(r => r.data);

// Features
export const getFeatures = (projectId, params = {}) => api.get(`/projects/${projectId}/features`, { params }).then(r => r.data);
export const createFeature = (projectId, data) => api.post(`/projects/${projectId}/features`, data).then(r => r.data);
export const updateFeature = (projectId, featureId, data) => api.put(`/projects/${projectId}/features/${featureId}`, data).then(r => r.data);
export const deleteFeature = (projectId, featureId) => api.delete(`/projects/${projectId}/features/${featureId}`).then(r => r.data);

// Sprints
export const getSprints = (projectId) => api.get(`/projects/${projectId}/sprints`).then(r => r.data);
export const createSprint = (projectId, data) => api.post(`/projects/${projectId}/sprints`, data).then(r => r.data);
export const updateSprint = (projectId, sprintId, data) => api.put(`/projects/${projectId}/sprints/${sprintId}`, data).then(r => r.data);
export const deleteSprint = (projectId, sprintId) => api.delete(`/projects/${projectId}/sprints/${sprintId}`).then(r => r.data);

// Bugs
export const getBugs = (projectId, params = {}) => api.get(`/projects/${projectId}/bugs`, { params }).then(r => r.data);
export const createBug = (projectId, data) => api.post(`/projects/${projectId}/bugs`, data).then(r => r.data);
export const updateBug = (projectId, bugId, data) => api.put(`/projects/${projectId}/bugs/${bugId}`, data).then(r => r.data);
export const deleteBug = (projectId, bugId) => api.delete(`/projects/${projectId}/bugs/${bugId}`).then(r => r.data);
