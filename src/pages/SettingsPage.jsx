import { useState } from 'react';
import { Save, Trash2, Plus, Moon, Sun, User, DollarSign, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../data/constants';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const EMOJI_OPTIONS = ['🛒', '🚗', '🏠', '🎬', '🛍️', '📚', '🏥', '💡', '📱', '📦', '💼', '💻', '📈', '💰', '🎁', '🍔', '✈️', '🎮', '🏋️', '🐾', '🎵', '🌐', '🧾', '🏦', '💊'];
const COLOR_OPTIONS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#f59e0b', '#06b6d4', '#14b8a6', '#ef4444', '#6b7280', '#22c55e', '#84cc16'];

function Section({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-emerald-500">{icon}</span>
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const {
    settings, updateSettings,
    categories, addCategory, deleteCategory,
    clearAllData, addNotification
  } = useApp();

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: '#6b7280', type: 'expense' });
  const [deleteCatId, setDeleteCatId] = useState(null);

  function saveProfile() {
    updateSettings({ displayName });
    addNotification('Profile updated!');
  }

  function handleClearData() {
    clearAllData();
    setConfirmClear(false);
  }

  function handleAddCategory() {
    if (!newCat.name.trim()) {
      addNotification('Category name is required', 'error');
      return;
    }
    addCategory(newCat);
    setNewCat({ name: '', icon: '📦', color: '#6b7280', type: 'expense' });
    setShowAddCat(false);
  }

  const customCategories = categories.filter(c => c.id.startsWith('cat-'));
  const defaultCategories = categories.filter(c => !c.id.startsWith('cat-'));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your preferences and application data</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={<User size={18} />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your name"
              />
              <button
                onClick={saveProfile}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Save size={15} />
                Save
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Currency */}
      <Section title="Currency & Display" icon={<DollarSign size={18} />}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Currency</label>
          <select
            value={settings.currency}
            onChange={e => updateSettings({ currency: e.target.value })}
            className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1.5">Default: KSh (Kenyan Shilling)</p>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Expense Categories" icon={<Tag size={18} />}>
        <div className="space-y-3">
          {/* Default categories (read only) */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Default Categories</p>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map(cat => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: cat.color + '22', color: cat.color }}
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Custom categories */}
          {customCategories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-4">Custom Categories</p>
              <div className="space-y-2">
                {customCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
                    <span
                      className="inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: cat.color }}
                    >
                      {cat.icon} {cat.name}
                      <span className="text-xs text-gray-400 normal-case">({cat.type})</span>
                    </span>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom category */}
          {showAddCat ? (
            <div className="border border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-4 mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={newCat.name}
                    onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                    placeholder="Category name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
                  <select
                    value={newCat.type}
                    onChange={e => setNewCat(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewCat(p => ({ ...p, icon: e }))}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${newCat.icon === e ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCat(p => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform ${newCat.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddCat(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCat(true)}
              className="mt-3 flex items-center gap-2 text-emerald-500 hover:text-emerald-600 text-sm font-medium"
            >
              <Plus size={15} />
              Add Custom Category
            </button>
          )}
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={<Trash2 size={18} />}>
        <div className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">Clear All Data</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-0.5">
              Permanently removes all transactions, budgets, and custom categories.
              This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            Clear Data
          </button>
        </div>
      </Section>

      {/* Confirm Dialogs */}
      {confirmClear && (
        <ConfirmDialog
          title="Clear All Data"
          message="This will permanently delete all your transactions, budgets, and custom categories. This action cannot be undone. Are you sure?"
          confirmLabel="Yes, Clear Everything"
          onConfirm={handleClearData}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      {deleteCatId && (
        <ConfirmDialog
          title="Delete Category"
          message="Are you sure you want to delete this category? Existing transactions using it will not be affected."
          onConfirm={() => { deleteCategory(deleteCatId); setDeleteCatId(null); }}
          onCancel={() => setDeleteCatId(null)}
        />
      )}
    </div>
  );
}
