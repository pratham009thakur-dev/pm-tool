import API from './api';

export const getDashboardStatsApi = async () => {
  const response = await API.get('/analytics/dashboard');
  return response.data;
};

export const getProjectAnalyticsApi = async (projectId) => {
  const response = await API.get(`/analytics/project/${projectId}`);
  return response.data;
};