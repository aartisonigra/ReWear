import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api', // This will be proxied to your PHP backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password, confirmPassword: password }),
  
  logout: () => api.post('/auth/logout'),
};

export const itemsAPI = {
  list: (params?: any) => api.get('/items/list', { params }),
  
  create: (formData: FormData) =>
    api.post('/items/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  get: (id: number) => api.get(`/items/${id}`),
  
  update: (id: number, data: any) => api.put(`/items/${id}`, data),
  
  delete: (id: number) => api.delete(`/items/${id}`),
};

export const swapsAPI = {
  create: (data: any) => api.post('/swaps/create', data),
  
  list: (params?: any) => api.get('/swaps/list', { params }),
  
  update: (id: number, data: any) => api.put(`/swaps/${id}`, data),
};

export const userAPI = {
  profile: () => api.get('/user/profile'),
  
  updateProfile: (data: any) => api.put('/user/profile', data),
  
  stats: () => api.get('/user/stats'),
};

export const adminAPI = {
  items: (status?: string) => api.get('/admin/items', { params: { status } }),
  
  approveItem: (itemId: number) =>
    api.put('/admin/items', { item_id: itemId, action: 'approve' }),
  
  rejectItem: (itemId: number, reason: string) =>
    api.put('/admin/items', { item_id: itemId, action: 'reject', reason }),
  
  users: () => api.get('/admin/users'),
};