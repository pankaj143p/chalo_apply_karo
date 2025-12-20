import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
  getUserById: (userId) => api.get(`/api/auth/users/${userId}`),
};

// Jobs API
export const jobsAPI = {
  getActiveJobs: (params) => 
    api.get('/api/jobs/public/active', { params }),
  getRecentJobs: (params) => 
    api.get('/api/jobs/public/latest', { params }),
  getLatestJobs: (limit = 10) => 
    api.get(`/api/jobs/public/latest?limit=${limit}`),
  searchJobs: (params) => 
    api.get('/api/jobs/search', { params }),
  getJobById: (id) => 
    api.get(`/api/jobs/${id}`),
  getMyJobs: (params) => 
    api.get('/api/jobs/employer/my-jobs', { params }),
  createJob: (data) => 
    api.post('/api/jobs', data),
  updateJob: (id, data) => 
    api.put(`/api/jobs/${id}`, data),
  deleteJob: (id) => 
    api.delete(`/api/jobs/${id}`),
  getLocations: () => 
    api.get('/api/jobs/public/locations'),
  getSkills: () => 
    api.get('/api/jobs/public/skills'),
};

// Favorites API
export const favoritesAPI = {
  getMyFavorites: (params) => 
    api.get('/api/jobs/favorites', { params }),
  getFavorites: (params) => 
    api.get('/api/jobs/favorites', { params }),
  addToFavorites: (jobId) => 
    api.post(`/api/jobs/favorites/${jobId}`),
  removeFromFavorites: (jobId) => 
    api.delete(`/api/jobs/favorites/${jobId}`),
  checkFavoriteStatus: (jobId) => 
    api.get(`/api/jobs/favorites/${jobId}/status`),
};

// Applications API
export const applicationsAPI = {
  apply: (data) => 
    api.post('/api/applications', data),
  getMyApplications: (params) => 
    api.get('/api/applications/my-applications', { params }),
  getEmployerApplications: (params) => 
    api.get('/api/applications/employer/applications', { params }),
  getApplicationsForJob: (jobId, params) => 
    api.get(`/api/applications/job/${jobId}`, { params }),
  getApplicationsByJob: (jobId, params) => 
    api.get(`/api/applications/job/${jobId}`, { params }),
  getApplicationById: (id) => 
    api.get(`/api/applications/${id}`),
  updateApplicationStatus: (id, status) => 
    api.put(`/api/applications/${id}/status`, { status }),
  updateApplication: (id, data) => 
    api.put(`/api/applications/${id}`, data),
  withdrawApplication: (id) => 
    api.delete(`/api/applications/${id}/withdraw`),
  checkIfApplied: (jobId) => 
    api.get(`/api/applications/check/${jobId}`),
  getApplicationsByStatus: (status, params) => 
    api.get(`/api/applications/status/${status}`, { params }),
  sendInterviewEmail: (applicationId, data) =>
    api.post(`/api/applications/${applicationId}/send-interview-email`, data),
  sendSelectionEmail: (applicationId, data) =>
    api.post(`/api/applications/${applicationId}/send-selection-email`, data),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data) => 
    api.post('/api/messages', data),
  getMessages: (conversationId) => 
    api.get(`/api/messages/conversation/${conversationId}`),
  getConversation: (partnerId) => 
    api.get(`/api/messages/conversation/${partnerId}`),
  getConversations: () => 
    api.get('/api/messages/conversations'),
  startConversation: (userId) => 
    api.post(`/api/messages/conversations/${userId}`),
  getUnreadCount: () => 
    api.get('/api/messages/unread-count'),
  markAsRead: (senderId) => 
    api.post(`/api/messages/mark-read/${senderId}`),
  getMessagesByApplication: (applicationId, page = 0, size = 50) => 
    api.get(`/api/messages/application/${applicationId}?page=${page}&size=${size}`),
};

export default api;
