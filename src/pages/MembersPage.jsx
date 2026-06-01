import { useState, useEffect } from 'react';
import { getMembers, createMember, deleteMember } from '../utils/api';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', room: '', phone: '' });
  const [loading, setLoading] = useState(false);

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
      toast.success('Member যোগ হয়েছে! ✅');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            👥 Members
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {members.length} জন সক্রিয় সদস্য
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + নতুন Member
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            নতুন Member যোগ করুন
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">নাম *</label>
              <input className="input" placeholder="যেমন: রাহিম" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">ঘর নম্বর</label>
              <input className="input" placeholder="যেমন: ২০১" value={form.room}
                onChange={e => setForm({ ...form, room: e.target.value })} />
            </div>
            <div>
              <label className="label">ফোন</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" disabled={loading} className="btn-success">
                {loading ? 'যোগ হচ্ছে...' : '✅ যোগ করুন'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m._id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {m.room ? `ঘর: ${m.room}` : 'ঘর নেই'} {m.phone ? `• ${m.phone}` : ''}
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(m._id, m.name)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950">
              ✕
            </button>
          </div>
        ))}
        {members.length === 0 && (
          <div className="md:col-span-3 text-center py-10 text-gray-400 dark:text-gray-600">
            <p className="text-3xl mb-2">👥</p>
            <p>এখনো কোনো member নেই। উপরে বোতাম চাপুন!</p>
          </div>
        )}
      </div>
    </div>
  );
}