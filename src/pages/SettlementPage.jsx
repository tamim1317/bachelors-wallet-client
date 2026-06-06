import { useState } from 'react';
import { getSettlement } from '../utils/api';
import { Handshake, Calculator, ArrowRight, ChevronDown, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const now = new Date();
const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

export default function SettlementPage() {
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await getSettlement(year, month);
      setResult(res.data.data);
      toast.success('Settlement calculate হয়েছে!');
    } catch { toast.error('Error হয়েছে'); }
    setLoading(false);
  };

  const COLORS = ['bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300','bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300','bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300','bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300','bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settlement System</h1>
        <p className="page-sub flex items-center gap-1.5">
          <Handshake size={14} /> কে কাকে কত টাকা দেবে auto calculate
        </p>
      </div>

      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">মাস</label>
            <div className="relative">
              <select className="input w-44 appearance-none pr-9" value={month}
                onChange={e => setMonth(+e.target.value)}>
                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">বছর</label>
            <input type="number" className="input w-28" value={year}
              onChange={e => setYear(+e.target.value)} />
          </div>
          <button onClick={handleCalculate} disabled={loading} className="btn-primary">
            <Calculator size={16} />
            {loading ? 'Calculate হচ্ছে...' : 'Calculate করুন'}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'মোট খরচ',      value: `৳${result.total}`,    icon: TrendingDown, color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'মাথাপিছু ভাগ', value: `৳${result.perHead}`,  icon: Users,        color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Transaction',   value: `${result.transactions.length}টি`, icon: Handshake, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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

          {/* Transactions */}
          <div className="card mb-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              💸 কে কাকে কত দেবে
            </h3>
            {result.transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                  <Handshake size={22} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300">সবাই সমান খরচ করেছে!</p>
                <p className="text-sm text-gray-400 mt-1">কোনো settlement দরকার নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.transactions.map((t, i) => (
                  <div key={i}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-emerald-50 dark:from-red-900/10 dark:to-emerald-900/10 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 flex items-center justify-center text-sm font-bold">
                        {t.from?.charAt(0)}
                      </div>
                      <span className="font-semibold text-red-600 dark:text-red-400 text-sm">{t.from}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400 font-medium">৳{t.amount}</span>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{t.to}</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-bold">
                        {t.to?.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance Sheet */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Balance Sheet</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="th text-left">নাম</th>
                    <th className="th text-center">দিয়েছে</th>
                    <th className="th text-center">ভাগ</th>
                    <th className="th text-center">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.balances.map((b, i) => (
                    <tr key={b.memberId} className="table-row">
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${COLORS[i % COLORS.length]}`}>
                            {b.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{b.name}</span>
                        </div>
                      </td>
                      <td className="td text-center text-gray-700 dark:text-gray-300">৳{b.paid}</td>
                      <td className="td text-center text-gray-700 dark:text-gray-300">৳{b.share}</td>
                      <td className="td text-center">
                        <span className={`badge ${b.balance > 0 ? 'badge-green' : b.balance < 0 ? 'badge-red' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {b.balance > 0 ? <TrendingUp size={11} /> : b.balance < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {b.balance > 0 ? `+৳${b.balance} পাবে` : b.balance < 0 ? `-৳${Math.abs(b.balance)} দেবে` : 'সমান'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Handshake size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">Settlement দেখতে Calculate করুন</p>
          <p className="text-sm text-gray-400 mt-1">মাস বেছে বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}