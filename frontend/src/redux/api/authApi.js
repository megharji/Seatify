import apiClient from './client';

export const loginRequest = (payload) => apiClient.post('/auth/login', payload);
export const signupRequest = (payload) => apiClient.post('/auth/signup', payload);
export const meRequest = () => apiClient.get('/auth/me');
