import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import {
  LayoutDashboard, Users, UtensilsCrossed, Wallet,
  Receipt, TrendingUp, Handshake, Target, Bell,
  DoorOpen, Bot, Sun, Moon, ChevronRight
} from 'lucide-react';

import DashboardPage  from './pages/DashboardPage';
import MembersPage    from './pages/MembersPage';
import MealsPage      from './pages/MealsPage';
import ExpensesPage   from './pages/ExpensesPage';
import BillsPage      from './pages/BillsPage';
import IncomePage     from './pages/IncomePage';
import SettlementPage from './pages/SettlementPage';
import MessPage       from './pages/MessPage';
import BudgetPage     from './pages/BudgetPage';
import NoticePage     from './pages/NoticePage';
import RoomPage       from './pages/RoomPage';
import PredictionPage from './pages/PredictionPage';
import PageLoader from './components/PageLoader';
import SettingsPage from './pages/SettingsPage';
import { Settings } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/members',   icon: Users,            label: 'Members' },
  { to: '/meals',     icon: UtensilsCrossed,  label: 'Meals' },
  { to: '/expenses',  icon: Wallet,           label: 'Expenses' },
  { to: '/income',    icon: TrendingUp,       label: 'Income' },
  { to: '/bills',     icon: Receipt,          label: 'Bills' },
  { to: '/settlement',icon: Handshake,        label: 'Settlement' },
  { to: '/budget',    icon: Target,           label: 'Budget' },
  { to: '/notices',   icon: Bell,             label: 'Notice' },
  { to: '/mess',      icon: DoorOpen,         label: 'Mess' },
  { to: '/rooms',     icon: DoorOpen,         label: 'Rooms' },
  { to: '/prediction',icon: Bot,              label: 'AI Predict' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function DarkToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      style={{ background: dark ? '#6366f1' : '#e2e8f0' }}
      title={dark ? 'Light mode এ যাও' : 'Dark mode এ যাও'}>
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">
        {dark ? '' : '☀️'}
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">
        {dark ? '🌙' : ''}
      </span>
      {/* Thumb */}
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
        dark ? 'translate-x-7' : 'translate-x-0.5'
      }`}>
        {dark
          ? <Moon size={12} className="text-indigo-600" />
          : <Sun size={12} className="text-amber-500" />
        }
      </span>
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
      }} />

      <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F1117]">

        {/* ── Sidebar ── */}
        <aside className="w-60 bg-white dark:bg-[#13151F] border-r border-gray-100 dark:border-gray-800/60 fixed h-full hidden md:flex flex-col">

          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Wallet size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Bachelor's Wallet</p>
                  <p className="text-xs text-gray-400">Finance Manager</p>
                </div>
              </div>
              <DarkToggle />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-active' : 'nav-inactive'}`
                }>
                {({ isActive }) => (
                  <>
                    <item.icon size={17} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-indigo-400" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/60">
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Bachelor's Wallet v2.0
            </p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 md:ml-60">

          {/* Mobile topbar */}
          <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#13151F]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Wallet size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white">Bachelor's Wallet</span>
            </div>
            <DarkToggle />
          </div>

          <div className="p-4 md:p-6 pb-24 md:pb-8">
            <Routes>
              <Route path="/"          element={<DashboardPage />} />
              <Route path="/members"   element={<MembersPage />} />
              <Route path="/meals"     element={<MealsPage />} />
              <Route path="/expenses"  element={<ExpensesPage />} />
              <Route path="/income"    element={<IncomePage />} />
              <Route path="/bills"     element={<BillsPage />} />
              <Route path="/settlement"element={<SettlementPage />} />
              <Route path="/budget"    element={<BudgetPage />} />
              <Route path="/notices"   element={<NoticePage />} />
              <Route path="/mess"      element={<MessPage />} />
              <Route path="/rooms"     element={<RoomPage />} />
              <Route path="/prediction"element={<PredictionPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
            
          </div>
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#13151F]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/60 flex z-50 px-2 py-1">
          {navItems.slice(0, 5).map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-1.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-600'
                }`
              }>
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="mt-0.5 font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}