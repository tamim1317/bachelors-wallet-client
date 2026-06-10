import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import { useAuth }  from './context/AuthContext';
import {
  LayoutDashboard, Users, UtensilsCrossed, Wallet,
  Receipt, TrendingUp, Handshake, Target, Bell,
  DoorOpen, Bot, Sun, Moon, ChevronRight,
  MessageCircle, Settings, LogOut, Building2
} from 'lucide-react';

import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage   from './pages/MembersPage';
import MealsPage     from './pages/MealsPage';
import ExpensesPage  from './pages/ExpensesPage';
import BillsPage     from './pages/BillsPage';
import IncomePage    from './pages/IncomePage';
import SettlementPage from './pages/SettlementPage';
import MessPage      from './pages/MessPage';
import BudgetPage    from './pages/BudgetPage';
import NoticePage    from './pages/NoticePage';
import RoomPage      from './pages/RoomPage';
import PredictionPage from './pages/PredictionPage';
import ChatPage      from './pages/ChatPage';
import SettingsPage  from './pages/SettingsPage';
import PageLoader    from './components/PageLoader';

function DarkToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
      style={{ background: dark ? '#6366f1' : '#e2e8f0' }}>
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">{dark ? '' : '☀️'}</span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">{dark ? '🌙' : ''}</span>
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${dark ? 'translate-x-7' : 'translate-x-0.5'}`}>
        {dark ? <Moon size={12} className="text-indigo-600" /> : <Sun size={12} className="text-amber-500" />}
      </span>
    </button>
  );
}

function ProtectedLayout() {
  const { user, logout, isManager } = useAuth();

  const managerNav = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/members',    icon: Users,            label: 'Members' },
    { to: '/meals',      icon: UtensilsCrossed,  label: 'Meals' },
    { to: '/expenses',   icon: Wallet,           label: 'Expenses' },
    { to: '/income',     icon: TrendingUp,       label: 'Income' },
    { to: '/bills',      icon: Receipt,          label: 'Bills' },
    { to: '/settlement', icon: Handshake,        label: 'Settlement' },
    { to: '/budget',     icon: Target,           label: 'Budget' },
    { to: '/notices',    icon: Bell,             label: 'Notice' },
    { to: '/mess',       icon: Building2,        label: 'Mess' },
    { to: '/rooms',      icon: DoorOpen,         label: 'Rooms' },
    { to: '/prediction', icon: Bot,              label: 'AI Predict' },
    { to: '/chat',       icon: MessageCircle,    label: 'Chat' },
    { to: '/settings',   icon: Settings,         label: 'Settings' },
  ];

  const memberNav = [
    { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/meals',    icon: UtensilsCrossed, label: 'My Meals' },
    { to: '/income',   icon: TrendingUp,      label: 'Income' },
    { to: '/expenses', icon: Wallet,          label: 'Expenses' },
    { to: '/notices',  icon: Bell,            label: 'Notice' },
    { to: '/chat',     icon: MessageCircle,   label: 'Chat' },
  ];

  const navItems = isManager ? managerNav : memberNav;
  const mobileNav = navItems.slice(0, 5);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F1117]">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-[#13151F] border-r border-gray-100 dark:border-gray-800/60 fixed h-full hidden md:flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60">
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

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              isManager
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isManager ? '👑 Manager' : '👤 Member'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
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

        {/* Logout */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800/60">
          <button onClick={logout}
            className="nav-link nav-inactive w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60">
        <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#13151F]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wallet size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Bachelor's Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{user?.name}</span>
            <DarkToggle />
          </div>
        </div>

        <div className="p-4 md:p-6 pb-24 md:pb-8">
          <Routes>
            <Route path="/"           element={<DashboardPage />} />
            <Route path="/meals"      element={<MealsPage />} />
            <Route path="/income"     element={<IncomePage />} />
            <Route path="/expenses"   element={<ExpensesPage />} />
            <Route path="/notices"    element={<NoticePage />} />
            <Route path="/chat"       element={<ChatPage />} />
            {isManager && <>
              <Route path="/members"    element={<MembersPage />} />
              <Route path="/bills"      element={<BillsPage />} />
              <Route path="/settlement" element={<SettlementPage />} />
              <Route path="/budget"     element={<BudgetPage />} />
              <Route path="/mess"       element={<MessPage />} />
              <Route path="/rooms"      element={<RoomPage />} />
              <Route path="/prediction" element={<PredictionPage />} />
              <Route path="/settings"   element={<SettingsPage />} />
            </>}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {/* Mobile bottom nav — icon only, active shows label */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#13151F]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/60 flex z-50"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  {mobileNav.map(item => (
    <NavLink key={item.to} to={item.to} end={item.to === '/'}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center py-2 transition-all min-h-[56px] ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-400 dark:text-gray-600'
        }`
      }>
      {({ isActive }) => (
        <>
          <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          {isActive && (
            <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  ))}
</nav>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1117] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Wallet size={26} className="text-white" />
        </div>
        <p className="text-sm text-gray-400">লোড হচ্ছে...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      <PageLoader />
      {user ? <ProtectedLayout /> : (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}