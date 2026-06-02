import { useState } from 'react';
import { generateBill, markAsPaid } from '../utils/api';
import toast from 'react-hot-toast';
import { generateBillPDF } from '../utils/generatePDF';
import { exportBillToExcel } from '../utils/exportExcel';

const now = new Date();
const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
                 'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

export default function BillsPage() {
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth() + 1);
  const [result, setResult]   = useState(null);
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

  const handleDownloadPDF = () => {
    if (!result) return toast.error('আগে Bill তৈরি করুন');
    generateBillPDF(result);
    toast.success('PDF download হচ্ছে! ✅');
  };

  const handleDownloadExcel = () => {
  if (!result) return toast.error('আগে Bill তৈরি করুন');
  exportBillToExcel(result);
  toast.success('Excel download হচ্ছে! ✅');
};

  const handlePay = async (billId, name) => {
    try {
      await markAsPaid(billId);
      toast.success(`${name}-এর payment confirm হয়েছে ✅`);
      handleGenerate();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🧾 Monthly Bill</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            মাসিক বিল তৈরি ও PDF download করুন
          </p>
        </div>
        {result && (
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium transition">
            📄 PDF Download
          </button>
        )}
      </div>

      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">মাস</label>
            <select className="input w-auto" value={month}
              onChange={e => setMonth(+e.target.value)}>
              {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">বছর</label>
            <input type="number" className="input w-28" value={year}
              onChange={e => setYear(+e.target.value)} />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            {loading ? 'তৈরি হচ্ছে...' : '🧮 Bill তৈরি করুন'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'মোট খরচ', value: `৳${result.totalMessCost}`, color: 'red' },
              { label: 'মোট মিল', value: `${result.totalMessMeals}টি`, color: 'blue' },
              { label: 'মিল রেট', value: `৳${result.mealRate}`, color: 'purple' },
              { label: 'সদস্য',   value: `${result.bills.length}জন`, color: 'green' },
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

          {/* Bill Table */}
          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                সদস্যভিত্তিক বিল — {months[month - 1]} {year}
              </h3>
              <button onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition font-medium">
                📄 PDF
              </button>
              {result && (
  <button onClick={handleDownloadExcel}
    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
    📊 Excel Download
  </button>
)}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header text-left">
                  <th className="py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">নাম</th>
                  <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">মিল</th>
                  <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">বিল</th>
                  <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {result.bills.map(b => (
                  <tr key={b._id} className="table-row">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                          {b.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{b.name}</p>
                          {b.room && (
                            <p className="text-xs text-gray-400 dark:text-gray-600">ঘর: {b.room}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 text-gray-700 dark:text-gray-300">
                      {b.totalMeals}টি
                    </td>
                    <td className="text-center py-3 px-3 font-bold text-gray-800 dark:text-gray-100">
                      ৳{b.totalBill}
                    </td>
                    <td className="text-center py-3 px-3">
                      {b.paid ? (
                        <span className="badge-green px-3 py-1 rounded-full text-xs font-medium">
                          ✅ পরিশোধ
                        </span>
                      ) : (
                        <button onClick={() => handlePay(b._id, b.name)}
                          className="badge-orange hover:opacity-80 px-3 py-1 rounded-full text-xs font-medium transition">
                          💳 বাকি
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Total row */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 font-bold text-gray-800 dark:text-gray-100">মোট</td>
                  <td className="text-center py-3 px-3 font-bold text-gray-800 dark:text-gray-100">
                    {result.totalMessMeals}টি
                  </td>
                  <td className="text-center py-3 px-3 font-bold text-blue-600 dark:text-blue-400 text-base">
                    ৳{result.totalMessCost}
                  </td>
                  <td className="text-center py-3 px-3 text-xs text-gray-500 dark:text-gray-400">
                    {result.bills.filter(b => b.paid).length}/{result.bills.length} পরিশোধ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {!result && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600 card">
          <p className="text-4xl mb-3">🧾</p>
          <p>মাস ও বছর বেছে "Bill তৈরি করুন" বোতাম চাপুন</p>
          <p className="text-xs mt-2">তারপর PDF download করতে পারবে</p>
        </div>
      )}
    </div>
  );
}