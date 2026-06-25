import api from './api';

export const getCoachCard = () => api.get('/coach/card').then(r => r.data);
export const getDailyBrief = (refresh) => api.get('/coach/brief', { params: { refresh } }).then(r => r.data);
export const getDailyReview = (refresh) => api.get('/coach/review', { params: { refresh } }).then(r => r.data);
export const getWeeklyReview = (refresh) => api.get('/coach/weekly', { params: { refresh } }).then(r => r.data);
export const getProductivityScores = () => api.get('/coach/productivity').then(r => r.data);
export const getRecommendations = () => api.get('/coach/recommendations').then(r => r.data);
export const getMotivation = () => api.get('/coach/motivation').then(r => r.data);
export const getCoachDashboard = () => api.get('/coach/dashboard').then(r => r.data);
