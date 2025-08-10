import axios from 'axios';

const base = (import.meta as any).env?.VITE_API_URL || window.location.origin;

export const api = axios.create({
  baseURL: `${base.replace(/\/$/, '')}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


