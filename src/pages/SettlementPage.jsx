import { useState } from 'react';
import { getSettlement } from '../utils/api';
import toast from 'react-hot-toast';

const now    = new Date();
const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
                 'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

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
      toast.success('Settlement calculate হয়েছে! ✅');
    } catch { toast.error('Error হয়েছে'); }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          🤝 Settlement System
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          কে কাকে কত টাকা দেবে auto calculate
        </p>
      </div>

      {/* Filter */}
      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">মাস</label>
            <select className="input w-auto" value={month}
              onChange={e => setMonth(+e.target.value)}>
              {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">বছর</label>
            <input type="number" className="input w-28" value={year}
              onChange={e => setYear(+e.target.value)} />
          </div>
          <button onClick={handleCalculate} disabled={loading} className="btn-primary">
            {loading ? 'Calculate হচ্ছে...' : '🧮 Calculate করুন'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'মোট খরচ',      value: `৳${result.total}`,   color: 'red' },
              { label: 'মাথাপিছু ভাগ', value: `৳${result.perHead}`, color: 'blue' },
              { label: 'Transaction',   value: `${result.transactions.length}টি`, color: 'purple' },
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

          {/* Transactions — কে কাকে দেবে */}
          <div className="card mb-5">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
              💸 কে কাকে কত দেবে
            </h3>
            {result.transactions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-600">
                <p className="text-3xl mb-2">✅</p>
                <p>সবাই সমান খরচ করেছে! কোনো settlement দরকার নেই।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.transactions.map((t, i) => (
                  <div key={i}
                    className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-xl border border-orange-100 dark:border-orange-900">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-red-600 dark:text-red-400 text-base">
                          {t.from}
                        </span>
                        <span className="text-gray-400 dark:text-gray-600 text-sm">দেবে</span>
                        <span className="font-bold text-green-600 dark:text-green-400 text-base">
                          {t.to}
                        </span>
                        <span className="text-gray-400 dark:text-gray-600 text-sm">কে</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        ৳{t.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance Sheet */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
              📊 Balance Sheet
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header text-left">
                    <th className="py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">নাম</th>
                    <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">দিয়েছে</th>
                    <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">ভাগ</th>
                    <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.balances.map(b => (
                    <tr key={b.memberId} className="table-row">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                            {b.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {b.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3 text-gray-700 dark:text-gray-300">
                        ৳{b.paid}
                      </td>
                      <td className="text-center py-3 px-3 text-gray-700 dark:text-gray-300">
                        ৳{b.share}
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                          b.balance > 0
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
                            : b.balance < 0
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {b.balance > 0 ? `+৳${b.balance} পাবে` : b.balance < 0 ? `-৳${Math.abs(b.balance)} দেবে` : '✅ সমান'}
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
        <div className="text-center py-12 text-gray-400 dark:text-gray-600 card">
          <p className="text-4xl mb-3">🤝</p>
          <p>মাস বেছে Calculate করুন বোতাম চাপুন</p>
          <p className="text-xs mt-2">কে কাকে কত টাকা দেবে auto বের হবে</p>
        </div>
      )}
    </div>
  );
}