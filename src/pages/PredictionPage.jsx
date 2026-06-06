import { useState, useEffect } from 'react';
import { getPrediction } from '../utils/api';
import { Bot, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">৳{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const getAlertIcon = (type) => {
  if (type === 'warning') return AlertTriangle;
  if (type === 'success') return CheckCircle;
  return Info;
};

const getAlertStyle = (type) => {
  if (type === 'warning') return 'alert-warning';
  if (type === 'success') return 'alert-success';
  return 'alert-info';
};

export default function PredictionPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrediction()
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => { toast.error('লোড হয়নি'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Bot size={26} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-sm text-gray-400">AI prediction calculate হচ্ছে...</p>
      </div>
    </div>
  );

  if (!data) return null;

  const chartData = [
    ...data.historicalData.map(d => ({
      name: d.month, খরচ: d.totalExpense, আয়: d.totalIncome, type: 'actual'
    })),
    { name: data.nextMonth + ' ✦', খরচ: data.predicted, আয়: data.avgIncome, type: 'predicted' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Bot size={24} className="text-indigo-600 dark:text-indigo-400" />
          AI Expense Prediction
        </h1>
        <p className="page-sub">গত ৩ মাসের data দেখে আগামী মাসের prediction</p>
      </div>

      {/* Main Prediction Card */}
      <div className="card mb-5 border-2 border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {data.nextMonth} মাসের predicted খরচ
              </p>
            </div>
            <p className="text-5xl font-bold text-indigo-700 dark:text-indigo-300">
              ৳{data.predicted.toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                গড় ৳{data.avgExpense.toLocaleString()}
              </span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${data.trendPct > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {data.trendPct > 0
                  ? <><ArrowUpRight size={16} /> {data.trendPct}% বাড়ছে</>
                  : <><ArrowDownRight size={16} /> {Math.abs(data.trendPct)}% কমছে</>
                }
              </span>
            </div>
          </div>
          <div className="text-7xl opacity-80">
            {data.trendPct > 10 ? '📈' : data.trendPct < -5 ? '📉' : '📊'}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'গড় মাসিক খরচ',   value: `৳${data.avgExpense}`,  icon: TrendingDown, color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'গড় মাসিক আয়',    value: `৳${data.avgIncome}`,   icon: TrendingUp,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'খরচের trend',     value: `${data.trendPct > 0 ? '+' : ''}${data.trendPct}%`, icon: data.trendPct > 0 ? ArrowUpRight : ArrowDownRight, color: data.trendPct > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400', bg: data.trendPct > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Predicted সঞ্চয়', value: `৳${Math.max(data.avgIncome - data.predicted, 0).toFixed(0)}`, icon: Bot, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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

      {/* Smart Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="space-y-2 mb-5">
          {data.suggestions.map((s, i) => {
            const AlertIcon = getAlertIcon(s.type);
            return (
              <div key={i} className={`flex items-start gap-3 ${getAlertStyle(s.type)}`}>
                <AlertIcon size={16} className="flex-shrink-0 mt-0.5" />
                <span>{s.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Trend Chart */}
      <div className="card mb-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          খরচের ধারা + Prediction
          <span className="ml-2 text-xs font-normal text-gray-400">(✦ = predicted)</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
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
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="আয়"  stroke="#10b981" fill="url(#incG)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#expG)" strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Predictions */}
      {data.catPredictions.length > 0 && (
        <>
          <div className="card mb-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Category-wise Prediction</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.catPredictions.slice(0, 6)} barSize={32}>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="predicted" name="Predicted খরচ" radius={[8, 8, 0, 0]}>
                  {data.catPredictions.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">বিস্তারিত Breakdown</p>
            <div className="space-y-1">
              {data.catPredictions.map((cat, i) => (
                <div key={cat.category}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.category}</span>
                  <span className={`text-xs font-medium ${cat.trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {cat.trend > 0 ? `↑৳${cat.trend.toFixed(0)}` : `↓৳${Math.abs(cat.trend).toFixed(0)}`}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">৳{cat.predicted}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {data.catPredictions.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3">
            <Bot size={24} className="text-indigo-500" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">আরো data দরকার</p>
          <p className="text-sm text-gray-400 mt-1">কমপক্ষে ১ মাসের expense যোগ করলে prediction পাবে</p>
        </div>
      )}
    </div>
  );
}