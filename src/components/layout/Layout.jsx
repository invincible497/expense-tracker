import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';
import NotificationStack from '../ui/NotificationStack';
import TransactionModal from '../transactions/TransactionModal';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div
        className={`
          flex flex-col flex-1 min-w-0 overflow-hidden
          transition-all duration-300
          ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}
      >
        <TopBar
          setMobileOpen={setMobileOpen}
          onAddTransaction={() => setShowAddModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          <Outlet context={{ setShowAddModal }} />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Notifications */}
      <NotificationStack />

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
