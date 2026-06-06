import { useState, useEffect } from 'react';
import { getNotices, createNotice, togglePin, deleteNotice } from '../utils/api';
import { Bell, Pin, PinOff, Trash2, Plus, X, AlertTriangle, Info, Megaphone, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'general', label: 'General',  Icon: Megaphone,    bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-100 dark:border-blue-800/50',   text: 'text-blue-700 dark:text-blue-300',   badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  { value: 'info',    label: 'Info',     Icon: Info,          bg: 'bg-cyan-50 dark:bg-cyan-900/20',   border: 'border-cyan-100 dark:border-cyan-800/50',   text: 'text-cyan-700 dark:text-cyan-300',   badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
  { value: 'warning', label: 'Warning',  Icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
  { value: 'urgent',  label: 'Urgent',   Icon: Zap,           bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-100 dark:border-red-800/50',     text: 'text-red-700 dark:text-red-300',     badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
];

const getType = (val) => TYPES.find(t => t.value === val) || TYPES[0];

export default function NoticePage() {
  const [notices, setNotices]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', content: '', type: 'general', postedBy: 'Manager', isPinned: false });

  const fetchNotices = async () => {
    try { const res = await getNotices(); setNotices(res.data.data); }
    catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title দিন');
    if (!form.content.trim()) return toast.error('Content দিন');
    try {
      await createNotice(form);
      toast.success('Notice দেওয়া হয়েছে!');
      setForm({ title: '', content: '', type: 'general', postedBy: 'Manager', isPinned: false });
      setShowForm(false);
      fetchNotices();
    } catch { toast.error('Error'); }
  };

  const pinned  = notices.filter(n => n.isPinned);
  const regular = notices.filter(n => !n.isPinned);

  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-sub flex items-center gap-1.5">
            <Bell size={14} /> {notices.length}টি notice আছে
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> নতুন Notice
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">নতুন Notice</h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="যেমন: এই মাসের বিল দিন"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">ধরন</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                        form.type === t.value ? `${t.badge} border-transparent` : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                      <t.Icon size={12} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="label">Content *</label>
              <textarea className="input h-24 resize-none" placeholder="Notice এর বিস্তারিত..."
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Posted By</label>
                <input className="input" placeholder="Manager" value={form.postedBy}
                  onChange={e => setForm({ ...form, postedBy: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.isPinned}
                    onChange={e => setForm({ ...form, isPinned: e.target.checked })} />
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">Notice pin করুন</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-success">Post করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {pinned.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Pin size={12} /> Pinned
          </p>
          <div className="space-y-3">
            {pinned.map(n => <NoticeCard key={n._id} notice={n} onFetch={fetchNotices} />)}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">All Notices</p>
          )}
          <div className="space-y-3">
            {regular.map(n => <NoticeCard key={n._id} notice={n} onFetch={fetchNotices} />)}
          </div>
        </div>
      )}

      {notices.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">কোনো notice নেই</p>
          <p className="text-sm text-gray-400 mt-1">উপরে বোতাম চেপে প্রথম notice দিন</p>
        </div>
      )}
    </div>
  );
}

function NoticeCard({ notice, onFetch }) {
  const style = getType(notice.type);

  const handlePin = async () => {
    try { await togglePin(notice._id); onFetch(); }
    catch { toast.error('Error'); }
  };

  const handleDelete = async () => {
    if (!confirm('এই notice মুছে ফেলবেন?')) return;
    try { await deleteNotice(notice._id); toast.success('মুছে ফেলা হয়েছে'); onFetch(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.badge}`}>
          <style.Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${style.badge} text-xs`}>{style.label}</span>
            {notice.isPinned && (
              <span className="badge bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs">
                <Pin size={10} /> Pinned
              </span>
            )}
          </div>
          <h3 className={`font-bold text-sm mb-1 ${style.text}`}>{notice.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{notice.content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{notice.postedBy}</span>
            <span>·</span>
            <span>{new Date(notice.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={handlePin}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-400 hover:text-yellow-600 transition-all">
            {notice.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button onClick={handleDelete}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}