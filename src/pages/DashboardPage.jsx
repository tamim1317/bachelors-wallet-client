import { useState, useEffect } from 'react';
import { getMembers, getExpenses, getMonthlySummary } from '../utils/api';
import { getIncomeSummary } from '../utils/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const now = new Date();
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

// Animated counter hook
function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function StatCard({ icon, label, value, sub, color }) {
  const animated = useCounter(parseFloat(value) || 0);
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    green:  'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300',
    red:    'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {typeof value === 'number' ? `৳${animated.toLocaleString()}` : value}
        </p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ৳{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats]             = useState({ members: 0, messTotal: 0, personalTotal: 0, totalMeals: 0, income: 0, savings: 0 });
  const [messBreakdown, setMessBreakdown]         = useState([]);
  const [personalBreakdown, setPersonalBreakdown] = useState([]);
  const [trend, setTrend]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;

    Promise.all([
      getMembers(),
      getExpenses({ type: 'mess',     month: m, year: y }),
      getExpenses({ type: 'personal', month: m, year: y }),
      getMonthlySummary(y, m),
      getIncomeSummary(currentMonth),
    ]).then(([mem, mess, personal, meals, income]) => {
      const totalIncome  = income.data.data.totalIncome  || 0;
      const totalExpense = income.data.data.totalExpense || 0;

      setStats({
        members:      mem.data.data.length,
        messTotal:    mess.data.total,
        personalTotal: personal.data.total,
        totalMeals:   meals.data.data.totalMessMeals,
        income:       totalIncome,
        savings:      totalIncome - totalExpense,
      });

      // Mess pie chart
      const catMap = {};
      mess.data.data.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      setMessBreakdown(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Personal bar chart
      const pMap = {};
      personal.data.data.forEach(e => {
        pMap[e.category] = (pMap[e.category] || 0) + e.amount;
      });
      setPersonalBreakdown(Object.entries(pMap).map(([name, value]) => ({ name, value })));

      // Last 6 months trend
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(y, m - 1 - i, 1);
        months.push({
          name: d.toLocaleString('default', { month: 'short' }),
          খরচ: Math.floor(Math.random() * 8000) + 4000, // placeholder
          আয়: Math.floor(Math.random() * 5000) + 8000,  // placeholder
        });
      }
      // last month real data
      if (months.length > 0) {
        months[months.length - 1].খরচ = totalExpense;
        months[months.length - 1].আয়  = totalIncome;
      }
      setTrend(months);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400 dark:text-gray-600">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p>Dashboard লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: '👥', label: 'সক্রিয় সদস্য',    value: `${stats.members}জন`,   sub: 'এই মেসে',           color: 'blue' },
    { icon: '💰', label: 'মোট আয়',           value: stats.income,           sub: 'এই মাসে',           color: 'green' },
    { icon: '🏠', label: 'Mess খরচ',          value: stats.messTotal,        sub: 'বাজার + utility',   color: 'orange' },
    { icon: '💳', label: 'Personal খরচ',      value: stats.personalTotal,    sub: 'রুম + transport...',color: 'purple' },
    { icon: '🍛', label: 'মোট মিল',           value: `${stats.totalMeals}টি`,sub: 'এই মাসে',           color: 'blue' },
    { icon: '🏦', label: 'সঞ্চয়',            value: stats.savings,          sub: stats.savings >= 0 ? '✅ সাশ্রয়' : '⚠️ ঘাটতি', color: stats.savings >= 0 ? 'green' : 'red' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">📊 Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Income vs Expense Progress */}
      {stats.income > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">আয় vs খরচ</h3>
            <span className={`text-sm font-medium ${stats.savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.savings >= 0 ? `৳${stats.savings} সঞ্চয়` : `৳${Math.abs(stats.savings)} ঘাটতি`}
            </span>
          </div>
          <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ${
                stats.messTotal + stats.personalTotal > stats.income ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(((stats.messTotal + stats.personalTotal) / stats.income) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>মোট খরচ: ৳{(stats.messTotal + stats.personalTotal).toLocaleString()}</span>
            <span>মোট আয়: ৳{stats.income.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* 6 Month Trend */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            📈 ৬ মাসের খরচের ধারা
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="আয়"  stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mess Breakdown Pie */}
        {messBreakdown.length > 0 ? (
          <div className="card">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
              🏠 Mess খরচের ভাগ
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={messBreakdown} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {messBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => `৳${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card flex items-center justify-center text-gray-400 dark:text-gray-600 h-48">
            <div className="text-center">
              <p className="text-3xl mb-2">🏠</p>
              <p className="text-sm">Mess খরচ যোগ করলে এখানে chart দেখাবে</p>
            </div>
          </div>
        )}
      </div>

      {/* Personal Expense Bar */}
      {personalBreakdown.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            💳 Personal খরচের বিভাগ
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={personalBreakdown} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="খরচ" radius={[6, 6, 0, 0]}>
                {personalBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🍛', label: 'Meal Entry',   path: '/meals' },
            { icon: '💰', label: 'খরচ যোগ',     path: '/expenses' },
            { icon: '💵', label: 'আয় যোগ',      path: '/income' },
            { icon: '🧾', label: 'Bill তৈরি',    path: '/bills' },
          ].map(a => (
            <a key={a.label} href={a.path}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition group">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {a.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}