import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Monthly Bill Excel Export
export function exportBillToExcel({ month, totalMessCost, totalMessMeals, mealRate, bills }) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ──
  const summaryData = [
    ["Bachelor's Wallet — Monthly Bill Report"],
    [],
    ["Month", month],
    ["Total Mess Cost", `BDT ${totalMessCost}`],
    ["Total Meals", totalMessMeals],
    ["Meal Rate", `BDT ${mealRate} per meal`],
    ["Total Members", bills.length],
    ["Generated On", new Date().toLocaleDateString('en-GB')],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // ── Sheet 2: Member Bills ──
  const billHeaders = ['#', 'Name', 'Room', 'Total Meals', 'Meal Rate', 'Bill (BDT)', 'Status'];
  const billRows = bills.map((b, i) => [
    i + 1,
    b.name || '-',
    b.room || '-',
    b.totalMeals,
    mealRate,
    b.totalBill,
    b.paid ? 'Paid ✅' : 'Due ❌',
  ]);

  const billSheet = XLSX.utils.aoa_to_sheet([billHeaders, ...billRows]);
  billSheet['!cols'] = [
    { wch: 5 }, { wch: 20 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(wb, billSheet, 'Member Bills');

  // ── Save ──
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob   = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, `bachelors-wallet-bill-${month}.xlsx`);
}

// Expense Excel Export
export function exportExpensesToExcel(expenses, month) {
  const wb = XLSX.utils.book_new();

  const headers = ['#', 'Date', 'Type', 'Category', 'Amount (BDT)', 'Note'];
  const rows = expenses.map((e, i) => [
    i + 1,
    new Date(e.date).toLocaleDateString('en-GB'),
    e.type === 'mess' ? 'Mess' : 'Personal',
    e.category,
    e.amount,
    e.note || '-',
  ]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push([]);
  rows.push(['', '', '', 'Total', total, '']);

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 10 },
    { wch: 18 }, { wch: 15 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, sheet, 'Expenses');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob   = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, `bachelors-wallet-expenses-${month}.xlsx`);
}

// Income Excel Export
export function exportIncomeToExcel(incomes, month) {
  const wb = XLSX.utils.book_new();

  const headers = ['#', 'Date', 'Source', 'Amount (BDT)', 'Note'];
  const rows = incomes.map((inc, i) => [
    i + 1,
    new Date(inc.date).toLocaleDateString('en-GB'),
    inc.source,
    inc.amount,
    inc.note || '-',
  ]);

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);
  rows.push([]);
  rows.push(['', '', 'Total', total, '']);

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 20 }, { wch: 15 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, sheet, 'Income');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob   = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, `bachelors-wallet-income-${month}.xlsx`);
}