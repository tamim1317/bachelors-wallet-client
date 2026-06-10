import { useState } from 'react';
import { generateBill, markAsPaid } from '../utils/api';
import { generateBillPDF } from '../utils/generatePDF';
import { exportBillToExcel } from '../utils/exportExcel';
import { Receipt, Calculator, Download, FileSpreadsheet, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.success('Bill তৈরি হয়েছে!');
    } catch { toast.error('Bill তৈরি হয়নি'); }
    setLoading(false);
  };

  const handlePay = async (billId, name) => {
    try {
      await markAsPaid(billId);
      toast.success(`${name}-এর payment confirmed`);
      handleGenerate();
    } catch { toast.error('Error'); }
  };

  const paidCount = result?.bills?.filter(b => b.paid).length || 0;
  const dueCount  = result?.bills?.filter(b => !b.paid).length || 0;

  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Monthly Bill</h1>
          <p className="page-sub flex items-center gap-1.5">
            <Receipt size={14} />
            মাসিক বিল তৈরি ও ব্যবস্থাপনা
          </p>
        </div>
        {result && (
          <div className="flex items-center gap-2">
            <button onClick={() => exportBillToExcel(result)} className="btn-outline">
              <FileSpreadsheet size={15} /> Excel
            </button>
            <button onClick={() => { generateBillPDF(result); toast.success('PDF download হচ্ছে!'); }}
              className="btn-success">
              <Download size={15} /> PDF
            </button>
          </div>
        )}
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
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            <Calculator size={16} />
            {loading ? 'তৈরি হচ্ছে...' : 'Bill তৈরি করুন'}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'মোট খরচ', value: `৳${result.totalMessCost}`,   icon: Receipt,     color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'মোট মিল', value: `${result.totalMessMeals}টি`, icon: Calculator,  color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'পরিশোধ',  value: `${paidCount}জন`,             icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'বাকি',    value: `${dueCount}জন`,              icon: Clock,       color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

          <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <Calculator size={15} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm text-indigo-700 dark:text-indigo-300">
              প্রতি মিলের রেট: <strong className="ml-1">৳{result.mealRate}</strong>
              <span className="text-indigo-500 dark:text-indigo-400 ml-2">
                (৳{result.totalMessCost} ÷ {result.totalMessMeals} মিল)
              </span>
            </span>
          </div>

          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {months[month-1]} {year} — সদস্যভিত্তিক বিল
              </h3>
              <span className="text-xs text-gray-400">{paidCount}/{result.bills.length} পরিশোধ</span>
            </div>
            <table className="card overflow-x-auto ">
              <thead>
                <tr className="table-header">
                  <th className="th text-left">সদস্য</th>
                  <th className="th text-center">মিল</th>
                  <th className="th text-center">বিল</th>
                  <th className="th text-center">অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {result.bills.map((b, i) => {
                  const COLORS = ['bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300','bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300','bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300','bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'];
                  return (
                    <tr key={b._id} className="table-row">
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${COLORS[i % COLORS.length]}`}>
                            {b.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{b.name}</p>
                            {b.room && <p className="text-xs text-gray-400">ঘর {b.room}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="td text-center"><span className="badge-blue">{b.totalMeals}টি</span></td>
                      <td className="td text-center"><span className="font-bold text-gray-900 dark:text-white">৳{b.totalBill}</span></td>
                      <td className="td text-center">
                        {b.paid ? (
                          <span className="badge-green"><CheckCircle size={11} /> পরিশোধ</span>
                        ) : (
                          <button onClick={() => handlePay(b._id, b.name)}
                            className="badge-orange hover:opacity-80 transition cursor-pointer">
                            <Clock size={11} /> বাকি
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="td font-bold text-gray-900 dark:text-white">মোট</td>
                  <td className="td text-center font-bold">{result.totalMessMeals}টি</td>
                  <td className="td text-center font-bold text-indigo-600 dark:text-indigo-400 text-base">৳{result.totalMessCost}</td>
                  <td className="td text-center text-xs text-gray-400">{paidCount}/{result.bills.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {!result && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Receipt size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">কোনো bill তৈরি হয়নি</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">মাস ও বছর বেছে "Bill তৈরি করুন" বোতাম চাপুন</p>
        </div>
      )}
    </div>
  );
}