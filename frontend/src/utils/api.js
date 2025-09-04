import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Resources API calls
export const resourcesAPI = {
  getAll: (params = {}) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (formData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Ratings API calls
export const ratingsAPI = {
  addRating: (ratingData) => api.post('/ratings', ratingData),
  getByResource: (resourceId, params = {}) => api.get(`/ratings/resource/${resourceId}`, { params }),
  getByUser: (userId, params = {}) => api.get(`/ratings/user/${userId}`, { params }),
  getMyRatings: (params = {}) => api.get('/ratings/my-ratings', { params }),
  delete: (ratingId) => api.delete(`/ratings/${ratingId}`),
  getStats: (resourceId) => api.get(`/ratings/stats/${resourceId}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
