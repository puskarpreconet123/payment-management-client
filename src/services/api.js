import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rf_token');
      localStorage.removeItem('rf_user');

      const isMerchantPath = window.location.pathname.startsWith('/merchant');
      window.location.href = isMerchantPath ? '/merchant/login' : '/login';
    }
    return Promise.reject(error);
  }
);

// ── Admin ──────────────────────────────────────
export const adminLogin = (data) => api.post('/api/admin/login', data);

export const getAdminDashboard = () => api.get('/api/admin/transactions?limit=5');
export const getAdminTransactions = (params) => api.get('/api/admin/transactions', { params });

export const getMerchants = (params) => api.get('/api/admin/merchants', { params });
export const getMerchant = (id) => api.get(`/api/admin/merchants/${id}`);
export const createMerchant = (data) => api.post('/api/admin/merchants', data);
export const updateMerchantStatus = (id, status) => api.patch(`/api/admin/merchants/${id}/status`, { status });
export const assignMids = (id, mid_ids) => api.post(`/api/admin/merchants/${id}/mids`, { mid_ids });

export const getMids = () => api.get('/api/admin/mids');
export const getMidPerformance = () => api.get('/api/admin/mids/performance');
export const createMid = (data) => api.post('/api/admin/mids', data);
export const updateMidStatus = (id, status) => api.patch(`/api/admin/mids/${id}/status`, { status });

export const getWebhookLogs = (params) => api.get('/api/admin/webhook-logs', { params });

// ── Merchant ───────────────────────────────────
export const merchantLogin = (data) => api.post('/api/merchant/login', data);
export const getMerchantProfile = () => api.get('/api/merchant/profile');
export const getMerchantTransactions = (params) => api.get('/api/merchant/transactions', { params });
export const getMerchantTransaction = (id) => api.get(`/api/merchant/transactions/${id}`);
export const regenerateToken = () => api.post('/api/merchant/token/regenerate');
export const generateToken = () => api.post('/api/merchant/token/generate');
export const updateWebhookUrl = (webhook_url) => api.patch('/api/merchant/webhook-url', { webhook_url });
export const getAssignedMids = () => api.get('/api/merchant/mids');

// ── Payments ───────────────────────────────────
export const createPayment = (data) => api.post('/api/payments/create', data);
export const getPaymentStatus = (payment_id) => api.get(`/api/payments/${payment_id}`);
export const confirmPayment = (payment_id, utr) => api.post(`/api/payments/${payment_id}/confirm`, { utr });
export const cancelPayment = (payment_id) => api.post(`/api/payments/${payment_id}/cancel`);
export const listPayments = (params) => api.get('/api/payments', { params });

export default api;
