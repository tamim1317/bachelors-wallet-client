import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import MembersPage   from './pages/MembersPage';
import MealsPage     from './pages/MealsPage';
import ExpensesPage  from './pages/ExpensesPage';
import BillsPage     from './pages/BillsPage';
import IncomePage from './pages/IncomePage';
import SettlementPage from './pages/SettlementPage';

const navItems = [
  { to: '/',         icon: '📊', label: 'Dashboard' },
  { to: '/members',  icon: '👥', label: 'Members' },
  { to: '/meals',    icon: '🍛', label: 'Meals' },
  { to: '/expenses', icon: '💰', label: 'Expenses' },
  { to: '/bills',    icon: '🧾', label: 'Bills' },
  { to: '/income', icon: '💵', label: 'Income' },
  { to: '/settlement', icon: '🤝', label: 'Settlement' },
];

function DarkToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center
                 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                 text-gray-600 dark:text-gray-300 transition-all duration-300"
      title={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right"
        toastOptions={{
          style: { background: 'var(--toast-bg)', color: 'var(--toast-text)' }
        }} />
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

        {/* Sidebar */}
        <aside className="w-56 sidebar-bg fixed h-full hidden md:flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                💰 Bachelor's Wallet
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Finance Manager</p>
            </div>
            <DarkToggle />
          </div>
          <nav className="p-3 flex flex-col gap-1 flex-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive ? 'nav-active' : 'nav-inactive'
                  }`
                }>
                <span>{item.icon}</span> {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Bachelor's Wallet v2.0
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-56">
          {/* Mobile topbar */}
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <span className="text-blue-700 dark:text-blue-400 font-bold">💰 Bachelor's Wallet</span>
            <DarkToggle />
          </div>

          <div className="p-4 md:p-6 pb-24 md:pb-6">
            <Routes>
              <Route path="/"         element={<DashboardPage />} />
              <Route path="/members"  element={<MembersPage />} />
              <Route path="/meals"    element={<MealsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/bills"    element={<BillsPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/settlement" element={<SettlementPage />} />
            </Routes>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex z-50">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-all duration-200 ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-500'
                }`
              }>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}