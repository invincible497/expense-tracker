import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  BarChart3, Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/budgets',      icon: Wallet,          label: 'Budgets' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports' },
  { to: '/settings',     icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { settings, getTotalBalance } = useApp();
  const balance = getTotalBalance();
  const isPositive = balance >= 0;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#0f172a] text-white select-none
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-sm font-black">F</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight text-white">FinTrack</span>
            )}
          </div>
          {/* Mobile close button */}
          {!collapsed && mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Balance card */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
            <p className="text-xs text-white/40 font-medium mb-1">Total Balance</p>
            <p className={`font-bold text-xl tracking-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(balance, settings.currency)}
            </p>
            <p className="text-xs text-white/30 mt-1">{settings.displayName}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-1
                font-medium text-sm transition-all duration-150 group
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-emerald-400" />
                  )}
                  <Icon size={19} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="p-3 border-t border-white/10 hidden lg:block shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors text-xs font-medium ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed
              ? <ChevronRight size={16} />
              : <><ChevronLeft size={16} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>
    </>
  );
}
