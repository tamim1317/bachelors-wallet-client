import { useState, useEffect } from 'react';
import { getRooms, getRoomStats, createRoom, deleteRoom, assignMember, removeMember } from '../utils/api';
import { getMembers } from '../utils/api';
import { DoorOpen, Plus, Trash2, Users, UserPlus, UserMinus, X, Home, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS = {
  occupied:    { label: 'ভর্তি',   badge: 'badge-blue',                                                              bg: 'bg-blue-50 dark:bg-blue-900/10',   border: 'border-blue-100 dark:border-blue-800/50',   icon: Home },
  vacant:      { label: 'খালি',    badge: 'badge-green',                                                             bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800/50', icon: DoorOpen },
  maintenance: { label: 'মেরামত', badge: 'badge-orange',                                                             bg: 'bg-amber-50 dark:bg-amber-900/10',  border: 'border-amber-100 dark:border-amber-800/50',  icon: Wrench },
};

export default function RoomPage() {
  const [rooms, setRooms]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [form, setForm] = useState({ roomNumber: '', floor: '', capacity: 1, monthlyRent: '', status: 'vacant', notes: '' });

  const fetchAll = async () => {
    try {
      const [r, s, m] = await Promise.all([getRooms(), getRoomStats(), getMembers()]);
      setRooms(r.data.data);
      setStats(s.data.data);
      setMembers(m.data.data);
    } catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber.trim()) return toast.error('রুম নম্বর দিন');
    try {
      await createRoom({ ...form, capacity: +form.capacity, monthlyRent: +form.monthlyRent });
      toast.success('Room যোগ হয়েছে!');
      setForm({ roomNumber: '', floor: '', capacity: 1, monthlyRent: '', status: 'vacant', notes: '' });
      setShowForm(false);
      fetchAll();
    } catch { toast.error('Error'); }
  };

  const handleAssign = async () => {
    if (!selectedMember) return toast.error('Member বেছে নিন');
    try {
      await assignMember(assignModal._id, { memberId: selectedMember });
      toast.success('Member assign হয়েছে!');
      setAssignModal(null);
      setSelectedMember('');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const COLORS = ['bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300','bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300','bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300','bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'];

  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Room Allocation</h1>
          <p className="page-sub flex items-center gap-1.5">
            <DoorOpen size={14} /> {rooms.length}টি রুম আছে
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> নতুন Room
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'মোট রুম',    value: stats.total,       icon: DoorOpen, color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'ভর্তি',      value: stats.occupied,    icon: Home,     color: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'খালি',       value: stats.vacant,      icon: DoorOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'মোট ভাড়া',  value: `৳${stats.totalRent}`, icon: Home, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">নতুন Room</h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="label">রুম নম্বর *</label><input className="input" placeholder="যেমন: ২০১" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div>
            <div><label className="label">তলা</label><input className="input" placeholder="যেমন: ২য়" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} /></div>
            <div><label className="label">ধারণক্ষমতা</label><input type="number" className="input" min="1" max="10" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
            <div><label className="label">মাসিক ভাড়া (৳)</label><input type="number" className="input" placeholder="0" value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: e.target.value })} /></div>
            <div>
              <label className="label">অবস্থা</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="vacant">খালি</option>
                <option value="occupied">ভর্তি</option>
                <option value="maintenance">মেরামত</option>
              </select>
            </div>
            <div><label className="label">নোট</label><input className="input" placeholder="যেমন: AC room" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-success">যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => {
          const s = STATUS[room.status] || STATUS.vacant;
          return (
            <div key={room._id} className={`rounded-2xl border p-4 ${s.bg} ${s.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">রুম {room.roomNumber}</h3>
                    <span className={`badge ${s.badge}`}><s.icon size={11} /> {s.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {room.floor && <span>{room.floor} তলা</span>}
                    <span className="flex items-center gap-1"><Users size={11} /> {room.occupants.length}/{room.capacity}</span>
                    {room.monthlyRent > 0 && <span>৳{room.monthlyRent}/মাস</span>}
                  </div>
                </div>
                <button onClick={() => { if(confirm(`Room ${room.roomNumber} মুছবেন?`)) deleteRoom(room._id).then(fetchAll); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>

              {room.occupants.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {room.occupants.map((occ, i) => (
                    <div key={occ._id} className="flex items-center justify-between bg-white dark:bg-gray-900/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${COLORS[i % COLORS.length]}`}>
                          {occ.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{occ.name}</span>
                      </div>
                      <button onClick={() => removeMember(room._id, { memberId: occ._id }).then(fetchAll)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <UserMinus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {room.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{room.notes}</p>}

              {room.occupants.length < room.capacity && room.status !== 'maintenance' && (
                <button onClick={() => setAssignModal(room)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-white dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 transition-all">
                  <UserPlus size={13} /> Member Assign করুন
                </button>
              )}
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="md:col-span-3 card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <DoorOpen size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">কোনো room নেই</p>
            <p className="text-sm text-gray-400 mt-1">উপরে বোতাম চেপে room যোগ করুন</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1C1F2E] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                রুম {assignModal.roomNumber} এ Assign করুন
              </h3>
              <button onClick={() => { setAssignModal(null); setSelectedMember(''); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X size={15} />
              </button>
            </div>
            <select className="input mb-4" value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}>
              <option value="">Member বেছে নিন...</option>
              {members.filter(m => !assignModal.occupants.find(o => o._id === m._id))
                .map(m => <option key={m._id} value={m._id}>{m.name} {m.room ? `(রুম ${m.room})` : ''}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleAssign} className="btn-success flex-1">Assign করুন</button>
              <button onClick={() => { setAssignModal(null); setSelectedMember(''); }} className="btn-outline flex-1">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}