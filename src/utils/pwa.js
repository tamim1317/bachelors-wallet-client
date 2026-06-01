// Service Worker register করো
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ SW registered:', reg.scope))
        .catch(err => console.error('❌ SW failed:', err));
    });
  }
}

// Notification permission নাও
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Local notification পাঠাও
export function sendLocalNotification(title, body, url = '/') {
  if (Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url },
    });
  });
}

// Daily meal reminder set করো (রাত ৯টা)
export function setMealReminder() {
  const now = new Date();
  const reminder = new Date();
  reminder.setHours(21, 0, 0, 0);
  if (now > reminder) reminder.setDate(reminder.getDate() + 1);
  const delay = reminder - now;

  setTimeout(() => {
    sendLocalNotification(
      '🍛 Meal Entry Reminder',
      'আজকের meal entry দিয়েছেন? এখনই দিন!',
      '/meals'
    );
    setInterval(() => {
      sendLocalNotification(
        '🍛 Meal Entry Reminder',
        'আজকের meal entry দিয়েছেন? এখনই দিন!',
        '/meals'
      );
    }, 24 * 60 * 60 * 1000);
  }, delay);
}