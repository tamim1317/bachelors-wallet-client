import { useState, useEffect } from 'react';
import { getRooms, getRoomStats, createRoom, deleteRoom, assignMember, removeMember } from '../utils/api';
import { getMembers } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  occupied:    { bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-200 dark:border-blue-800',   badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',   label: '🏠 ভর্তি' },
  vacant:      { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', label: '✅ খালি' },
  maintenance: { bg: 'bg-red-50 dark:bg-red-950',     border: 'border-red-200 dark:border-red-800',     badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',         label: '🔧 মেরামত' },
};

export default function RoomPage() {
  const [rooms, setRooms]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [form, setForm] = useState({
    roomNumber: '', floor: '', capacity: 1, monthlyRent: '', status: 'vacant', notes: ''
  });

  const fetchAll = async () => {
    try {
      const [roomRes, statsRes, memRes] = await Promise.all([
        getRooms(), getRoomStats(), getMembers()
      ]);
      setRooms(roomRes.data.data);
      setStats(statsRes.data.data);
      setMembers(memRes.data.data);
    } catch { toast.error('লোড হয়নি'); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber.trim()) return toast.error('রুম নম্বর দিন');
    try {
      await createRoom({ ...form, capacity: +form.capacity, monthlyRent: +form.monthlyRent });
      toast.success('Room যোগ হয়েছে ✅');
      setForm({ roomNumber: '', floor: '', capacity: 1, monthlyRent: '', status: 'vacant', notes: '' });
      setShowForm(false);
      fetchAll();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id, num) => {
    if (!confirm(`Room ${num} মুছে ফেলবেন?`)) return;
    try {
      await deleteRoom(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchAll();
    } catch { toast.error('Error'); }
  };

  const handleAssign = async () => {
    if (!selectedMember) return toast.error('Member বেছে নিন');
    try {
      await assignMember(assignModal._id, { memberId: selectedMember });
      toast.success('Member assign হয়েছে ✅');
      setAssignModal(null);
      setSelectedMember('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleRemove = async (roomId, memberId) => {
    try {
      await removeMember(roomId, { memberId });
      toast.success('Member সরানো হয়েছে');
      fetchAll();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🏠 Room Allocation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rooms.length}টি রুম আছে</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + নতুন Room
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'মোট রুম',    value: stats.total,       color: 'blue' },
            { label: 'ভর্তি',      value: stats.occupied,    color: 'blue' },
            { label: 'খালি',       value: stats.vacant,      color: 'green' },
            { label: 'মোট ভাড়া',  value: `৳${stats.totalRent}`, color: 'purple' },
          ].map(s => (
            <div key={s.label}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">নতুন Room যোগ করুন</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">রুম নম্বর *</label>
              <input className="input" placeholder="যেমন: ২০১" value={form.roomNumber}
                onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">তলা</label>
              <input className="input" placeholder="যেমন: ২য়" value={form.floor}
                onChange={e => setForm({ ...form, floor: e.target.value })} />
            </div>
            <div>
              <label className="label">ধারণক্ষমতা</label>
              <input type="number" className="input" min="1" max="10" value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div>
              <label className="label">মাসিক ভাড়া (৳)</label>
              <input type="number" className="input" placeholder="0" value={form.monthlyRent}
                onChange={e => setForm({ ...form, monthlyRent: e.target.value })} />
            </div>
            <div>
              <label className="label">অবস্থা</label>
              <select className="input" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="vacant">✅ খালি</option>
                <option value="occupied">🏠 ভর্তি</option>
                <option value="maintenance">🔧 মেরামত</option>
              </select>
            </div>
            <div>
              <label className="label">নোট</label>
              <input className="input" placeholder="যেমন: AC room" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-success">✅ যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => {
          const style = STATUS_STYLES[room.status] || STATUS_STYLES.vacant;
          return (
            <div key={room._id}
              className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      রুম {room.roomNumber}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {room.floor && <span>📍 {room.floor} তলা</span>}
                    <span>👥 {room.occupants.length}/{room.capacity}</span>
                    {room.monthlyRent > 0 && <span>৳{room.monthlyRent}/মাস</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(room._id, room.roomNumber)}
                  className="text-red-400 hover:text-red-600 text-sm p-1 rounded">
                  ✕
                </button>
              </div>

              {/* Occupants */}
              {room.occupants.length > 0 && (
                <div className="space-y-1 mb-3">
                  {room.occupants.map(occ => (
                    <div key={occ._id}
                      className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                          {occ.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {occ.name}
                        </span>
                      </div>
                      <button onClick={() => handleRemove(room._id, occ._id)}
                        className="text-red-400 hover:text-red-600 text-xs">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {room.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">📝 {room.notes}</p>
              )}

              {/* Assign Button */}
              {room.occupants.length < room.capacity && room.status !== 'maintenance' && (
                <button onClick={() => setAssignModal(room)}
                  className="w-full text-center text-xs py-2 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 transition font-medium">
                  + Member Assign করুন
                </button>
              )}
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="md:col-span-3 text-center py-10 text-gray-400 dark:text-gray-600 card">
            <p className="text-3xl mb-2">🏠</p>
            <p>এখনো কোনো room নেই। উপরে বোতাম চাপুন!</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">
              রুম {assignModal.roomNumber} এ Member Assign করুন
            </h3>
            <select className="input mb-4" value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}>
              <option value="">Member বেছে নিন...</option>
              {members
                .filter(m => !assignModal.occupants.find(o => o._id === m._id))
                .map(m => (
                  <option key={m._id} value={m._id}>{m.name} {m.room ? `(রুম ${m.room})` : ''}</option>
                ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleAssign} className="btn-success flex-1">
                ✅ Assign করুন
              </button>
              <button onClick={() => { setAssignModal(null); setSelectedMember(''); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 flex-1">
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}