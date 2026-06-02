import { useState } from 'react';
import { useMess } from '../context/MessContext';
import { createMess, deleteMess } from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#1d4ed8','#15803d','#dc2626','#d97706','#7c3aed','#db2777'];

export default function MessPage() {
  const { messes, activeMess, selectMess, fetchMesses } = useMess();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', description: '', color: '#1d4ed8' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Mess এর নাম দিন');
    try {
      await createMess(form);
      toast.success('Mess যোগ হয়েছে ✅');
      setForm({ name: '', address: '', description: '', color: '#1d4ed8' });
      setShowForm(false);
      fetchMesses();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`${name} মেস সরিয়ে দেবেন?`)) return;
    try {
      await deleteMess(id);
      toast.success('সরানো হয়েছে');
      fetchMesses();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🏠 Mess Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{messes.length}টি মেস আছে</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + নতুন Mess
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">নতুন Mess যোগ করুন</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Mess এর নাম *</label>
              <input className="input" placeholder="যেমন: বাসা মেস" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">ঠিকানা</label>
              <input className="input" placeholder="যেমন: মিরপুর ১০" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="label">বিবরণ</label>
              <input className="input" placeholder="যেমন: ৫ জনের মেস" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">রঙ বেছে নাও</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-success">✅ যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messes.map(mess => (
          <div key={mess._id}
            onClick={() => selectMess(mess)}
            className={`card cursor-pointer transition-all duration-200 ${
              activeMess?._id === mess._id
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : 'hover:shadow-md'
            }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: mess.color }}>
                  {mess.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{mess.name}</p>
                  {mess.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">📍 {mess.address}</p>
                  )}
                </div>
              </div>
              {activeMess?._id === mess._id && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                  ✅ Active
                </span>
              )}
            </div>
            {mess.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{mess.description}</p>
            )}
            <div className="flex items-center justify-between">
              <button onClick={(e) => { e.stopPropagation(); selectMess(mess); }}
                className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-100 transition">
                Select করুন
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(mess._id, mess.name); }}
                className="text-red-400 hover:text-red-600 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-950">
                ✕
              </button>
            </div>
          </div>
        ))}

        {messes.length === 0 && (
          <div className="md:col-span-3 text-center py-10 text-gray-400 dark:text-gray-600 card">
            <p className="text-3xl mb-2">🏠</p>
            <p>এখনো কোনো mess নেই। উপরে বোতাম চাপুন!</p>
          </div>
        )}
      </div>
    </div>
  );
}