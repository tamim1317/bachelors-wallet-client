// WhatsApp এ bill share করো
export function shareBillOnWhatsApp({ month, totalMessCost, mealRate, bills }) {
  const paid = bills.filter(b => b.paid).length;
  const due  = bills.filter(b => !b.paid).length;

  let msg = `💰 *Bachelor's Wallet*\n`;
  msg += `📅 *${month} মাসের Bill*\n`;
  msg += `━━━━━━━━━━━━━━\n`;
  msg += `🛒 মোট খরচ: ৳${totalMessCost}\n`;
  msg += `🍛 মিল রেট: ৳${mealRate}/মিল\n`;
  msg += `━━━━━━━━━━━━━━\n`;

  bills.forEach(b => {
    const status = b.paid ? '✅' : '⏳';
    msg += `${status} ${b.name}: ৳${b.totalBill} (${b.totalMeals} মিল)\n`;
  });

  msg += `━━━━━━━━━━━━━━\n`;
  msg += `✅ পরিশোধ: ${paid}জন | ⏳ বাকি: ${due}জন\n`;
  msg += `\n_Bachelor's Wallet দিয়ে তৈরি_`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

// Clipboard এ copy করো
export async function copyBillToClipboard({ month, totalMessCost, mealRate, bills }) {
  let msg = `Bachelor's Wallet — ${month} মাসের Bill\n\n`;
  msg += `মোট খরচ: ৳${totalMessCost}\n`;
  msg += `মিল রেট: ৳${mealRate}/মিল\n\n`;

  bills.forEach(b => {
    const status = b.paid ? '✓' : '○';
    msg += `${status} ${b.name}: ৳${b.totalBill}\n`;
  });

  await navigator.clipboard.writeText(msg);
}