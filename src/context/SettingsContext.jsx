import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SettingsContext = createContext();
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
});

const DEFAULT_SETTINGS = {
  messName: "Bachelor's Wallet",
  currencySymbol: '৳',
  mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 },
  billMethod: 'meal_based',
  messCategories: ['বাজার', 'গ্যাস', 'বিদ্যুৎ', 'পানি', 'অন্যান্য'],
  personalCategories: ['রুম ভাড়া', 'বাইরে খাওয়া', 'ট্রান্সপোর্ট', 'মোবাইল রিচার্জ', 'পড়াশোনা', 'শপিং', 'অন্যান্য'],
  mealReminderTime: '21:00',
  reminderEnabled: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data.data);
    } catch {}
    setLoading(false);
  };

  const updateSettings = async (data) => {
    try {
      const res = await api.put('/settings', data);
      setSettings(res.data.data);
      return true;
    } catch { return false; }
  };

  useEffect(() => { fetchSettings(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);