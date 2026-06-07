import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Token auto-attach
api.interceptors.request.use(config => {
  const token = localStorage.getItem('bw-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Members
export const getMembers       = ()         => api.get('/members');
export const createMember     = (data)     => api.post('/members', data);
export const updateMember     = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember     = (id)       => api.delete(`/members/${id}`);

// Meals
export const getMealsByDate   = (date)     => api.get(`/meals/date/${date}`);
export const upsertMeal       = (data)     => api.post('/meals/entry', data);
export const getMonthlySummary= (y, m)     => api.get(`/meals/summary/${y}/${m}`);

// Expenses
export const getExpenses      = (params)   => api.get('/expenses', { params });
export const createExpense    = (data)     => api.post('/expenses', data);
export const deleteExpense    = (id)       => api.delete(`/expenses/${id}`);
export const getMessExpenses  = (y, m)     => api.get(`/expenses/mess/${y}/${m}`);

// Bills
export const generateBill     = (y, m)     => api.post(`/bills/generate/${y}/${m}`);
export const getBillsByMonth  = (y, m)     => api.get(`/bills/${y}/${m}`);
export const markAsPaid       = (id)       => api.patch(`/bills/pay/${id}`);

// Income
export const getIncomes       = (params)   => api.get('/income', { params });
export const createIncome     = (data)     => api.post('/income', data);
export const deleteIncome     = (id)       => api.delete(`/income/${id}`);
export const getIncomeSummary = (month)    => api.get(`/income/summary/${month}`);

// Settlement
export const getSettlement    = (y, m)     => api.get(`/settlement/${y}/${m}`);

// Budget
export const getBudget        = (month)    => api.get(`/budget/${month}`);
export const setBudget        = (month, d) => api.post(`/budget/${month}`, d);
export const getBudgetStatus  = (month)    => api.get(`/budget/status/${month}`);

// Notices
export const getNotices       = ()         => api.get('/notices');
export const createNotice     = (data)     => api.post('/notices', data);
export const togglePin        = (id)       => api.patch(`/notices/${id}/pin`);
export const deleteNotice     = (id)       => api.delete(`/notices/${id}`);

// Rooms
export const getRooms         = ()         => api.get('/rooms');
export const getRoomStats     = ()         => api.get('/rooms/stats');
export const createRoom       = (data)     => api.post('/rooms', data);
export const updateRoom       = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom       = (id)       => api.delete(`/rooms/${id}`);
export const assignMember     = (id, data) => api.post(`/rooms/${id}/assign`, data);
export const removeMember     = (id, data) => api.post(`/rooms/${id}/remove-member`, data);

// Mess
export const getMesses        = ()         => api.get('/mess');
export const createMess       = (data)     => api.post('/mess', data);
export const updateMess       = (id, data) => api.put(`/mess/${id}`, data);
export const deleteMess       = (id)       => api.delete(`/mess/${id}`);

// Prediction
export const getPrediction    = ()         => api.get('/prediction');

// Settings
export const getSettings      = ()         => api.get('/settings');
export const updateSettings   = (data)     => api.put('/settings', data);

// Chat
export const getMessages      = (params)   => api.get('/chat', { params });
export const sendMessage      = (data)     => api.post('/chat', data);
export const deleteMessage    = (id)       => api.delete(`/chat/${id}`);

// Auth extras
export const setSecurityQuestion = (data) => api.post('/auth/security-question', data);
export const resetPassword       = (data) => api.post('/auth/reset-password', data);
export const adminResetPassword  = (data) => api.post('/auth/admin-reset', data);
export const getUsers            = ()     => api.get('/auth/users');

export default api;