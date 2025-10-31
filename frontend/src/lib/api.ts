import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getDashboard: () => api.get('/user/dashboard'),
  getReferralLink: () => api.get('/user/referral-link'),
  getDownline: () => api.get('/user/downline'),
};

// Tree API
export const treeAPI = {
  getMyTree: (depth?: number) => api.get('/tree/my-tree', { params: { depth } }),
  getTreeStats: () => api.get('/tree/stats'),
};

// Transaction API
export const transactionAPI = {
  getTransactions: (params?: any) => api.get('/transactions', { params }),
  requestWithdrawal: (amount: number) => api.post('/transactions/withdraw', { amount }),
  getWithdrawals: () => api.get('/transactions/withdrawals'),
  getCommissions: (limit?: number) => api.get('/transactions/commissions', { params: { limit } }),
  getCommissionStats: () => api.get('/transactions/commission-stats'),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  getSystemStats: () => api.get('/admin/stats'),
  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),
  approveWithdrawal: (transactionId: string) =>
    api.post(`/admin/withdrawals/${transactionId}/approve`),
  rejectWithdrawal: (transactionId: string, reason?: string) =>
    api.post(`/admin/withdrawals/${transactionId}/reject`, { reason }),
  updateUserStatus: (userId: string, status: string) =>
    api.put(`/admin/users/${userId}/status`, { status }),
};
