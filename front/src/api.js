import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_URL,
});

// Перехватчик запросов - добавляет токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов - обновляет токен при ошибке 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Сохраняем новый access token
          localStorage.setItem('token', accessToken);
          
          // Если пришёл новый refresh token - сохраняем его тоже
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Повторяем исходный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Если не удалось обновить токен - очищаем данные и редирект на логин
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Функция для логина
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  
  // Сохраняем refresh token если он есть
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
};

// Функция для регистрации
export const register = async (email, password, firstName, lastName) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    email,
    password,
    firstName,
    lastName
  });
  return response.data;
};

// Функция для выхода
export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    // Очищаем локальные данные в любом случае
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Функция для получения проектов
export const getProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data;
};
