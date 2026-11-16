export default function StatCard({ label, value, icon, change, changeLabel, color = 'emerald' }) {
  const colorMap = {
    emerald: { accent: 'bg-emerald-100 dark:bg-emerald-800/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    red:     { accent: 'bg-red-100 dark:bg-red-800/40',         iconColor: 'text-red-600 dark:text-red-400' },
    blue:    { accent: 'bg-blue-100 dark:bg-blue-800/40',       iconColor: 'text-blue-600 dark:text-blue-400' },
    purple:  { accent: 'bg-purple-100 dark:bg-purple-800/40',   iconColor: 'text-purple-600 dark:text-purple-400' },
    amber:   { accent: 'bg-amber-100 dark:bg-amber-800/40',     iconColor: 'text-amber-600 dark:text-amber-400' },
    teal:    { accent: 'bg-teal-100 dark:bg-teal-800/40',       iconColor: 'text-teal-600 dark:text-teal-400' },
  };
  const c = colorMap[color] || colorMap.emerald;
  const hasChange = change !== undefined && change !== null && !isNaN(change);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight truncate">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.accent}`}>
          <span className={`${c.iconColor}`}>{icon}</span>
        </div>
      </div>
      {changeLabel && (
        <div className="flex items-center gap-1.5">
          {hasChange && (
            <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
          )}
          <span className="text-xs text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
