import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PAYMENT_METHODS } from '../../data/constants';

const EMPTY_FORM = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'food',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'M-Pesa',
  description: '',
};

export default function TransactionModal({ onClose, editTransaction = null }) {
  const { addTransaction, updateTransaction, categories, addNotification } = useApp();
  const [form, setForm] = useState(() => {
    if (editTransaction) {
      return {
        title: editTransaction.title,
        amount: String(editTransaction.amount),
        type: editTransaction.type,
        category: editTransaction.category,
        date: editTransaction.date,
        paymentMethod: editTransaction.paymentMethod || 'Cash',
        description: editTransaction.description || '',
      };
    }
    return EMPTY_FORM;
  });
  const [errors, setErrors] = useState({});

  const expenseCategories = categories.filter(c => c.type === 'expense' || !c.type);
  const incomeCategories = categories.filter(c => c.type === 'income');
  const currentCategories = form.type === 'income' ? incomeCategories : expenseCategories;

  // Reset category when type changes
  useEffect(() => {
    if (form.type === 'income' && !incomeCategories.find(c => c.id === form.category)) {
      setForm(f => ({ ...f, category: incomeCategories[0]?.id || 'salary' }));
    } else if (form.type === 'expense' && !expenseCategories.find(c => c.id === form.category)) {
      setForm(f => ({ ...f, category: expenseCategories[0]?.id || 'food' }));
    }
  }, [form.type]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...form,
      amount: Number(form.amount),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
            <button
              type="button"
              onClick={() => handleChange('type', 'expense')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                form.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'income')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                form.type === 'income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              Income
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transaction Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="e.g. Naivas Supermarket"
              className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.title ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => handleChange('amount', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.amount ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'
              }`}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  errors.date ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              >
                {currentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={e => handleChange('paymentMethod', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={16} />
              {editTransaction ? 'Update' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
