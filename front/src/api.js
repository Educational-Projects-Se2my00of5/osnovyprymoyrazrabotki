import axios from 'axios';
import { clearAuth, getAccessToken, getRefreshToken, setAuthTokens } from './api/storage';

const API_URL = process.env.REACT_APP_API_URL+"/api" || 'http://localhost:8080/api';

// Основной клиент для всех запросов
export const apiClient = axios.create({ baseURL: API_URL });

// Request interceptor: добавляем access token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: попытка refresh при 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          setAuthTokens({ accessToken, refreshToken: newRefreshToken });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export * from './api/auth';
export * from './api/projects';
export * from './api/user';
export * from './api/tasks';