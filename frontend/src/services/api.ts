import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('s2h_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Helper to extract clean error message
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    if (typeof error.response.data.error === 'string') {
      return error.response.data.error;
    }
    return JSON.stringify(error.response.data.error);
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to reach backend server. Please verify that the backend API server is running on port 5000.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};
