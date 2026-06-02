import { useState, useEffect } from 'react';
import { getBudget, setBudget, getBudgetStatus } from '../utils/api';
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
      const data = {
        totalBudget: +form.totalBudget,
        categories: form.categories.filter(c => c.limit > 0).map(c => ({
          name: c.name,
          limit: +c.limit
        }))
      };
      await setBudget(month, data);
      toast.success('Budget সেট হয়েছে ✅');
      setShowForm(false);
      fetchStatus();
    } catch { toast.error('Error'); }
  };

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80)  return 'bg-orange-500';
    if (pct >= 50)  return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBg = (type) => {
    if (type === 'danger')  return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
    if (type === 'warning') return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400';
    return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🎯 Budget Alerts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">মাসিক budget সেট ও track করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input w-auto" />
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            🎯 Budget সেট করুন
          </button>
        </div>
      </div>

      {/* Alerts */}
      {status?.alerts?.length > 0 && (
        <div className="space-y-2 mb-5">
          {status.alerts.map((alert, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${getStatusBg(alert.type)}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Budget Form */}
      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Budget সেট করুন — {month}
          </h3>
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
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">
                      {cat.name}
                    </span>
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
              <button type="submit" className="btn-success">✅ Save করুন</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Status */}
      {status?.budget ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'মোট Budget',  value: `৳${status.budget.totalBudget}`, color: 'blue' },
              { label: 'খরচ হয়েছে',  value: `৳${status.totalSpent}`,         color: 'red' },
              { label: 'বাকি আছে',   value: `৳${Math.max(status.remaining, 0)}`, color: status.remaining > 0 ? 'green' : 'red' },
              { label: 'ব্যবহার',    value: `${status.percentage}%`,          color: status.percentage >= 80 ? 'red' : 'blue' },
            ].map(s => (
              <div key={s.label}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                <p className={`text-xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Main Progress */}
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">মোট Budget ব্যবহার</h3>
              <span className={`text-sm font-bold ${
                status.percentage >= 100 ? 'text-red-600 dark:text-red-400' :
                status.percentage >= 80  ? 'text-orange-600 dark:text-orange-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {status.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
              <div
                className={`h-5 rounded-full transition-all duration-700 ${getBarColor(status.percentage)}`}
                style={{ width: `${Math.min(status.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>৳{status.totalSpent} খরচ</span>
              <span>৳{status.budget.totalBudget} budget</span>
            </div>
          </div>

          {/* Category Progress */}
          {status.budget.categories?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Category-wise Budget
              </h3>
              <div className="space-y-4">
                {status.budget.categories.map(cat => {
                  const spent = 0; // TODO: category wise spending
                  const pct   = cat.limit > 0 ? Math.min((spent / cat.limit) * 100, 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ৳{spent} / ৳{cat.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getBarColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600 card">
          <p className="text-4xl mb-3">🎯</p>
          <p>এই মাসের জন্য কোনো budget সেট করা হয়নি</p>
          <p className="text-xs mt-2">উপরে "Budget সেট করুন" বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}