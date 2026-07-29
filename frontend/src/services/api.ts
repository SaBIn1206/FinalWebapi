import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bakeryHubToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bakeryHubToken');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
