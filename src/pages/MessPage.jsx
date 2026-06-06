import { useState } from 'react';
import { useMess } from '../context/MessContext';
import { createMess, deleteMess } from '../utils/api';
import { Building2, Plus, Trash2, CheckCircle, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899'];

export default function MessPage() {
  const { messes, activeMess, selectMess, fetchMesses } = useMess();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', description: '', color: '#6366f1' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Mess এর নাম দিন');
    try {
      await createMess(form);
      toast.success('Mess যোগ হয়েছে!');
      setForm({ name: '', address: '', description: '', color: '#6366f1' });
      setShowForm(false);
      fetchMesses();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`${name} মেস সরিয়ে দেবেন?`)) return;
    try { await deleteMess(id); toast.success('সরানো হয়েছে'); fetchMesses(); }
    catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mess Management</h1>
          <p className="page-sub flex items-center gap-1.5">
            <Building2 size={14} /> {messes.length}টি মেস আছে
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> নতুন Mess
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">নতুন Mess যোগ করুন</h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="label">রঙ</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-xl transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-success">যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messes.map(mess => (
          <div key={mess._id}
            onClick={() => selectMess(mess)}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeMess?._id === mess._id
                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                : ''
            }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
                  style={{ background: mess.color }}>
                  {mess.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{mess.name}</p>
                  {mess.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {mess.address}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(mess._id, mess.name); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <Trash2 size={14} />
              </button>
            </div>

            {mess.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{mess.description}</p>
            )}

            <div className="flex items-center justify-between">
              {activeMess?._id === mess._id ? (
                <span className="badge badge-green">
                  <CheckCircle size={11} /> Active
                </span>
              ) : (
                <button onClick={e => { e.stopPropagation(); selectMess(mess); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Select করুন →
                </button>
              )}
            </div>
          </div>
        ))}

        {messes.length === 0 && (
          <div className="md:col-span-3 card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">কোনো mess নেই</p>
            <p className="text-sm text-gray-400 mt-1">উপরে বোতাম চেপে প্রথম mess যোগ করুন</p>
          </div>
        )}
      </div>
    </div>
  );
}