import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../utils/api';
import { Wallet, Phone, Lock, Eye, EyeOff, UserPlus, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
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
  const [mode, setMode]         = useState('login'); // login | register | forgot
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1); // forgot: 1=phone, 2=answer, 3=newpass
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'member',
    securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: ''
  });
  const [resetForm, setResetForm] = useState({
    phone: '', answer: '', newPassword: '', confirmPassword: ''
  });
  const [foundQuestion, setFoundQuestion] = useState('');

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

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    if (!resetForm.phone) return toast.error('Phone নম্বর দিন');
    setLoading(true);
    try {
      // Phone দিয়ে security question খোঁজো
      const res = await resetPassword({ phone: resetForm.phone, answer: 'CHECK_ONLY', newPassword: 'CHECK_ONLY' })
        .catch(err => err.response);
      // যদি security question না থাকে
      if (res?.data?.message?.includes('Security question')) {
        toast.error(res.data.message);
      } else {
        setStep(2);
        toast.success('Phone নম্বর পাওয়া গেছে!');
      }
    } catch {}
    // সব ক্ষেত্রেই step 2 এ যাও (security question show করো)
    setStep(2);
    setLoading(false);
  };

  const handleForgotStep2 = (e) => {
    e.preventDefault();
    if (!resetForm.answer) return toast.error('উত্তর দিন');
    setStep(3);
  };

  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    if (!resetForm.newPassword) return toast.error('নতুন password দিন');
    if (resetForm.newPassword.length < 6) return toast.error('Password কমপক্ষে ৬ অক্ষর');
    if (resetForm.newPassword !== resetForm.confirmPassword) return toast.error('Password মিলছে না');
    setLoading(true);
    try {
      const res = await resetPassword({
        phone:       resetForm.phone,
        answer:      resetForm.answer,
        newPassword: resetForm.newPassword
      });
      toast.success('Password reset হয়েছে! ✅');
      // Auto login
      const { token: t, data } = res.data;
      localStorage.setItem('bw-token', t);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'উত্তর সঠিক নয়');
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

        <div className="card">

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setMode('login'); setStep(1); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Password Reset</h3>
                  <p className="text-xs text-gray-500">Step {step} of 3</p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-2 mb-5">
                {[1,2,3].map(s => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${
                    s <= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                ))}
              </div>

              {/* Step 1 — Phone */}
              {step === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      আপনার registered phone নম্বর দিন। তারপর security question দিয়ে password reset করতে পারবেন।
                    </p>
                  </div>
                  <div>
                    <label className="label">Phone নম্বর</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-9" placeholder="01XXXXXXXXX"
                        value={resetForm.phone}
                        onChange={e => setResetForm({ ...resetForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-2.5">
                    {loading ? 'খোঁজা হচ্ছে...' : 'পরবর্তী →'}
                  </button>
                </form>
              )}

              {/* Step 2 — Security Question */}
              {step === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  <div>
                    <label className="label">Security Question বেছে নিন</label>
                    <select className="input" value={resetForm.question}
                      onChange={e => setResetForm({ ...resetForm, question: e.target.value })}>
                      {SECURITY_QUESTIONS.map(q => <option key={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">উত্তর</label>
                    <input className="input" placeholder="আপনার উত্তর লিখুন"
                      value={resetForm.answer}
                      onChange={e => setResetForm({ ...resetForm, answer: e.target.value })} />
                  </div>
                  <button type="submit" className="w-full btn-primary justify-center py-2.5">
                    পরবর্তী →
                  </button>
                </form>
              )}

              {/* Step 3 — New Password */}
              {step === 3 && (
                <form onSubmit={handleForgotStep3} className="space-y-4">
                  <div>
                    <label className="label">নতুন Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-9 pr-9"
                        type={showPass ? 'text' : 'password'}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={resetForm.newPassword}
                        onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Password নিশ্চিত করুন</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="input pl-9"
                        type="password"
                        placeholder="আবার লিখুন"
                        value={resetForm.confirmPassword}
                        onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })} />
                    </div>
                    {resetForm.confirmPassword && resetForm.newPassword !== resetForm.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Password মিলছে না</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-success justify-center py-2.5">
                    {loading ? 'Reset হচ্ছে...' : '✅ Password Reset করুন'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── LOGIN / REGISTER ── */
            <div>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-5">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <>
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

                    {/* Security Question */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
                        🔐 Security Question (password ভুললে কাজে আসবে)
                      </p>
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

                <button type="submit" disabled={loading}
                  className="w-full btn-primary justify-center py-2.5 text-base">
                  {loading ? 'অপেক্ষা করুন...' : mode === 'login' ? 'Login করুন' : 'Account তৈরি করুন'}
                </button>

                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')}
                    className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
                    <KeyRound size={14} /> Password ভুলে গেছেন?
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          Bachelor's Wallet v2.0 — Smart Mess Finance
        </p>
      </div>
    </div>
  );
}