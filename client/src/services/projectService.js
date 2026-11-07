import API from './api';

export const getProjectsApi = async () => {
  const response = await API.get('/projects');
  return response.data;
};

export const getProjectByIdApi = async (id) => {
  const response = await API.get(`/projects/${id}`);
  return response.data;
};

export const createProjectApi = async (projectData) => {
  const response = await API.post('/projects', projectData);
  return response.data;
};

export const updateProjectApi = async (id, projectData) => {
  const response = await API.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await API.delete(`/projects/${id}`);
  return response.data;
};

export const addMemberApi = async (projectId, memberData) => {
  const response = await API.post(`/projects/${projectId}/members`, memberData);
  return response.data;
};

export const removeMemberApi = async (projectId, userId) => {
  const response = await API.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};