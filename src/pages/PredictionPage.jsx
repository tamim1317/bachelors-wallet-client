import { useState, useEffect } from 'react';
import { getPrediction } from '../utils/api';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

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

export default function PredictionPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrediction()
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => { toast.error('লোড হয়নি'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400 dark:text-gray-600">
          <div className="text-4xl mb-3 animate-pulse">🤖</div>
          <p>AI prediction calculate হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Chart data তৈরি করো
  const chartData = [
    ...data.historicalData.map(d => ({
      name: d.month,
      খরচ: d.totalExpense,
      আয়:  d.totalIncome,
      type: 'actual'
    })),
    {
      name: data.nextMonth + ' (predicted)',
      খরচ: data.predicted,
      আয়:  data.avgIncome,
      type: 'predicted'
    }
  ];

  const getSuggestionStyle = (type) => {
    if (type === 'warning') return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400';
    if (type === 'success') return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400';
    return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400';
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          🤖 Expense Prediction
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          গত ৩ মাসের data দেখে আগামী মাসের prediction
        </p>
      </div>

      {/* Main Prediction Card */}
      <div className="card mb-5 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              🤖 {data.nextMonth} মাসের predicted খরচ
            </p>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
              ৳{data.predicted.toLocaleString()}
            </p>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
              গড় খরচ ৳{data.avgExpense.toLocaleString()} •
              {data.trendPct > 0 ? ` ↑${data.trendPct}% বাড়ছে` : ` ↓${Math.abs(data.trendPct)}% কমছে`}
            </p>
          </div>
          <div className="text-6xl">
            {data.trendPct > 10 ? '📈' : data.trendPct < -5 ? '📉' : '📊'}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'গড় মাসিক খরচ', value: `৳${data.avgExpense}`,  color: 'red' },
          { label: 'গড় মাসিক আয়',  value: `৳${data.avgIncome}`,   color: 'green' },
          { label: 'খরচের trend',   value: `${data.trendPct > 0 ? '+' : ''}${data.trendPct}%`, color: data.trendPct > 0 ? 'red' : 'green' },
          { label: 'Predicted সঞ্চয়', value: `৳${Math.max(data.avgIncome - data.predicted, 0).toFixed(0)}`, color: 'blue' },
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

      {/* Smart Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="space-y-2 mb-5">
          {data.suggestions.map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${getSuggestionStyle(s.type)}`}>
              {s.message}
            </div>
          ))}
        </div>
      )}

      {/* Trend Chart */}
      <div className="card mb-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
          📈 খরচের ধারা + Prediction
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
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
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="আয়"  stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2}
              strokeDasharray={chartData[chartData.length-1] ? "5 5" : "0"} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-2">
          --- ডটted line = predicted
        </p>
      </div>

      {/* Category Predictions */}
      {data.catPredictions.length > 0 && (
        <div className="card mb-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            🏷️ Category-wise Prediction
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.catPredictions.slice(0, 6)} barSize={32}>
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="predicted" name="Predicted খরচ" radius={[6, 6, 0, 0]}>
                {data.catPredictions.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Table */}
      {data.catPredictions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            📋 বিস্তারিত Category Prediction
          </h3>
          <div className="space-y-2">
            {data.catPredictions.map((cat, i) => (
              <div key={cat.category}
                className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${cat.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {cat.trend > 0 ? `↑৳${cat.trend.toFixed(0)}` : `↓৳${Math.abs(cat.trend).toFixed(0)}`}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    ৳{cat.predicted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.catPredictions.length === 0 && (
        <div className="card text-center py-10 text-gray-400 dark:text-gray-600">
          <p className="text-3xl mb-2">📊</p>
          <p>আরো কিছু expense যোগ করলে better prediction পাবে!</p>
          <p className="text-xs mt-1">কমপক্ষে ১ মাসের data দরকার</p>
        </div>
      )}
    </div>
  );
}