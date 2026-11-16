import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_CATEGORIES, generateSampleTransactions } from '../data/constants';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_tracker_transactions',
  BUDGETS: 'expense_tracker_budgets',
  CATEGORIES: 'expense_tracker_categories',
  SETTINGS: 'expense_tracker_settings',
};

function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, null);
    if (stored === null) {
      const sample = generateSampleTransactions();
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, sample);
      return sample;
    }
    return stored;
  });

  const [budgets, setBudgets] = useState(() =>
    loadFromStorage(STORAGE_KEYS.BUDGETS, {
      overall: 150000,
      categories: {
        food: 15000,
        transport: 8000,
        rent: 30000,
        entertainment: 5000,
        shopping: 10000,
        education: 5000,
        healthcare: 8000,
        utilities: 6000,
        internet: 2000,
        other: 5000,
      },
    })
  );

  const [categories, setCategories] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );

  const [settings, setSettings] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, {
      displayName: 'User',
      currency: 'KSh',
      darkMode: false,
    })
  );

  const [notifications, setNotifications] = useState([]);

  // Persist to localStorage
  useEffect(() => { saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BUDGETS, budgets); }, [budgets]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CATEGORIES, categories); }, [categories]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Apply dark mode on init
  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
  }, []);

  // Notifications
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Transaction CRUD
  const addTransaction = useCallback((transaction) => {
    const newTx = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification('Transaction added successfully!');
    return newTx;
  }, [addNotification]);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx)
    );
    addNotification('Transaction updated successfully!');
  }, [addNotification]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    addNotification('Transaction deleted.', 'info');
  }, [addNotification]);

  // Budget CRUD
  const updateBudget = useCallback((updates) => {
    setBudgets(prev => ({ ...prev, ...updates }));
    addNotification('Budget updated successfully!');
  }, [addNotification]);

  const updateCategoryBudget = useCallback((categoryId, amount) => {
    setBudgets(prev => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: Number(amount) },
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Category management
  const addCategory = useCallback((category) => {
    const newCat = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
    addNotification('Category added successfully!');
    return newCat;
  }, [addNotification]);

  const updateCategory = useCallback((id, updates) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addNotification('Category updated!');
  }, [addNotification]);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addNotification('Category deleted.', 'info');
  }, [addNotification]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets({
      overall: 150000,
      categories: {},
    });
    setCategories(DEFAULT_CATEGORIES);
    addNotification('All data cleared.', 'info');
  }, [addNotification]);

  // Statistics helpers
  const getMonthlyStats = useCallback((month, year) => {
    const filtered = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses, transactions: filtered };
  }, [transactions]);

  const getTotalBalance = useCallback(() => {
    return transactions.reduce((acc, tx) =>
      tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0
    );
  }, [transactions]);

  const getCategorySpending = useCallback((month, year) => {
    return transactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        const d = new Date(tx.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});
  }, [transactions]);

  const value = {
    transactions,
    budgets,
    categories,
    settings,
    notifications,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    updateCategoryBudget,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    clearAllData,
    getMonthlyStats,
    getTotalBalance,
    getCategorySpending,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
