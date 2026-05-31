import { useState, useEffect } from 'react';
import { getMembers, getExpenses, getMonthlySummary } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const now = new Date();
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState({ members: 0, messTotal: 0, personalTotal: 0, totalMeals: 0 });
  const [messBreakdown, setMessBreakdown] = useState([]);
  const [personalBreakdown, setPersonalBreakdown] = useState([]);

  useEffect(() => {
    const y = now.getFullYear(), m = now.getMonth() + 1;

    Promise.all([
      getMembers(),
      getExpenses({ type: 'mess', month: m, year: y }),
      getExpenses({ type: 'personal', month: m, year: y }),
      getMonthlySummary(y, m)
    ]).then(([mem, mess, personal, meals]) => {
      setStats({
        members: mem.data.data.length,
        messTotal: mess.data.total,
        personalTotal: personal.data.total,
        totalMeals: meals.data.data.totalMessMeals
      });

      // Pie chart data for mess expenses by category
      const catMap = {};
      mess.data.data.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      setMessBreakdown(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Bar chart for personal expenses
      const pMap = {};
      personal.data.data.forEach(e => {
        pMap[e.category] = (pMap[e.category] || 0) + e.amount;
      });
      setPersonalBreakdown(Object.entries(pMap).map(([name, value]) => ({ name, value })));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'সক্রিয় সদস্য',   value: `${stats.members}জন`,          icon: '👥', color: 'blue' },
    { label: 'Mess খরচ (এই মাসে)', value: `৳${stats.messTotal.toFixed(0)}`, icon: '🏠', color: 'orange' },
    { label: 'Personal খরচ',   value: `৳${stats.personalTotal.toFixed(0)}`, icon: '💳', color: 'purple' },
    { label: 'মোট মিল',         value: `${stats.totalMeals}টি`,         icon: '🍛', color: 'green' },
  ];

  const colorMap = { blue: 'bg-blue-50 text-blue-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-purple-50 text-purple-700', green: 'bg-green-50 text-green-700' };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">📊 Dashboard</h2>
        <p className="text-sm text-gray-500">{now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${colorMap[s.color]}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {messBreakdown.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">🏠 Mess খরচের ভাগ</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={messBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {messBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `৳${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {personalBreakdown.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">💳 Personal খরচের ভাগ</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={personalBreakdown}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => `৳${v}`} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {messBreakdown.length === 0 && personalBreakdown.length === 0 && (
          <div className="md:col-span-2 card text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📊</p>
            <p>কিছু খরচ যোগ করলে এখানে chart দেখাবে!</p>
          </div>
        )}
      </div>
    </div>
  );
}
