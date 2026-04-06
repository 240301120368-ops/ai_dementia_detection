import axios from 'axios';

// In development, connect to FastAPI on 8000. In production (bundled), use relative path so it uses the same origin.
const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8000';

// Create an axios instance with auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if we're already on an auth page, otherwise we'll loop or interrupt the user
      if (!['/login', '/signup', '/verify-otp'].includes(currentPath)) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  signup: (data) => api.post('/signup', data),
  verifySignupOTP: (email, otp_code) => api.post('/verify-signup-otp', { email, otp_code }),
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  isLoggedIn: () => !!localStorage.getItem('access_token'),
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};

// ─── Analysis ───
export const analysisAPI = {
  submitTest: (data) => api.post('/api/analysis/submit', data),
  getLatest: () => api.get('/api/analysis/latest'),
  getPatientHistory: (patientId) => api.get(`/api/patients/${patientId}/checks`),
};

// ─── Seed ───
export const seedAPI = {
  seed: () => api.post('/api/seed'),
};

export default api;
