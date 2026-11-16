import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, groupByMonth } from '../../utils/helpers';

const RADIAN = Math.PI / 180;

function tooltipStyle(isDark) {
  return {
    background: isDark ? '#1e293b' : 'white',
    border: 'none',
    borderRadius: '12px',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.12)',
    fontSize: 13,
    color: isDark ? '#e2e8f0' : '#1e293b',
  };
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function IncomeExpenseChart() {
  const { transactions, settings } = useApp();
  const isDark = settings.darkMode;

  const data = useMemo(() => {
    const months = groupByMonth(transactions).slice(-6);
    return months.map(m => ({
      name: m.label,
      Income: m.income,
      Expenses: m.expenses,
    }));
  }, [transactions]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={20} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          formatter={(value) => formatCurrency(value, settings.currency)}
          contentStyle={tooltipStyle(isDark)}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Expenses" fill="#f97316" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpensePieChart() {
  const { transactions, categories, settings } = useApp();
  const isDark = settings.darkMode;

  const data = useMemo(() => {
    const now = new Date();
    const spending = {};
    transactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        const d = new Date(tx.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .forEach(tx => {
        spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
      });

    return Object.entries(spending)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId) || { name: catId, color: '#6b7280' };
        return { name: cat.name, value, color: cat.color };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No expense data this month</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={CustomLabel}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value, settings.currency)}
          contentStyle={tooltipStyle(isDark)}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: 12, color: '#94a3b8' }}>{value}</span>}
          wrapperStyle={{ paddingTop: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SpendingTrendChart({ data, height = 220 }) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center text-gray-400" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No spending data</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          formatter={(value) => formatCurrency(value, settings.currency)}
          contentStyle={tooltipStyle(isDark)}
          cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 2' }}
        />
        <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SavingsTrendChart() {
  const { transactions, settings } = useApp();
  const isDark = settings.darkMode;

  const data = useMemo(() => {
    return groupByMonth(transactions).slice(-6).map(m => ({
      name: m.label,
      Savings: Math.max(0, m.income - m.expenses),
      Income: m.income,
      Expenses: m.expenses,
    }));
  }, [transactions]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          formatter={(v) => formatCurrency(v, settings.currency)}
          contentStyle={tooltipStyle(isDark)}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area type="monotone" dataKey="Savings" stroke="#10b981" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
        <Area type="monotone" dataKey="Income" stroke="#3b82f6" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="5 3" />
        <Area type="monotone" dataKey="Expenses" stroke="#f97316" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="5 3" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
