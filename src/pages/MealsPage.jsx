import { useState, useEffect } from 'react';
import { getMembers, getMealsByDate, upsertMeal } from '../utils/api';
import { UtensilsCrossed, Sun, Sunset, Moon, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

const MEAL_CONFIG = [
  { key: 'breakfast', label: 'সকাল', icon: Sun,     color: 'amber' },
  { key: 'lunch',     label: 'দুপুর', icon: Sunset,  color: 'orange' },
  { key: 'dinner',    label: 'রাত',   icon: Moon,    color: 'indigo' },
];

export default function MealsPage() {
  const [members, setMembers] = useState([]);
  const [date, setDate]       = useState(today());
  const [meals, setMeals]     = useState({});
  const [saving, setSaving]   = useState(null);

  useEffect(() => { getMembers().then(r => setMembers(r.data.data)); }, []);
  useEffect(() => { loadMeals(); }, [date]);

  const loadMeals = async () => {
    try {
      const res = await getMealsByDate(date);
      const map = {};
      res.data.data.forEach(m => { map[m.memberId._id || m.memberId] = m; });
      setMeals(map);
    } catch {}
  };

  const getMeal = (id) => meals[id] || { breakfast: false, lunch: false, dinner: false, guestMeals: 0 };

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

  const totalFor = (id) => {
    const m = getMeal(id);
    return (m.breakfast ? 1 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0) + (m.guestMeals || 0);
  };

  const grandTotal = members.reduce((sum, m) => sum + totalFor(m._id), 0);

  const colorMap = {
    amber:  { on: 'bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900 shadow-sm',  off: 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500' },
    orange: { on: 'bg-orange-500 text-white shadow-orange-200 dark:shadow-orange-900 shadow-sm', off: 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500' },
    indigo: { on: 'bg-indigo-500 text-white shadow-indigo-200 dark:shadow-indigo-900 shadow-sm', off: 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500' },
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Meal Tracking</h1>
          <p className="page-sub flex items-center gap-1.5">
            <UtensilsCrossed size={14} />
            আজকের মোট মিল: <strong className="text-gray-700 dark:text-gray-300">{grandTotal}টি</strong>
          </p>
        </div>
        <div className="relative">
          <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="input pl-9 w-auto" />
        </div>
      </div>

      {/* Meal Summary Pills */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {MEAL_CONFIG.map(meal => {
          const count = members.filter(m => getMeal(m._id)[meal.key]).length;
          return (
            <div key={meal.key}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1C1F2E] rounded-xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
              <meal.icon size={15} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{meal.label}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
          <Users size={15} className="text-indigo-500" />
          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">মোট {grandTotal}টি মিল</span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="th text-left">সদস্য</th>
              {MEAL_CONFIG.map(m => (
                <th key={m.key} className="th text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <m.icon size={13} /> {m.label}
                  </div>
                </th>
              ))}
              <th className="th text-center">মোট</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => {
              const m = getMeal(member._id);
              const COLORS = ['bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300','bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300','bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300','bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'];
              return (
                <tr key={member._id} className="table-row">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${COLORS[i % COLORS.length]}`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                    </div>
                  </td>
                  {MEAL_CONFIG.map(meal => (
                    <td key={meal.key} className="td text-center">
                      <button
                        onClick={() => toggle(member._id, meal.key)}
                        disabled={saving === member._id + meal.key}
                        className={`w-9 h-9 rounded-xl text-sm transition-all duration-200 flex items-center justify-center mx-auto ${
                          m[meal.key]
                            ? colorMap[meal.color].on
                            : colorMap[meal.color].off
                        }`}>
                        {m[meal.key]
                          ? <meal.icon size={15} />
                          : <span className="w-3 h-3 rounded-full border-2 border-current opacity-40" />
                        }
                      </button>
                    </td>
                  ))}
                  <td className="td text-center">
                    <span className="badge-blue font-bold">
                      {totalFor(member._id)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              প্রথমে Members পেজে member যোগ করুন
            </p>
          </div>
        )}
      </div>
    </div>
  );
}