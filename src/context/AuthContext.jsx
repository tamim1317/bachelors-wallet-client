import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('bw-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token: t, data } = res.data;
    localStorage.setItem('bw-token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: t, data } = res.data;
    localStorage.setItem('bw-token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bw-token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isManager = user?.role === 'manager';
  const isMember  = user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isManager, isMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);