import { useState, useEffect } from 'react';
import { getBudget, setBudget, getBudgetStatus } from '../utils/api';
import { Target, AlertTriangle, CheckCircle, TrendingUp, ChevronDown, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const CATEGORIES = ['বাজার', 'গ্যাস', 'বিদ্যুৎ', 'রুম ভাড়া', 'বাইরে খাওয়া', 'ট্রান্সপোর্ট', 'মোবাইল রিচার্জ', 'শপিং'];

export default function BudgetPage() {
  const [month, setMonth]   = useState(currentMonth);
  const [status, setStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    totalBudget: '',
    categories: CATEGORIES.map(name => ({ name, limit: '' }))
  });

  const fetchStatus = async () => {
    try {
      const res = await getBudgetStatus(month);
      setStatus(res.data.data);
      if (res.data.data.budget) {
        setForm({
          totalBudget: res.data.data.budget.totalBudget,
          categories: res.data.data.budget.categories?.length
            ? res.data.data.budget.categories
            : CATEGORIES.map(name => ({ name, limit: '' }))
        });
      }
    } catch {}
  };

  useEffect(() => { fetchStatus(); }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.totalBudget || form.totalBudget <= 0) return toast.error('মোট budget দিন');
    try {
      await setBudget(month, {
        totalBudget: +form.totalBudget,
        categories: form.categories.filter(c => c.limit > 0).map(c => ({ name: c.name, limit: +c.limit }))
      });
      toast.success('Budget সেট হয়েছে!');
      setShowForm(false);
      fetchStatus();
    } catch { toast.error('Error'); }
  };

  const getBarColor = (pct) => pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500';

  const getAlertStyle = (type) => {
    if (type === 'danger')  return 'alert-danger';
    if (type === 'warning') return 'alert-warning';
    return 'alert-success';
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Budget Alerts</h1>
          <p className="page-sub flex items-center gap-1.5">
            <Target size={14} /> মাসিক budget সেট ও track করুন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input w-auto" />
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Target size={16} /> Budget সেট
          </button>
        </div>
      </div>

      {/* Alerts */}
      {status?.alerts?.length > 0 && (
        <div className="space-y-2 mb-5">
          {status.alerts.map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 ${getAlertStyle(alert.type)}`}>
              {alert.type === 'danger' ? <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Budget Form */}
      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Budget সেট করুন — {month}</h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">মোট মাসিক Budget (৳) *</label>
              <input type="number" className="input" placeholder="যেমন: 15000"
                value={form.totalBudget}
                onChange={e => setForm({ ...form, totalBudget: e.target.value })} />
            </div>
            <div>
              <label className="label">Category-wise Limit (ঐচ্ছিক)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {form.categories.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-36 flex-shrink-0">{cat.name}</span>
                    <input type="number" className="input" placeholder="৳ limit"
                      value={cat.limit}
                      onChange={e => {
                        const updated = [...form.categories];
                        updated[i] = { ...updated[i], limit: e.target.value };
                        setForm({ ...form, categories: updated });
                      }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-success">Save করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {status?.budget ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'মোট Budget',  value: `৳${status.budget.totalBudget}`, color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: Target },
              { label: 'খরচ হয়েছে',  value: `৳${status.totalSpent}`,         color: 'text-red-600 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-900/20',        icon: TrendingUp },
              { label: 'বাকি আছে',   value: `৳${Math.max(status.remaining, 0)}`, color: status.remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400', bg: status.remaining > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20', icon: CheckCircle },
              { label: 'ব্যবহার',    value: `${status.percentage}%`,          color: status.percentage >= 80 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400', bg: status.percentage >= 80 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20', icon: Target },
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Progress */}
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">মোট Budget ব্যবহার</h3>
              <span className={`text-sm font-bold ${status.percentage >= 100 ? 'text-red-600' : status.percentage >= 80 ? 'text-orange-600' : 'text-emerald-600'} dark:${status.percentage >= 100 ? 'text-red-400' : status.percentage >= 80 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {status.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <div className={`h-4 rounded-full transition-all duration-700 ${getBarColor(status.percentage)}`}
                style={{ width: `${Math.min(status.percentage, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>৳{status.totalSpent} খরচ</span>
              <span>৳{status.budget.totalBudget} budget</span>
            </div>
          </div>

          {/* Category Progress */}
          {status.budget.categories?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Category-wise Budget</h3>
              <div className="space-y-4">
                {status.budget.categories.map(cat => {
                  const pct = 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                        <span className="text-xs text-gray-400">৳0 / ৳{cat.limit}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getBarColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">Budget সেট করা হয়নি</p>
          <p className="text-sm text-gray-400 mt-1">উপরে "Budget সেট" বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}