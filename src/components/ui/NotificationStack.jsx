import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const TYPES = {
  success: { Icon: CheckCircle, iconClass: 'text-emerald-500', border: 'border-l-emerald-500' },
  error:   { Icon: AlertCircle, iconClass: 'text-red-500',     border: 'border-l-red-500' },
  info:    { Icon: Info,        iconClass: 'text-blue-500',    border: 'border-l-blue-500' },
  warning: { Icon: AlertCircle, iconClass: 'text-amber-500',   border: 'border-l-amber-500' },
};

export default function NotificationStack() {
  const { notifications, removeNotification } = useApp();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {notifications.map(n => {
        const { Icon, iconClass, border } = TYPES[n.type] || TYPES.success;
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-xl bg-white dark:bg-slate-800 border-l-4 ${border} border border-gray-100 dark:border-slate-700`}
            style={{
              animation: 'slideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${iconClass}`} />
            <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 font-medium leading-snug">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
