import { useState, useEffect } from 'react';
import { getExpenses, createExpense, deleteExpense } from '../utils/api';
import { Plus, Trash2, Wallet, ShoppingCart, X, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const MESS_CATEGORIES     = ['বাজার', 'গ্যাস', 'বিদ্যুৎ', 'পানি', 'অন্যান্য'];
const PERSONAL_CATEGORIES = ['রুম ভাড়া', 'বাইরে খাওয়া', 'ট্রান্সপোর্ট', 'মোবাইল রিচার্জ', 'পড়াশোনা', 'শপিং', 'অন্যান্য'];
const now = new Date();

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal]       = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab]           = useState('mess');
  const [form, setForm]         = useState({
    type: 'mess', category: 'বাজার', amount: '', note: '',
    date: now.toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses({ type: tab, month: now.getMonth() + 1, year: now.getFullYear() });
      setExpenses(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchExpenses(); }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return toast.error('সঠিক পরিমাণ দিন');
    try {
      await createExpense({ ...form, type: tab });
      toast.success('খরচ যোগ হয়েছে');
      setForm({ ...form, amount: '', note: '' });
      setShowForm(false);
      fetchExpenses();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('এই খরচ মুছে ফেলবেন?')) return;
    try {
      await deleteExpense(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchExpenses();
    } catch { toast.error('Error'); }
  };

  const categories = tab === 'mess' ? MESS_CATEGORIES : PERSONAL_CATEGORIES;

  const CAT_COLORS = ['bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400','bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400','bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400','bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400','bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'];
  const getCatColor = (cat) => CAT_COLORS[Math.abs(cat.charCodeAt(0)) % CAT_COLORS.length];

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub flex items-center gap-1.5">
            <TrendingDown size={14} />
            এই মাসের মোট:
            <strong className="text-red-600 dark:text-red-400">৳{total.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} />
          খরচ যোগ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl w-fit">
        {[
          { key: 'mess',     label: 'Mess খরচ',     icon: ShoppingCart },
          { key: 'personal', label: 'Personal খরচ', icon: Wallet },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-white dark:bg-[#1C1F2E] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              নতুন {tab === 'mess' ? 'Mess' : 'Personal'} খরচ
            </h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ক্যাটাগরি</label>
              <select className="input" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c}>{c}</option>)}
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
              <input className="input" placeholder="যেমন: মাছ, সবজি" value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-success">যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense List */}
      <div className="card">
        {expenses.length > 0 && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {expenses.length}টি transaction
            </span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              মোট ৳{total.toFixed(2)}
            </span>
          </div>
        )}

        <div className="space-y-1">
          {expenses.map(e => (
            <div key={e._id}
              className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800/40 last:border-0 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${getCatColor(e.category)}`}>
                {e.category.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{e.category}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  {new Date(e.date).toLocaleDateString('bn-BD')}
                  {e.note ? ` · ${e.note}` : ''}
                </p>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                ৳{e.amount.toLocaleString()}
              </span>
              <button onClick={() => handleDelete(e._id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {expenses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Wallet size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">এই মাসে কোনো খরচ নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}