import API from './api';

export const getProjectTasksApi = async (projectId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await API.get(`/tasks/project/${projectId}${query ? `?${query}` : ''}`);
  return response.data;
};

export const getTaskByIdApi = async (id) => {
  const response = await API.get(`/tasks/${id}`);
  return response.data;
};

export const createTaskApi = async (taskData) => {
  const response = await API.post('/tasks', taskData);
  return response.data;
};

export const updateTaskApi = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const updateTaskStatusApi = async (id, status, order) => {
  const response = await API.patch(`/tasks/${id}/status`, { status, order });
  return response.data;
};

export const deleteTaskApi = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

export const getTaskCommentsApi = async (taskId) => {
  const response = await API.get(`/comments/task/${taskId}`);
  return response.data;
};

export const addCommentApi = async (taskId, text) => {
  const response = await API.post('/comments', { taskId, text });
  return response.data;
};

export const getProjectActivitiesApi = async (projectId) => {
  const response = await API.get(`/activities/project/${projectId}`);
  return response.data;
};