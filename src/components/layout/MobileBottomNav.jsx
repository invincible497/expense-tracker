import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, BarChart3, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/budgets',      icon: Wallet,          label: 'Budgets' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports' },
  { to: '/settings',     icon: Settings,        label: 'Settings' },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0
              text-[10px] font-medium transition-colors
              ${isActive
                ? 'text-emerald-500'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
