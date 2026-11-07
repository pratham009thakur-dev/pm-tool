import API from './api';

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateProfileApi = async (userData) => {
  const response = await API.put('/auth/profile', userData);
  return response.data;
};

export const searchUsersApi = async (query) => {
  const response = await API.get(`/auth/users?search=${encodeURIComponent(query)}`);
  return response.data;
};