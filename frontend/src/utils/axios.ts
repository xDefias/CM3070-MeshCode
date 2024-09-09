// src/utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}`,
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
