import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, Phone, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]       = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'member'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) return toast.error('সব field পূরণ করুন');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.phone, form.password);
        toast.success('স্বাগতম! 🎉');
      } else {
        if (!form.name) return toast.error('নাম দিন');
        await register(form);
        toast.success('Account তৈরি হয়েছে! 🎉');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error হয়েছে');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
            <Wallet size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bachelor's Wallet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart Mess Finance Manager</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
            {[
              { key: 'login',    label: 'Login',    icon: LogIn },
              { key: 'register', label: 'Register', icon: UserPlus },
            ].map(t => (
              <button key={t.key} onClick={() => setMode(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === t.key
                    ? 'bg-white dark:bg-[#1C1F2E] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">নাম *</label>
                <input className="input" placeholder="যেমন: রাহিম" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}

            <div>
              <label className="label">ফোন নম্বর *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="01XXXXXXXXX" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9 pr-9"
                  type={showPass ? 'text' : 'password'}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'manager', label: '👑 Manager', desc: 'সব control করবে' },
                    { value: 'member',  label: '👤 Member',  desc: 'নিজের data দেখবে' },
                  ].map(r => (
                    <button key={r.value} type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        form.role === r.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-base mt-2">
              {loading
                ? 'অপেক্ষা করুন...'
                : mode === 'login' ? 'Login করুন' : 'Account তৈরি করুন'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          Bachelor's Wallet v2.0 — Smart Mess Finance
        </p>
      </div>
    </div>
  );
}