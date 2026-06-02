import { useState, useEffect } from 'react';
import { getIncomes, createIncome, deleteIncome, getIncomeSummary } from '../utils/api';
import { exportIncomeToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';

const SOURCES = ['বাবার কাছ থেকে', 'টিউশনি', 'চাকরি', 'ফ্রিল্যান্সিং', 'বৃত্তি', 'অন্যান্য'];
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export default function IncomePage() {
  const [incomes, setIncomes]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth]       = useState(currentMonth);
  const [form, setForm]         = useState({
    source: 'বাবার কাছ থেকে',
    amount: '',
    note: '',
    month: currentMonth,
    date: now.toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [incRes, sumRes] = await Promise.all([
        getIncomes({ month }),
        getIncomeSummary(month)
      ]);
      setIncomes(incRes.data.data);
      setSummary(sumRes.data.data);
    } catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchData(); }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return toast.error('সঠিক পরিমাণ দিন');
    try {
      await createIncome({ ...form, month });
      toast.success('আয় যোগ হয়েছে ✅');
      setForm({ ...form, amount: '', note: '' });
      setShowForm(false);
      fetchData();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('এই আয় মুছে ফেলবেন?')) return;
    try {
      await deleteIncome(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchData();
    } catch { toast.error('Error'); }
  };

  const savingsColor = summary?.savings >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">💰 Income Tracking</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">আয় ও সঞ্চয় হিসাব</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input w-auto" />
          <button onClick={() => exportIncomeToExcel(incomes, month)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition">
            📊 Excel
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + আয় যোগ
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'মোট আয়',    value: `৳${summary.totalIncome}`,  color: 'green',  icon: '📈' },
            { label: 'মোট খরচ',   value: `৳${summary.totalExpense}`, color: 'red',    icon: '📉' },
            { label: 'সঞ্চয়',     value: `৳${Math.abs(summary.savings)}`, color: summary.savings >= 0 ? 'green' : 'red', icon: '🏦' },
            { label: 'সঞ্চয় হার', value: `${summary.savingsRate}%`,  color: summary.savingsRate >= 0 ? 'blue' : 'red', icon: '📊' },
          ].map(s => (
            <div key={s.label}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className={`text-xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {summary && summary.totalIncome > 0 && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              খরচের অনুপাত
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ৳{summary.totalExpense} / ৳{summary.totalIncome}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                summary.totalExpense > summary.totalIncome
                  ? 'bg-red-500'
                  : summary.totalExpense > summary.totalIncome * 0.8
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min((summary.totalExpense / summary.totalIncome) * 100, 100)}%`
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400 dark:text-gray-600">০%</span>
            <span className={`text-xs font-medium ${savingsColor}`}>
              {summary.savings >= 0
                ? `✅ ৳${summary.savings} সঞ্চয় হয়েছে`
                : `⚠️ ৳${Math.abs(summary.savings)} বেশি খরচ হয়েছে`}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">১০০%</span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            নতুন আয় যোগ করুন
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">উৎস</label>
              <select className="input" value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">পরিমাণ (৳)</label>
              <input type="number" className="input" placeholder="0.00" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">তারিখ</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">নোট (ঐচ্ছিক)</label>
              <input className="input" placeholder="যেমন: জুনের বেতন" value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-success">✅ যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">আয়ের তালিকা</h3>
        <div className="space-y-1">
          {incomes.map(inc => (
            <div key={inc._id}
              className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold">
                  ৳
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                    {inc.source}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">
                    {new Date(inc.date).toLocaleDateString('bn-BD')}
                    {inc.note ? ` • ${inc.note}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-600 dark:text-green-400">
                  ৳{inc.amount}
                </span>
                <button onClick={() => handleDelete(inc._id)}
                  className="text-red-400 hover:text-red-600 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-950">
                  ✕
                </button>
              </div>
            </div>
          ))}
          {incomes.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <p className="text-3xl mb-2">💰</p>
              <p>এই মাসে কোনো আয় যোগ করা হয়নি</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}