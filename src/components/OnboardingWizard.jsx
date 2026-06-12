import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createMember, createExpense, updateSettings } from '../utils/api';
import {
  Wallet, Users, ShoppingCart, CheckCircle,
  ArrowRight, ArrowLeft, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'স্বাগতম!',        icon: Wallet,       desc: 'Bachelor\'s Wallet এ আপনাকে স্বাগত জানাই' },
  { id: 2, title: 'Mess Setup',      icon: Wallet,       desc: 'আপনার মেসের নাম দিন' },
  { id: 3, title: 'Members যোগ করুন', icon: Users,        desc: 'মেসের সদস্যদের যোগ করুন' },
  { id: 4, title: 'প্রথম খরচ',       icon: ShoppingCart, desc: 'আজকের বাজার খরচ যোগ করুন' },
  { id: 5, title: 'সব হয়ে গেছে!',   icon: CheckCircle,  desc: 'আপনার মেস ready!' },
];

export default function OnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [messName, setMessName] = useState("Bachelor's Mess");
  const [members, setMembers] = useState([{ name: '', phone: '', room: '' }]);
  const [expense, setExpense] = useState({ amount: '', note: '', category: 'বাজার' });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const addMemberRow = () => {
    setMembers(prev => [...prev, { name: '', phone: '', room: '' }]);
  };

  const removeMemberRow = (i) => {
    setMembers(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateMember = (i, field, value) => {
    setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const handleNext = async () => {
    if (step === 2) {
      // Mess name save করো
      if (!messName.trim()) return toast.error('Mess এর নাম দিন');
      try {
        await updateSettings({ messName });
      } catch {}
      setStep(3);
      return;
    }

    if (step === 3) {
      // Members save করো
      const validMembers = members.filter(m => m.name.trim());
      if (validMembers.length === 0) return toast.error('কমপক্ষে একজন member যোগ করুন');
      setLoading(true);
      try {
        await Promise.all(validMembers.map(m => createMember(m)));
        toast.success(`${validMembers.length}জন member যোগ হয়েছে!`);
        setStep(4);
      } catch { toast.error('Error হয়েছে'); }
      setLoading(false);
      return;
    }

    if (step === 4) {
      // Expense save করো (optional)
      if (expense.amount && +expense.amount > 0) {
        try {
          await createExpense({
            type: 'mess',
            category: expense.category,
            amount: +expense.amount,
            note: expense.note,
            date: new Date()
          });
          toast.success('খরচ যোগ হয়েছে!');
        } catch {}
      }
      setStep(5);
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleSkip = () => {
    if (step < STEPS.length) setStep(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#0F1117] z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Step {step} of {STEPS.length}
            </span>
            {step < STEPS.length && (
              <button onClick={handleSkip}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                Skip →
              </button>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="card">

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                <Wallet size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                স্বাগতম, {user?.name}! 🎉
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Bachelor's Wallet এ আপনাকে স্বাগত জানাই।
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600 mb-8">
                মাত্র কয়েকটি ধাপে আপনার মেস setup করুন।
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: '🍛', label: 'Meal Tracking' },
                  { icon: '💰', label: 'Bill Calculate' },
                  { icon: '📊', label: 'Analytics' },
                ].map(f => (
                  <div key={f.label}
                    className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-center">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Mess Name */}
          {step === 2 && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-5">
                <Wallet size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                আপনার Mess Setup করুন
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                মেসের একটা নাম দিন যেটা সবাই চিনবে
              </p>
              <div>
                <label className="label">Mess এর নাম</label>
                <input className="input" placeholder="যেমন: মিরপুর ব্যাচেলর মেস"
                  value={messName}
                  onChange={e => setMessName(e.target.value)} />
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 এই নাম পরে Settings থেকে যেকোনো সময় পরিবর্তন করা যাবে
                </p>
              </div>
            </div>
          )}

          {/* Step 3 — Members */}
          {step === 3 && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5">
                <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Members যোগ করুন
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                মেসের সদস্যদের নাম দিন
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {members.map((m, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input className="input" placeholder="নাম *"
                        value={m.name}
                        onChange={e => updateMember(i, 'name', e.target.value)} />
                      <input className="input" placeholder="ঘর নম্বর"
                        value={m.room}
                        onChange={e => updateMember(i, 'room', e.target.value)} />
                    </div>
                    {members.length > 1 && (
                      <button onClick={() => removeMemberRow(i)}
                        className="w-10 h-10 mt-1 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addMemberRow}
                className="btn-outline w-full mt-3 justify-center">
                <Plus size={15} /> আরো member যোগ করুন
              </button>
            </div>
          )}

          {/* Step 4 — First Expense */}
          {step === 4 && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-5">
                <ShoppingCart size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                প্রথম খরচ যোগ করুন
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                আজকের বাজার খরচ দিন (ঐচ্ছিক)
              </p>
              <div className="space-y-3">
                <div>
                  <label className="label">পরিমাণ (৳)</label>
                  <input type="number" className="input" placeholder="যেমন: 1500"
                    value={expense.amount}
                    onChange={e => setExpense({ ...expense, amount: e.target.value })} />
                </div>
                <div>
                  <label className="label">নোট</label>
                  <input className="input" placeholder="যেমন: সবজি, মাছ, তেল"
                    value={expense.note}
                    onChange={e => setExpense({ ...expense, note: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  💡 এই step টা skip করতে পারেন — পরে Expenses পেজ থেকে যোগ করা যাবে
                </p>
              </div>
            </div>
          )}

          {/* Step 5 — Done */}
          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                সব হয়ে গেছে! 🎉
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                আপনার মেস এখন ready। Dashboard থেকে সব manage করুন।
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {[
                  { icon: '🍛', title: 'Daily Meals', desc: 'প্রতিদিন meal entry দিন' },
                  { icon: '💰', title: 'Expenses', desc: 'বাজার খরচ track করুন' },
                  { icon: '🧾', title: 'Monthly Bill', desc: 'মাস শেষে bill generate করুন' },
                  { icon: '💬', title: 'Chat', desc: 'সদস্যদের সাথে যোগাযোগ করুন' },
                ].map(f => (
                  <div key={f.title}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            {step > 1 && step < 5 && (
              <button onClick={() => setStep(prev => prev - 1)} className="btn-outline">
                <ArrowLeft size={15} /> পিছে
              </button>
            )}
            {step < 5 ? (
              <button onClick={handleNext} disabled={loading}
                className="btn-primary flex-1 justify-center">
                {loading ? 'সেভ হচ্ছে...' : (
                  <>
                    {step === 4 ? 'শেষ করুন' : 'পরবর্তী'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            ) : (
              <button onClick={onComplete}
                className="btn-primary flex-1 justify-center py-3 text-base">
                Dashboard এ যাই 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}