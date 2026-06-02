import { useState, useEffect } from 'react';
import { getNotices, createNotice, togglePin, deleteNotice } from '../utils/api';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'general', label: '📢 General',  bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-700 dark:text-blue-300' },
  { value: 'info',    label: 'ℹ️ Info',     bg: 'bg-cyan-50 dark:bg-cyan-950',    border: 'border-cyan-200 dark:border-cyan-800',    text: 'text-cyan-700 dark:text-cyan-300' },
  { value: 'warning', label: '⚠️ Warning',  bg: 'bg-orange-50 dark:bg-orange-950',border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  { value: 'urgent',  label: '🚨 Urgent',   bg: 'bg-red-50 dark:bg-red-950',      border: 'border-red-200 dark:border-red-800',      text: 'text-red-700 dark:text-red-300' },
];

const getTypeStyle = (type) => TYPES.find(t => t.value === type) || TYPES[0];

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', type: 'general', postedBy: 'Manager', isPinned: false
  });

  const fetchNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data.data);
    } catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title দিন');
    if (!form.content.trim()) return toast.error('Content দিন');
    try {
      await createNotice(form);
      toast.success('Notice দেওয়া হয়েছে ✅');
      setForm({ title: '', content: '', type: 'general', postedBy: 'Manager', isPinned: false });
      setShowForm(false);
      fetchNotices();
    } catch { toast.error('Error'); }
  };

  const handlePin = async (id) => {
    try {
      await togglePin(id);
      fetchNotices();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('এই notice মুছে ফেলবেন?')) return;
    try {
      await deleteNotice(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchNotices();
    } catch { toast.error('Error'); }
  };

  const pinned  = notices.filter(n => n.isPinned);
  const regular = notices.filter(n => !n.isPinned);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">📌 Notice Board</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notices.length}টি notice আছে
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + নতুন Notice
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            নতুন Notice দিন
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="যেমন: এই মাসের বিল দিন"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">ধরন</label>
                <select className="input" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Content *</label>
              <textarea className="input h-24 resize-none"
                placeholder="Notice এর বিস্তারিত লিখুন..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Posted By</label>
                <input className="input" placeholder="Manager" value={form.postedBy}
                  onChange={e => setForm({ ...form, postedBy: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="pinned" checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <label htmlFor="pinned" className="text-sm text-gray-700 dark:text-gray-300">
                  📌 Notice pin করুন
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-success">✅ Post করুন</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pinned Notices */}
      {pinned.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            📌 Pinned
          </p>
          <div className="space-y-3">
            {pinned.map(notice => (
              <NoticeCard key={notice._id} notice={notice}
                onPin={handlePin} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices */}
      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              📢 সব Notice
            </p>
          )}
          <div className="space-y-3">
            {regular.map(notice => (
              <NoticeCard key={notice._id} notice={notice}
                onPin={handlePin} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {notices.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600 card">
          <p className="text-4xl mb-3">📌</p>
          <p>এখনো কোনো notice নেই</p>
          <p className="text-xs mt-2">উপরে বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}

function NoticeCard({ notice, onPin, onDelete }) {
  const style = getTypeStyle(notice.type);
  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {notice.isPinned && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-medium">
                📌 Pinned
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white dark:bg-gray-900 ${style.text}`}>
              {TYPES.find(t => t.value === notice.type)?.label}
            </span>
          </div>
          <h3 className={`font-bold text-base mb-1 ${style.text}`}>{notice.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {notice.content}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-600">
            <span>👤 {notice.postedBy}</span>
            <span>•</span>
            <span>{new Date(notice.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => onPin(notice._id)}
            className="p-1.5 rounded-lg bg-white dark:bg-gray-900 hover:bg-yellow-50 dark:hover:bg-yellow-950 transition"
            title={notice.isPinned ? 'Unpin' : 'Pin'}>
            {notice.isPinned ? '📌' : '📍'}
          </button>
          <button onClick={() => onDelete(notice._id)}
            className="p-1.5 rounded-lg bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950 text-red-400 hover:text-red-600 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}