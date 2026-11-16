import { useState, useMemo, useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

function ProgressBar({ pct, over, warn }) {
  const barColor = over ? '#ef4444' : warn ? '#f59e0b' : '#10b981';
  return (
    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export default function BudgetsPage() {
  const { budgets, categories, settings, updateBudget, getCategorySpending, getMonthlyStats } = useApp();

  const now = new Date();
  const { expenses: monthlyExpenses } = getMonthlyStats(now.getMonth(), now.getFullYear());
  const categorySpending = getCategorySpending(now.getMonth(), now.getFullYear());

  const [overallBudget, setOverallBudget] = useState(String(budgets.overall || ''));
  const [catBudgets, setCatBudgets] = useState(() => {
    const init = {};
    categories.filter(c => c.type === 'expense' || !c.type).forEach(cat => {
      init[cat.id] = String(budgets.categories?.[cat.id] || '');
    });
    return init;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOverallBudget(String(budgets.overall || ''));
    const init = {};
    categories.filter(c => c.type === 'expense' || !c.type).forEach(cat => {
      init[cat.id] = String(budgets.categories?.[cat.id] || '');
    });
    setCatBudgets(init);
  }, [budgets, categories]);

  const expenseCategories = categories.filter(c => c.type === 'expense' || !c.type);

  const overallPct = Number(overallBudget) > 0 ? (monthlyExpenses / Number(overallBudget)) * 100 : 0;
  const overallOver = monthlyExpenses > Number(overallBudget) && Number(overallBudget) > 0;
  const overallWarn = overallPct > 80 && !overallOver;

  function saveAll() {
    updateBudget({
      overall: Number(overallBudget) || 0,
      categories: Object.fromEntries(
        Object.entries(catBudgets).map(([k, v]) => [k, Number(v) || 0])
      ),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const exceedingCategories = useMemo(() => {
    return expenseCategories.filter(cat => {
      const budget = Number(catBudgets[cat.id]) || 0;
      const spent = categorySpending[cat.id] || 0;
      return budget > 0 && spent > budget;
    });
  }, [expenseCategories, catBudgets, categorySpending]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })} budgets
          </p>
        </div>
        <button
          onClick={saveAll}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            saved ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Budgets'}
        </button>
      </div>

      {/* Exceeding alert */}
      {exceedingCategories.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Budget Exceeded!</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
              {exceedingCategories.map(c => c.name).join(', ')} {exceedingCategories.length === 1 ? 'is' : 'are'} over budget this month.
            </p>
          </div>
        </div>
      )}

      {/* Overall budget */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Overall Monthly Budget</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Budget Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{settings.currency}</span>
              <input
                type="number"
                value={overallBudget}
                onChange={e => setOverallBudget(e.target.value)}
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses, settings.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
            <p className={`text-2xl font-bold ${overallOver ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatCurrency(Math.abs(Number(overallBudget) - monthlyExpenses), settings.currency)}
              {overallOver ? ' over' : ''}
            </p>
          </div>
        </div>

        <ProgressBar pct={overallPct} over={overallOver} warn={overallWarn} />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{formatCurrency(0, settings.currency)}</span>
          <span className={`text-xs font-semibold ${overallOver ? 'text-red-500' : overallWarn ? 'text-amber-500' : 'text-emerald-500'}`}>
            {overallPct.toFixed(0)}% used
          </span>
          <span className="text-xs text-gray-400">{formatCurrency(Number(overallBudget) || 0, settings.currency)}</span>
        </div>
      </div>

      {/* Category budgets */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Category Budgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expenseCategories.map(cat => {
            const budget = Number(catBudgets[cat.id]) || 0;
            const spent = categorySpending[cat.id] || 0;
            const pct = budget > 0 ? (spent / budget) * 100 : 0;
            const over = spent > budget && budget > 0;
            const warn = pct > 80 && !over;
            const remaining = budget - spent;

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cat.name}</span>
                    {over && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Over!</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      {formatCurrency(spent, settings.currency)}
                      {budget > 0 ? ` / ${formatCurrency(budget, settings.currency)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar pct={pct} over={over} warn={warn} />
                  </div>
                  <div className="relative shrink-0 w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{settings.currency}</span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      onChange={e => setCatBudgets(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      placeholder="No limit"
                      min="0"
                      className="w-full pl-9 pr-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {budget > 0 && (
                  <p className={`text-xs ${over ? 'text-red-500' : 'text-gray-400'}`}>
                    {over
                      ? `${formatCurrency(Math.abs(remaining), settings.currency)} over budget`
                      : `${formatCurrency(remaining, settings.currency)} remaining`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
