import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getWeeklySpending, exportToCSV } from '../utils/helpers';
import { IncomeExpenseChart, SpendingTrendChart, SavingsTrendChart } from '../components/charts/Charts';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const DATE_RANGES = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

function filterByRange(transactions, range) {
  const now = new Date();
  const cutoff = new Date(now);

  switch (range) {
    case 'month':
      cutoff.setDate(1);
      break;
    case '3months':
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      cutoff.setMonth(0);
      cutoff.setDate(1);
      break;
    case 'all':
    default:
      return transactions;
  }

  return transactions.filter(tx => new Date(tx.date) >= cutoff);
}

export default function ReportsPage() {
  const { transactions, categories, settings } = useApp();
  const [range, setRange] = useState('month');

  const filtered = useMemo(() => filterByRange(transactions, range), [transactions, range]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : '0.0';

  // Category breakdown for selected range
  const categoryData = useMemo(() => {
    const spending = {};
    filtered.filter(t => t.type === 'expense').forEach(tx => {
      spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
    });
    return Object.entries(spending)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId) || { name: catId, icon: '📦', color: '#6b7280' };
        return { name: cat.name, amount, color: cat.color, icon: cat.icon, pct: expenses > 0 ? (amount / expenses * 100).toFixed(1) : 0 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, categories, expenses]);

  const weeklyData = useMemo(() => getWeeklySpending(filtered, 8), [filtered]);

  function handleExport() {
    exportToCSV(filtered, `expense-report-${range}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Understand your financial patterns</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1 gap-1">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  range === r.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(income, settings.currency), color: 'text-emerald-500', icon: <TrendingUp size={18} /> },
          { label: 'Total Expenses', value: formatCurrency(expenses, settings.currency), color: 'text-red-500', icon: <TrendingDown size={18} /> },
          { label: 'Net Savings', value: formatCurrency(Math.abs(savings), settings.currency), color: savings >= 0 ? 'text-blue-500' : 'text-red-500', icon: '💰' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: Number(savingsRate) >= 20 ? 'text-emerald-500' : 'text-amber-500', icon: <Award size={18} /> },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className={item.color}>{item.icon}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Income vs Expenses</h2>
          <p className="text-xs text-gray-400 mb-5">Monthly comparison</p>
          <IncomeExpenseChart />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Savings Trend</h2>
          <p className="text-xs text-gray-400 mb-5">Income, expenses & savings over time</p>
          <SavingsTrendChart />
        </div>
      </div>

      {/* Weekly Spending */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Weekly Spending Activity</h2>
        <p className="text-xs text-gray-400 mb-5">Total spending per week</p>
        <SpendingTrendChart data={weeklyData} height={200} />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Spending by Category</h2>
          <p className="text-xs text-gray-400 mb-5">Highest spending categories</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData.slice(0, 7)} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  formatter={(v) => formatCurrency(v, settings.currency)}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {categoryData.slice(0, 7).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No expense data for selected range</p>
              </div>
            </div>
          )}
        </div>

        {/* Category table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Category Details</h2>
          <p className="text-xs text-gray-400 mb-4">Spending breakdown</p>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-lg w-6 shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white ml-2 shrink-0">{cat.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(cat.amount, settings.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
