import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import MembersPage   from './pages/MembersPage';
import MealsPage     from './pages/MealsPage';
import ExpensesPage  from './pages/ExpensesPage';
import BillsPage     from './pages/BillsPage';

const navItems = [
  { to: '/',         icon: '📊', label: 'Dashboard' },
  { to: '/members',  icon: '👥', label: 'Members' },
  { to: '/meals',    icon: '🍛', label: 'Meals' },
  { to: '/expenses', icon: '💰', label: 'Expenses' },
  { to: '/bills',    icon: '🧾', label: 'Bills' },
];

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-lg font-bold text-blue-700">🎓 Mess Manager</h1>
            <p className="text-xs text-gray-500 mt-1">Bachelor Finance System</p>
          </div>
          <nav className="p-3 flex flex-col gap-1 flex-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }>
                <span>{item.icon}</span> {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-56">
          {/* Mobile topbar */}
          <div className="md:hidden bg-white border-b px-4 py-3 flex items-center gap-2">
            <span className="text-blue-700 font-bold">🎓 Mess Manager</span>
          </div>
          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-xs transition ${
                    isActive ? 'text-blue-700 font-semibold' : 'text-gray-500'
                  }`
                }>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route path="/"         element={<DashboardPage />} />
              <Route path="/members"  element={<MembersPage />} />
              <Route path="/meals"    element={<MealsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/bills"    element={<BillsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
