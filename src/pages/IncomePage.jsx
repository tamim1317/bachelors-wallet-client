import { useState, useEffect } from 'react';
import { getIncomes, createIncome, deleteIncome, getIncomeSummary } from '../utils/api';
import { exportIncomeToExcel } from '../utils/exportExcel';
import { TrendingUp, TrendingDown, PiggyBank, BarChart3, Plus, Trash2, X, FileSpreadsheet } from 'lucide-react';
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
    source: 'বাবার কাছ থেকে', amount: '', note: '',
    month: currentMonth, date: now.toISOString().split('T')[0]
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
      toast.success('আয় যোগ হয়েছে');
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

  const savingsPct = summary?.totalIncome > 0
    ? Math.min((summary.totalExpense / summary.totalIncome) * 100, 100)
    : 0;

  const barColor = savingsPct >= 100 ? 'bg-red-500' : savingsPct >= 80 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Income Tracking</h1>
          <p className="page-sub flex items-center gap-1.5">
            <TrendingUp size={14} /> আয় ও সঞ্চয় হিসাব
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input w-auto" />
          <button onClick={() => exportIncomeToExcel(incomes, month)} className="btn-outline">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> আয় যোগ
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'মোট আয়',    value: `৳${summary.totalIncome}`,  icon: TrendingUp,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'মোট খরচ',   value: `৳${summary.totalExpense}`, icon: TrendingDown, color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'সঞ্চয়',     value: `৳${Math.abs(summary.savings)}`, icon: PiggyBank, color: summary.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400', bg: summary.savings >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20' },
            { label: 'সঞ্চয় হার', value: `${summary.savingsRate}%`,  icon: BarChart3,    color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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
      )}

      {/* Progress Bar */}
      {summary && summary.totalIncome > 0 && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">খরচের অনুপাত</span>
            <span className={`text-sm font-semibold ${summary.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary.savings >= 0 ? `৳${summary.savings} সঞ্চয়` : `৳${Math.abs(summary.savings)} ঘাটতি`}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${savingsPct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">৳{summary.totalExpense} খরচ</span>
            <span className="text-xs text-gray-400">৳{summary.totalIncome} আয়</span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">নতুন আয় যোগ করুন</h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <button type="submit" className="btn-success">যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="card">
        {incomes.length > 0 && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {incomes.length}টি income entry
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              মোট ৳{incomes.reduce((s, i) => s + i.amount, 0).toLocaleString()}
            </span>
          </div>
        )}
        <div className="space-y-1">
          {incomes.map(inc => (
            <div key={inc._id}
              className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800/40 last:border-0 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{inc.source}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  {new Date(inc.date).toLocaleDateString('bn-BD')}
                  {inc.note ? ` · ${inc.note}` : ''}
                </p>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                +৳{inc.amount.toLocaleString()}
              </span>
              <button onClick={() => handleDelete(inc._id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {incomes.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">এই মাসে কোনো আয় নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}