import { useState, useEffect } from 'react';
import { getMembers, getMealsByDate, upsertMeal } from '../utils/api';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

export default function MealsPage() {
  const [members, setMembers] = useState([]);
  const [date, setDate] = useState(today());
  const [meals, setMeals] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => { getMembers().then(r => setMembers(r.data.data)); }, []);
  useEffect(() => { loadMeals(); }, [date]);

  const loadMeals = async () => {
    try {
      const res = await getMealsByDate(date);
      const map = {};
      res.data.data.forEach(m => {
        map[m.memberId._id || m.memberId] = m;
      });
      setMeals(map);
    } catch {}
  };

  const getMeal = (memberId) => meals[memberId] || { breakfast: false, lunch: false, dinner: false, guestMeals: 0 };

  const toggle = async (memberId, field) => {
    const current = getMeal(memberId);
    const updated = { ...current, [field]: !current[field] };
    setSaving(memberId + field);
    try {
      await upsertMeal({ memberId, date, ...updated });
      setMeals(prev => ({ ...prev, [memberId]: { ...prev[memberId], ...updated } }));
    } catch { toast.error('Save হয়নি'); }
    setSaving(null);
  };

  const totalMealsForMember = (memberId) => {
    const m = getMeal(memberId);
    return (m.breakfast ? 1 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0) + (m.guestMeals || 0);
  };

  const grandTotal = members.reduce((sum, m) => sum + totalMealsForMember(m._id), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🍛 Meal Tracking</h2>
          <p className="text-sm text-gray-500">আজকের মোট মিল: <strong>{grandTotal}টি</strong></p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input w-auto" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-gray-600 font-medium">নাম</th>
              <th className="text-center py-3 px-2 text-gray-600 font-medium">☀️ সকাল</th>
              <th className="text-center py-3 px-2 text-gray-600 font-medium">🌤️ দুপুর</th>
              <th className="text-center py-3 px-2 text-gray-600 font-medium">🌙 রাত</th>
              <th className="text-center py-3 px-2 text-gray-600 font-medium">মোট</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const m = getMeal(member._id);
              return (
                <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{member.name}</span>
                    </div>
                  </td>
                  {['breakfast', 'lunch', 'dinner'].map(field => (
                    <td key={field} className="text-center py-3 px-2">
                      <button
                        onClick={() => toggle(member._id, field)}
                        disabled={saving === member._id + field}
                        className={`w-8 h-8 rounded-full text-sm transition font-bold ${
                          m[field] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}>
                        {m[field] ? '✓' : '○'}
                      </button>
                    </td>
                  ))}
                  <td className="text-center py-3 px-2">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                      {totalMealsForMember(member._id)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-400">প্রথমে Members পেজে member যোগ করুন</div>
        )}
      </div>
    </div>
  );
}
