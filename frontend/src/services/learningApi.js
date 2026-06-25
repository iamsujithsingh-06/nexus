import api from './api';

export const getLearningPaths = (params = {}) => api.get('/learning', { params }).then(r => r.data);
export const getLearningPath = (id) => api.get(`/learning/${id}`).then(r => r.data);
export const createLearningPath = (data) => api.post('/learning', data).then(r => r.data);
export const updateLearningPath = (id, data) => api.put(`/learning/${id}`, data).then(r => r.data);
export const deleteLearningPath = (id) => api.delete(`/learning/${id}`).then(r => r.data);

export const getDashboard = () => api.get('/learning/dashboard').then(r => r.data);
export const getStats = () => api.get('/learning/stats').then(r => r.data);
export const searchLearning = (q) => api.get('/learning/search', { params: { q } }).then(r => r.data);

export const getDueRevisions = () => api.get('/learning/revisions/due').then(r => r.data);
export const completeRevision = (id) => api.patch(`/learning/revisions/${id}/complete`).then(r => r.data);

export const recordStudyTime = (id, hours) => api.post(`/learning/${id}/study`, { hours }).then(r => r.data);

export const getTopics = (pathId) => api.get(`/learning/${pathId}/topics`).then(r => r.data);
export const createTopic = (pathId, data) => api.post(`/learning/${pathId}/topics`, data).then(r => r.data);
export const updateTopic = (topicId, data) => api.put(`/learning/topics/${topicId}`, data).then(r => r.data);
export const deleteTopic = (topicId) => api.delete(`/learning/topics/${topicId}`).then(r => r.data);

export const getTopicNotes = (topicId) => api.get(`/learning/topics/${topicId}/notes`).then(r => r.data);
export const saveTopicNote = (topicId, data, pathId) => api.post(`/learning/topics/${topicId}/notes`, data, { params: { pathId } }).then(r => r.data);

export const getPracticeProblems = (params = {}) => api.get('/learning/problems', { params }).then(r => r.data);
export const createPracticeProblem = (data) => api.post('/learning/problems', data).then(r => r.data);
export const updatePracticeProblem = (id, data) => api.put(`/learning/problems/${id}`, data).then(r => r.data);
export const deletePracticeProblem = (id) => api.delete(`/learning/problems/${id}`).then(r => r.data);
