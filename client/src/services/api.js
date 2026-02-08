import axios from 'axios';

// Get API base URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor for error handling
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadProfileImage: (formData) => {
    return api.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Scheme API (User)
export const schemeAPI = {
  getAllSchemes: () => api.get('/schemes'),
  getSchemeById: (id) => api.get(`/schemes/${id}`),
  getMatchedSchemes: () => api.get('/schemes/match'),
};

// Organizer API
export const organizerAPI = {
  createScheme: (data) => api.post('/organizer/scheme', data),
  getMySchemes: () => api.get('/organizer/schemes'),
  updateScheme: (id, data) => api.put(`/organizer/scheme/${id}`, data),
  deleteScheme: (id) => api.delete(`/organizer/scheme/${id}`),
  submitScheme: (id) => api.post(`/organizer/scheme/${id}/submit`),
};

// Application API
export const applicationAPI = {
  submitApplication: (data) => api.post('/application/organizer', data),
  getMyApplications: () => api.get('/application/my-applications'),
  getApplicationStatus: () => api.get('/application/status'),
};

// Admin API
export const adminAPI = {
  getPendingSchemes: () => api.get('/admin/schemes/pending'),
  getAllSchemes: (status) => api.get('/admin/schemes', { params: { status } }),
  approveScheme: (id, data) => api.post(`/admin/scheme/${id}/approve`, data),
  rejectScheme: (id, data) => api.post(`/admin/scheme/${id}/reject`, data),
  toggleSchemeStatus: (id) => api.put(`/admin/scheme/${id}/toggle`),
  getPendingApplications: () => api.get('/admin/applications/pending'),
  getAllApplications: (status) => api.get('/admin/applications', { params: { status } }),
  approveApplication: (id) => api.post(`/admin/application/${id}/approve`),
  rejectApplication: (id, data) => api.post(`/admin/application/${id}/reject`, data),
};

// Scheme Application API
export const schemeApplicationAPI = {
  submitApplication: (formData) => {
    // Create axios instance with multipart/form-data
    return api.post('/scheme-applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyApplications: () => api.get('/scheme-applications/my-applications'),
  checkApplication: (schemeId) => api.get(`/scheme-applications/check/${schemeId}`),
  getSchemeApplications: (schemeId) => api.get(`/scheme-applications/scheme/${schemeId}`),
  getAllApplications: (params) => api.get('/scheme-applications', { params }),
  approveApplication: (id) => api.patch(`/scheme-applications/${id}/approve`),
  rejectApplication: (id, reason) => api.patch(`/scheme-applications/${id}/reject`, { reason }),
};

export default api;
