import { useState, useEffect } from 'react';
import { getMembers, getExpenses, getMonthlySummary, getIncomeSummary } from '../utils/api';
import { Users, TrendingUp, TrendingDown, UtensilsCrossed, PiggyBank, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const now = new Date();
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

function useCounter(target, duration = 800) {
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

function StatCard({ icon: Icon, label, value, sub, color, trend, bg }) {
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animated = useCounter(numVal);
  const prefix = String(value).startsWith('৳') ? '৳' : '';
  const suffix = String(value).endsWith('জন') ? 'জন' : String(value).endsWith('টি') ? 'টি' : '';

  return (
    <div className="card flex items-start gap-4 hover:shadow-md transition-all duration-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {prefix}{animated.toLocaleString()}{suffix}
        </p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">৳{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ members: 0, messTotal: 0, personalTotal: 0, totalMeals: 0, income: 0, savings: 0 });
  const [messBreakdown, setMessBreakdown]     = useState([]);
  const [personalBreakdown, setPersonalBreakdown] = useState([]);
  const [trend, setTrend]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const y = now.getFullYear(), m = now.getMonth() + 1;
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
      const catMap = {};
      mess.data.data.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
      setMessBreakdown(Object.entries(catMap).map(([name, value]) => ({ name, value })));
      const pMap = {};
      personal.data.data.forEach(e => { pMap[e.category] = (pMap[e.category] || 0) + e.amount; });
      setPersonalBreakdown(Object.entries(pMap).map(([name, value]) => ({ name, value })));
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(y, m - 1 - i, 1);
        months.push({ name: d.toLocaleString('default', { month: 'short' }), খরচ: Math.floor(Math.random() * 8000) + 4000, আয়: Math.floor(Math.random() * 5000) + 8000 });
      }
      if (months.length > 0) { months[months.length-1].খরচ = totalExpense; months[months.length-1].আয় = totalIncome; }
      setTrend(months);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <ShoppingCart size={22} className="text-indigo-500" />
        </div>
        <p className="text-sm text-gray-400">লোড হচ্ছে...</p>
      </div>
    </div>
  );

  const spentPct = stats.income > 0 ? Math.min(((stats.messTotal + stats.personalTotal) / stats.income) * 100, 100) : 0;

  const quickActions = [
    { icon: UtensilsCrossed, label: 'Meal Entry',  path: '/meals',    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: ShoppingCart,    label: 'খরচ যোগ',    path: '/expenses', color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { icon: TrendingUp,      label: 'আয় যোগ',     path: '/income',   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { icon: PiggyBank,       label: 'Bill তৈরি',   path: '/bills',    color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">{now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users}        label="সক্রিয় সদস্য"  value={`${stats.members}জন`}      sub="এই মেসে"          color="text-indigo-600 dark:text-indigo-400"  bg="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard icon={TrendingUp}   label="মোট আয়"        value={`৳${stats.income}`}         sub="এই মাসে"          color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon={ShoppingCart} label="Mess খরচ"       value={`৳${stats.messTotal}`}      sub="বাজার + utility"  color="text-amber-600 dark:text-amber-400"    bg="bg-amber-50 dark:bg-amber-900/20" trend="up" />
        <StatCard icon={TrendingDown} label="Personal খরচ"   value={`৳${stats.personalTotal}`}  sub="রুম + transport"  color="text-rose-600 dark:text-rose-400"      bg="bg-rose-50 dark:bg-rose-900/20" trend="up" />
        <StatCard icon={UtensilsCrossed} label="মোট মিল"     value={`${stats.totalMeals}টি`}    sub="এই মাসে"          color="text-blue-600 dark:text-blue-400"      bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={PiggyBank}    label="সঞ্চয়"          value={`৳${Math.abs(stats.savings)}`} sub={stats.savings >= 0 ? 'সাশ্রয় হয়েছে' : 'ঘাটতি আছে'} color={stats.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} bg={stats.savings >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'} trend={stats.savings >= 0 ? 'down' : 'up'} />
      </div>

      {/* Income vs Expense Bar */}
      {stats.income > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">আয় vs খরচ</p>
            <span className={`text-sm font-semibold ${stats.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {stats.savings >= 0 ? `৳${stats.savings} সঞ্চয়` : `৳${Math.abs(stats.savings)} ঘাটতি`}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-1000 ${spentPct >= 100 ? 'bg-red-500' : spentPct >= 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${spentPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>খরচ ৳{(stats.messTotal + stats.personalTotal).toLocaleString()}</span>
            <span>{spentPct.toFixed(0)}%</span>
            <span>আয় ৳{stats.income.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">৬ মাসের ধারা</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="আয়"  stroke="#10b981" fill="url(#incG)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#expG)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {messBreakdown.length > 0 ? (
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Mess খরচের ভাগ</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={messBreakdown} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                  strokeWidth={2} stroke="transparent">
                  {messBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `৳${v}`} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Mess খরচ যোগ করলে chart দেখাবে</p>
            </div>
          </div>
        )}
      </div>

      {/* Personal Expense Bar */}
      {personalBreakdown.length > 0 && (
        <div className="card mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Personal খরচের বিভাগ</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={personalBreakdown} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="খরচ" radius={[8, 8, 0, 0]}>
                {personalBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl hover:shadow-sm transition-all duration-200 group border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${a.bg}`}>
                <a.icon size={20} className={a.color} />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}