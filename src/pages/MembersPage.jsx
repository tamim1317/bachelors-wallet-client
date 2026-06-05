import { useState, useEffect } from 'react';
import { getMembers, createMember, deleteMember } from '../utils/api';
import { UserPlus, User, Phone, Home, Trash2, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const [members, setMembers]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', room: '', phone: '' });
  const [loading, setLoading]   = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await getMembers();
      setMembers(res.data.data);
    } catch { toast.error('Member লোড হয়নি'); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('নাম দিন');
    setLoading(true);
    try {
      await createMember(form);
      toast.success('Member যোগ হয়েছে!');
      setForm({ name: '', room: '', phone: '' });
      setShowForm(false);
      fetchMembers();
    } catch { toast.error('Error হয়েছে'); }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`${name} কে সরিয়ে দেবেন?`)) return;
    try {
      await deleteMember(id);
      toast.success('সরানো হয়েছে');
      fetchMembers();
    } catch { toast.error('Error'); }
  };

  const AVATAR_COLORS = [
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-sub flex items-center gap-1.5">
            <Users size={14} />
            {members.length} জন সক্রিয় সদস্য
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <UserPlus size={16} />
          নতুন Member
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              নতুন Member যোগ করুন
            </h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">নাম *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="যেমন: রাহিম" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">ঘর নম্বর</label>
              <div className="relative">
                <Home size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="যেমন: ২০১" value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">ফোন</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="01XXXXXXXXX" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="md:col-span-3 flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="btn-success">
                {loading ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <div key={m._id}
            className="card flex items-center gap-4 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-200">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
              {m.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                {m.room && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Home size={11} /> {m.room}
                  </span>
                )}
                {m.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={11} /> {m.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Delete */}
            <button onClick={() => handleDelete(m._id, m.name)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {members.length === 0 && (
          <div className="md:col-span-3 card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">কোনো member নেই</p>
            <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
              উপরের বোতাম চেপে প্রথম member যোগ করুন
            </p>
          </div>
        )}
      </div>
    </div>
  );
}