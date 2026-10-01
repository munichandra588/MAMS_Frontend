import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl(),
});
// Add JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);

// Dashboard
export const getDashboardSummary = (baseId) => 
  API.get('/dashboard/summary', { params: baseId ? { baseId } : {} });

// Assets
export const getAssets = (baseId, categoryId) => {
  const params = {};
  if (baseId) params.baseId = baseId;
  if (categoryId) params.categoryId = categoryId;
  return API.get('/assets', { params });
};
export const getAssetById = (id) => API.get(`/assets/${id}`);
export const createAsset = (data) => API.post('/assets', data);
export const updateAsset = (id, data) => API.put(`/assets/${id}`, data);

// Categories
export const getCategories = () => API.get('/asset-categories');

// Bases
export const getBases = () => API.get('/bases');
export const createBase = (data) => API.post('/bases', data);
export const updateBase = (id, data) => API.put(`/bases/${id}`, data);

// Purchases
export const getPurchases = (baseId) => 
  API.get('/purchases', { params: baseId ? { baseId } : {} });
export const createPurchase = (data) => API.post('/purchases', data);

// Transfers
export const getTransfers = (baseId) => 
  API.get('/transfers', { params: baseId ? { baseId } : {} });
export const createTransfer = (data) => API.post('/transfers', data);
export const completeTransfer = (id) => API.put(`/transfers/${id}/complete`);
export const cancelTransfer = (id) => API.put(`/transfers/${id}/cancel`);

// Assignments
export const getAssignments = (baseId) => 
  API.get('/assignments', { params: baseId ? { baseId } : {} });
export const createAssignment = (data) => API.post('/assignments', data);

// Expenditures
export const getExpenditures = (baseId) => 
  API.get('/expenditures', { params: baseId ? { baseId } : {} });
export const createExpenditure = (data) => API.post('/expenditures', data);

// Audit Logs
export const getAuditLogs = () => API.get('/audit-logs');

export default API;
