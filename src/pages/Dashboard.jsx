import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, Wallet, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getDailySpending } from '../utils/helpers';
import StatCard from '../components/ui/StatCard';
import TransactionList from '../components/transactions/TransactionList';
import { IncomeExpenseChart, ExpensePieChart, SpendingTrendChart } from '../components/charts/Charts';

function BudgetBar({ label, spent, budget, color = '#10b981', currency = 'KSh' }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over  = spent > budget && budget > 0;
  const warn  = pct > 80 && !over;
  const barColor = over ? '#ef4444' : warn ? '#f59e0b' : color;
  const remaining = budget - spent;

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate pr-2">{label}</span>
        <span className={`text-xs font-semibold shrink-0 ${over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {budget > 0 && (
        <p className={`text-xs mt-0.5 ${over ? 'text-red-400' : 'text-gray-400'}`}>
          {over
            ? `Over by ${formatCurrency(Math.abs(remaining), currency)}`
            : `${formatCurrency(remaining, currency)} left`}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { transactions, budgets, categories, settings, getTotalBalance, getMonthlyStats, getCategorySpending } = useApp();
  const { setShowAddModal } = useOutletContext();

  const now = new Date();
  const thisMonth  = getMonthlyStats(now.getMonth(), now.getFullYear());
  const prevMonth  = getMonthlyStats(
    now.getMonth() === 0 ? 11 : now.getMonth() - 1,
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  );

  const totalBalance   = getTotalBalance();
  const savings        = thisMonth.income - thisMonth.expenses;
  const savingsRate    = thisMonth.income > 0 ? ((savings / thisMonth.income) * 100).toFixed(1) : '0.0';
  const remainingBudget = Math.max(0, budgets.overall - thisMonth.expenses);

  const incomeChange   = prevMonth.income   > 0 ? ((thisMonth.income   - prevMonth.income)   / prevMonth.income)   * 100 : 0;
  const expenseChange  = prevMonth.expenses > 0 ? ((thisMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 : 0;

  const dailyData = useMemo(() => getDailySpending(transactions, 14), [transactions]);

  const categorySpending = getCategorySpending(now.getMonth(), now.getFullYear());

  const topExpenseCategories = useMemo(() =>
    Object.entries(categorySpending)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId) || { id: catId, name: catId, icon: '📦', color: '#6b7280' };
        return { ...cat, spent: amount, budget: budgets.categories?.[catId] || 0 };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5),
    [categorySpending, categories, budgets]
  );

  const budgetUsedPct = budgets.overall > 0
    ? Math.min((thisMonth.expenses / budgets.overall) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {settings.displayName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <ArrowUpRight size={16} />
          Quick Add
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(totalBalance, settings.currency)}
          icon={<DollarSign size={20} />}
          color={totalBalance >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(thisMonth.income, settings.currency)}
          icon={<TrendingUp size={20} />}
          color="emerald"
          change={incomeChange}
          changeLabel="vs last month"
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(thisMonth.expenses, settings.currency)}
          icon={<TrendingDown size={20} />}
          color="red"
          change={expenseChange}
          changeLabel="vs last month"
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(remainingBudget, settings.currency)}
          icon={<Wallet size={20} />}
          color={budgetUsedPct >= 100 ? 'red' : budgetUsedPct >= 80 ? 'amber' : 'teal'}
          changeLabel={`${budgetUsedPct.toFixed(0)}% of budget used`}
        />
      </div>

      {/* Savings summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Monthly Savings',
            value: formatCurrency(Math.max(0, savings), settings.currency),
            sub: `${savingsRate}% savings rate`,
            color: savings >= 0 ? 'text-emerald-500' : 'text-red-500',
            icon: '💰',
          },
          {
            label: 'Transactions This Month',
            value: thisMonth.transactions.length,
            sub: `${thisMonth.transactions.filter(t=>t.type==='expense').length} expenses · ${thisMonth.transactions.filter(t=>t.type==='income').length} income`,
            color: 'text-blue-500',
            icon: '🔄',
          },
          {
            label: 'Highest Expense Day',
            value: (() => {
              const byDay = {};
              thisMonth.transactions.filter(t=>t.type==='expense').forEach(t => { byDay[t.date] = (byDay[t.date]||0)+t.amount; });
              const max = Math.max(...Object.values(byDay), 0);
              return formatCurrency(max, settings.currency);
            })(),
            sub: 'Single-day record this month',
            color: 'text-orange-500',
            icon: '📈',
          },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
            <span className="text-2xl">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className={`text-lg font-bold truncate ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months comparison</p>
          </div>
          <IncomeExpenseChart />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Spending Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">This month by category</p>
          </div>
          <ExpensePieChart />
        </div>
      </div>

      {/* Budget + Daily trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Budget utilization */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Budget Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly utilization</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              budgetUsedPct >= 100 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              budgetUsedPct >= 80  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
              {budgetUsedPct.toFixed(0)}% used
            </span>
          </div>

          <BudgetBar label="Overall Budget" spent={thisMonth.expenses} budget={budgets.overall} currency={settings.currency} />

          {topExpenseCategories.length > 0 && (
            <div className="border-t border-gray-100 dark:border-slate-700 mt-4 pt-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">Top categories</p>
              {topExpenseCategories.map(cat => (
                <BudgetBar key={cat.id} label={`${cat.icon} ${cat.name}`} spent={cat.spent} budget={cat.budget} color={cat.color} currency={settings.currency} />
              ))}
            </div>
          )}

          <Link
            to="/budgets"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            Manage budgets <ArrowRight size={13} />
          </Link>
        </div>

        {/* Daily spending trend */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Daily Spending (Last 14 Days)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your recent spending activity</p>
          </div>
          <SpendingTrendChart data={dailyData} height={210} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your latest financial activity</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <TransactionList limitRows={8} showFilters={false} />
      </div>
    </div>
  );
}
