import { useState, useEffect } from 'react';
import { getExpenses, createExpense, deleteExpense } from '../utils/api';
import toast from 'react-hot-toast';

const MESS_CATEGORIES    = ['বাজার', 'গ্যাস', 'বিদ্যুৎ', 'পানি', 'অন্যান্য'];
const PERSONAL_CATEGORIES = ['রুম ভাড়া', 'বাইরে খাওয়া', 'ট্রান্সপোর্ট', 'মোবাইল রিচার্জ', 'পড়াশোনা', 'শপিং', 'অন্যান্য'];

const now = new Date();

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('mess');
  const [form, setForm] = useState({ type: 'mess', category: 'বাজার', amount: '', note: '', date: now.toISOString().split('T')[0] });

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
      toast.success('খরচ যোগ হয়েছে ✅');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">💰 Expenses</h2>
          <p className="text-sm text-gray-500">এই মাসের মোট: <strong className="text-red-600">৳{total.toFixed(2)}</strong></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ খরচ যোগ</button>
      </div>

      {/* Tab */}
      <div className="flex gap-2 mb-4">
        {['mess', 'personal'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {t === 'mess' ? '🏠 Mess খরচ' : '👤 Personal খরচ'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 mb-3">নতুন {tab === 'mess' ? 'Mess' : 'Personal'} খরচ</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">ক্যাটাগরি</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
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
              <button type="submit" className="btn-success">✅ যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-600">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="space-y-2">
          {expenses.map(e => (
            <div key={e._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold">
                  ৳
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{e.category}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.date).toLocaleDateString('bn-BD')} {e.note ? `• ${e.note}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">৳{e.amount}</span>
                <button onClick={() => handleDelete(e._id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-400">এই মাসে কোনো খরচ নেই</div>
          )}
        </div>
      </div>
    </div>
  );
}
