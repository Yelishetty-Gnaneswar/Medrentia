import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
if (rawUrl && rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl.replace(/\/$/, '')}/api`;
}
const API_BASE_URL = rawUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medrentia_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and token is invalid, clear token
      if (localStorage.getItem('medrentia_token')) {
        console.warn('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
