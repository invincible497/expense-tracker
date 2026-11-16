import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budget Management',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

export default function TopBar({ setMobileOpen, onAddTransaction }) {
  const { settings, updateSettings } = useApp();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinTrack';

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 shadow-sm shrink-0 z-20">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Add transaction quick button */}
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
          title={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
