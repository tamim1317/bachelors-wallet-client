import { useState } from 'react';
import { generateBill, markAsPaid } from '../utils/api';
import toast from 'react-hot-toast';

const now = new Date();

export default function BillsPage() {
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateBill(year, month);
      setResult(res.data.data);
      toast.success('Bill তৈরি হয়েছে! ✅');
    } catch { toast.error('Bill তৈরি হয়নি'); }
    setLoading(false);
  };

  const handlePay = async (billId, name) => {
    try {
      await markAsPaid(billId);
      toast.success(`${name}-এর payment confirm হয়েছে ✅`);
      handleGenerate();
    } catch { toast.error('Error'); }
  };

  const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-5">🧾 Monthly Bill</h2>

      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">মাস</label>
            <select className="input w-auto" value={month} onChange={e => setMonth(+e.target.value)}>
              {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">বছর</label>
            <input type="number" className="input w-28" value={year} onChange={e => setYear(+e.target.value)} />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            {loading ? 'তৈরি হচ্ছে...' : '🧮 Bill তৈরি করুন'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'মোট খরচ', value: `৳${result.totalMessCost}`, color: 'red' },
              { label: 'মোট মিল', value: `${result.totalMessMeals}টি`, color: 'blue' },
              { label: 'মিল রেট', value: `৳${result.mealRate}`, color: 'purple' },
              { label: 'সদস্য', value: `${result.bills.length}জন`, color: 'green' },
            ].map(s => (
              <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bill table */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-3 px-3 text-gray-600 font-medium">নাম</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-medium">মিল</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-medium">বিল</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-medium">অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {result.bills.map(b => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {b.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{b.name}</p>
                          {b.room && <p className="text-xs text-gray-400">ঘর: {b.room}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 text-gray-700">{b.totalMeals}টি</td>
                    <td className="text-center py-3 px-3 font-bold text-gray-800">৳{b.totalBill}</td>
                    <td className="text-center py-3 px-3">
                      {b.paid ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">✅ পরিশোধ</span>
                      ) : (
                        <button onClick={() => handlePay(b._id, b.name)}
                          className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded-full text-xs font-medium transition">
                          💳 বাকি
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!result && (
        <div className="text-center py-12 text-gray-400 card">
          <p className="text-4xl mb-3">🧾</p>
          <p>মাস ও বছর বেছে "Bill তৈরি করুন" বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}
