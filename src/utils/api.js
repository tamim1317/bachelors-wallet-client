import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Members
export const getMembers       = ()        => api.get('/members');
export const createMember     = (data)    => api.post('/members', data);
export const updateMember     = (id, data)=> api.put(`/members/${id}`, data);
export const deleteMember     = (id)      => api.delete(`/members/${id}`);

// Meals
export const getMealsByDate   = (date)    => api.get(`/meals/date/${date}`);
export const upsertMeal       = (data)    => api.post('/meals/entry', data);
export const getMonthlySummary= (y, m)    => api.get(`/meals/summary/${y}/${m}`);

// Expenses
export const getExpenses      = (params)  => api.get('/expenses', { params });
export const createExpense    = (data)    => api.post('/expenses', data);
export const deleteExpense    = (id)      => api.delete(`/expenses/${id}`);
export const getMessExpenses  = (y, m)    => api.get(`/expenses/mess/${y}/${m}`);

// Bills
export const generateBill     = (y, m)    => api.post(`/bills/generate/${y}/${m}`);
export const getBillsByMonth  = (y, m)    => api.get(`/bills/${y}/${m}`);
export const markAsPaid       = (id)      => api.patch(`/bills/pay/${id}`);

// Income
export const getIncomes         = (params) => api.get('/income', { params });
export const createIncome       = (data)   => api.post('/income', data);
export const deleteIncome       = (id)     => api.delete(`/income/${id}`);
export const getIncomeSummary   = (month)  => api.get(`/income/summary/${month}`);

export default api;
