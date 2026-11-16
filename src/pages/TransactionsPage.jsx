import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, exportToCSV } from '../utils/helpers';
import TransactionList from '../components/transactions/TransactionList';
import TransactionModal from '../components/transactions/TransactionModal';

export default function TransactionsPage() {
  const { transactions, settings } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance    = totalIncome - totalExpenses;

  function handleExport() {
    exportToCSV(transactions, 'all-transactions');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {transactions.length} total transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-emerald-500 tracking-tight">{formatCurrency(totalIncome, settings.currency)}</p>
          <p className="text-xs text-gray-400 mt-1">{transactions.filter(t => t.type === 'income').length} transactions</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500 tracking-tight">{formatCurrency(totalExpenses, settings.currency)}</p>
          <p className="text-xs text-gray-400 mt-1">{transactions.filter(t => t.type === 'expense').length} transactions</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Net Balance</p>
          <p className={`text-2xl font-bold tracking-tight ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(Math.abs(netBalance), settings.currency)}
          </p>
          <p className={`text-xs mt-1 ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <TransactionList showFilters={true} />

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
