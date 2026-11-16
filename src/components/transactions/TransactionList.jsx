import { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, truncateText } from '../../utils/helpers';
import ConfirmDialog from '../ui/ConfirmDialog';
import TransactionModal from './TransactionModal';

const SORT_OPTIONS = [
  { label: 'Date (newest)', field: 'date', dir: 'desc' },
  { label: 'Date (oldest)', field: 'date', dir: 'asc' },
  { label: 'Amount (highest)', field: 'amount', dir: 'desc' },
  { label: 'Amount (lowest)', field: 'amount', dir: 'asc' },
];

export default function TransactionList({ limitRows = null, showFilters = true }) {
  const { transactions, categories, settings, deleteTransaction } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [deleteId, setDeleteId] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const filtered = useMemo(() => {
    let result = transactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) ||
        (tx.description || '').toLowerCase().includes(q)
      );
    }

    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    if (filterCategory !== 'all') {
      result = result.filter(tx => tx.category === filterCategory);
    }

    if (filterDateFrom) {
      result = result.filter(tx => tx.date >= filterDateFrom);
    }

    if (filterDateTo) {
      result = result.filter(tx => tx.date <= filterDateTo);
    }

    result = [...result].sort((a, b) => {
      let va = sort.field === 'date' ? a.date : a.amount;
      let vb = sort.field === 'date' ? b.date : b.amount;
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    if (limitRows) result = result.slice(0, limitRows);

    return result;
  }, [transactions, search, filterType, filterCategory, filterDateFrom, filterDateTo, sort, limitRows]);

  function getCategoryInfo(categoryId) {
    return categories.find(c => c.id === categoryId) || { name: categoryId, icon: '📦', color: '#6b7280' };
  }

  function handleDeleteConfirm() {
    deleteTransaction(deleteId);
    setDeleteId(null);
  }

  function clearFilters() {
    setSearch('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  const hasActiveFilters = search || filterType !== 'all' || filterCategory !== 'all' || filterDateFrom || filterDateTo;

  return (
    <>
      {showFilters && (
        <div className="space-y-3 mb-4">
          {/* Search + controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Sort */}
            <select
              value={`${sort.field}-${sort.dir}`}
              onChange={e => {
                const [field, dir] = e.target.value.split('-');
                setSort({ field, dir, label: '' });
              }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SORT_OPTIONS.map(s => (
                <option key={`${s.field}-${s.dir}`} value={`${s.field}-${s.dir}`}>{s.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFiltersPanel(p => !p)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFiltersPanel || hasActiveFilters
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter size={15} />
              Filters {hasActiveFilters ? '•' : ''}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Extended filters */}
          {showFiltersPanel && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-gray-700 dark:text-gray-300 font-semibold text-lg">No transactions found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding your first transaction'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {filtered.map(tx => {
                  const cat = getCategoryInfo(tx.category);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ backgroundColor: cat.color + '22', border: `1px solid ${cat.color}44` }}
                          >
                            {cat.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{tx.title}</p>
                            {tx.description && (
                              <p className="text-xs text-gray-400 mt-0.5">{truncateText(tx.description, 35)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: cat.color + '22', color: cat.color }}
                        >
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                        {tx.paymentMethod || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(tx.date, 'short')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount, settings.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTx(tx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(tx.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Edit Modal */}
      {editTx && (
        <TransactionModal editTransaction={editTx} onClose={() => setEditTx(null)} />
      )}
    </>
  );
}
