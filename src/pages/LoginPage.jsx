import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../utils/api';
import {
  Wallet, Phone, Lock, Eye, EyeOff,
  UserPlus, LogIn, KeyRound, ArrowLeft,
  ChevronRight, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECURITY_QUESTIONS = [
  'আপনার মায়ের নাম কী?',
  'আপনার প্রথম স্কুলের নাম কী?',
  'আপনার জন্মশহরের নাম কী?',
  'আপনার প্রিয় খাবারের নাম কী?',
  'আপনার সেরা বন্ধুর নাম কী?',
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'member',
    securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: ''
  });
  const [resetForm, setResetForm] = useState({
    phone: '', answer: '', newPassword: '', confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) return toast.error('সব field পূরণ করুন');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.phone, form.password);
        toast.success('স্বাগতম! 🎉');
        navigate('/');
      } else {
        if (!form.name) return toast.error('নাম দিন');
        await register(form);
        toast.success('Account তৈরি হয়েছে! 🎉');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error হয়েছে');
    }
    setLoading(false);
  };

  const handleForgotStep1 = (e) => {
    e.preventDefault();
    if (!resetForm.phone) return toast.error('Phone নম্বর দিন');
    setStep(2);
  };

  const handleForgotStep2 = (e) => {
    e.preventDefault();
    if (!resetForm.answer) return toast.error('উত্তর দিন');
    setStep(3);
  };

  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    if (!resetForm.newPassword) return toast.error('নতুন password দিন');
    if (resetForm.newPassword.length < 6) return toast.error('কমপক্ষে ৬ অক্ষর');
    if (resetForm.newPassword !== resetForm.confirmPassword) return toast.error('Password মিলছে না');
    setLoading(true);
    try {
      await resetPassword({
        phone:       resetForm.phone,
        answer:      resetForm.answer,
        newPassword: resetForm.newPassword,
      });
      toast.success('Password reset হয়েছে! ✅');
      setMode('login');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'উত্তর সঠিক নয়');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0B0F] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-violet-100/60 dark:bg-violet-900/20 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative">

        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="relative inline-flex mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-300/40 dark:shadow-indigo-900/60">
              <Wallet size={36} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bachelor's Wallet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Smart Mess Finance Manager
          </p>
        </div>

        {/* Card */}
        <div className="card-glass animate-scale-in">

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setMode('login'); setStep(1); }}
                  className="btn-icon w-8 h-8 rounded-lg">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Password Reset</h3>
                  <p className="text-xs text-gray-500">Step {step} of 3</p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {[1,2,3].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'
                  }`} />
                ))}
              </div>

              {step === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                      আপনার registered phone নম্বর দিন। Security question দিয়ে password reset করতে পারবেন।
                    </p>
                  </div>
                  <div>
                    <label className="label">Phone নম্বর</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-10" placeholder="01XXXXXXXXX"
                        value={resetForm.phone}
                        onChange={e => setResetForm({ ...resetForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    পরবর্তী <ChevronRight size={16} />
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  <div>
                    <label className="label">Security Question</label>
                    <select className="input" value={resetForm.question}
                      onChange={e => setResetForm({ ...resetForm, question: e.target.value })}>
                      {SECURITY_QUESTIONS.map(q => <option key={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">উত্তর</label>
                    <input className="input" placeholder="আপনার উত্তর"
                      value={resetForm.answer}
                      onChange={e => setResetForm({ ...resetForm, answer: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    পরবর্তী <ChevronRight size={16} />
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleForgotStep3} className="space-y-4">
                  <div>
                    <label className="label">নতুন Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-10 pr-10"
                        type={showPass ? 'text' : 'password'}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={resetForm.newPassword}
                        onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-10" type="password"
                        placeholder="আবার লিখুন"
                        value={resetForm.confirmPassword}
                        onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })} />
                    </div>
                    {resetForm.confirmPassword && resetForm.newPassword !== resetForm.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <span>⚠</span> Password মিলছে না
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-success w-full">
                    {loading ? 'Reset হচ্ছে...' : '✅ Password Reset করুন'}
                  </button>
                </form>
              )}
            </div>

          ) : (
            /* ── LOGIN / REGISTER ── */
            <div>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/[0.04] rounded-2xl mb-6">
                {[
                  { key: 'login',    label: 'Login',    icon: LogIn },
                  { key: 'register', label: 'Register', icon: UserPlus },
                ].map(t => (
                  <button key={t.key} onClick={() => setMode(t.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      mode === t.key
                        ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'
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
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-10" placeholder="01XXXXXXXXX" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-10 pr-10"
                      type={showPass ? 'text' : 'password'}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <>
                    {/* Role selection */}
                    <div>
                      <label className="label">Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'manager', emoji: '👑', label: 'Manager', desc: 'সব কিছু control করে' },
                          { value: 'member',  emoji: '👤', label: 'Member',  desc: 'নিজের data দেখে' },
                        ].map(r => (
                          <button key={r.value} type="button"
                            onClick={() => setForm({ ...form, role: r.value })}
                            className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-150 ${
                              form.role === r.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20'
                            }`}>
                            <div className="text-xl mb-1">{r.emoji}</div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Security Question */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} className="text-amber-600 dark:text-amber-400" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          Security Question — password ভুললে কাজে আসবে
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="label">Question</label>
                          <select className="input" value={form.securityQuestion}
                            onChange={e => setForm({ ...form, securityQuestion: e.target.value })}>
                            {SECURITY_QUESTIONS.map(q => <option key={q}>{q}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">উত্তর</label>
                          <input className="input" placeholder="আপনার উত্তর"
                            value={form.securityAnswer}
                            onChange={e => setForm({ ...form, securityAnswer: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      অপেক্ষা করুন...
                    </span>
                  ) : mode === 'login' ? (
                    <span className="flex items-center gap-2">
                      <LogIn size={17} /> Login করুন
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus size={17} /> Account তৈরি করুন
                    </span>
                  )}
                </button>

                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot'); setStep(1); }}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    <KeyRound size={13} /> Password ভুলে গেছেন?
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          Bachelor's Wallet v2.0 · Made with ❤️ for Bangladeshi Bachelors
        </p>
      </div>
    </div>
  );
}