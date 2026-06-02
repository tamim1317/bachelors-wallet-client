import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const MessContext = createContext();
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api' });

export function MessProvider({ children }) {
  const [messes, setMesses]       = useState([]);
  const [activeMess, setActiveMess] = useState(() => {
    const saved = localStorage.getItem('bw-active-mess');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchMesses = async () => {
    try {
      const res = await api.get('/mess');
      setMesses(res.data.data);
      if (!activeMess && res.data.data.length > 0) {
        selectMess(res.data.data[0]);
      }
    } catch {}
  };

  const selectMess = (mess) => {
    setActiveMess(mess);
    localStorage.setItem('bw-active-mess', JSON.stringify(mess));
  };

  useEffect(() => { fetchMesses(); }, []);

  return (
    <MessContext.Provider value={{ messes, activeMess, selectMess, fetchMesses }}>
      {children}
    </MessContext.Provider>
  );
}

export const useMess = () => useContext(MessContext);