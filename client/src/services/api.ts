import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/authStore';

// Define the standard response format
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: string | null;
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // Adjust scheme if needed, backend specific
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally and format them
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error) => {
    // If we have a structured error response, use it
    if (error.response?.data?.error) {
       return Promise.reject(new Error(error.response.data.error));
    }
    return Promise.reject(error);
  }
);

export default api;
