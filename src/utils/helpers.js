import { CURRENCIES } from '../data/constants';

export function formatCurrency(amount, currencyCode = 'KSh') {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const absAmount = Math.abs(amount);
  
  // Format with commas and 2 decimal places
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return `${currency.symbol} ${formatted}`;
}

export function formatDate(dateString, format = 'medium') {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
  };

  return date.toLocaleDateString('en-KE', options[format] || options.medium);
}

export function getMonthName(monthIndex) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
}

export function getFullMonthName(monthIndex) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
}

export function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

export function groupByMonth(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!groups[key]) {
      groups[key] = {
        label: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
        month: date.getMonth(),
        year: date.getFullYear(),
        income: 0,
        expenses: 0,
        transactions: [],
      };
    }
    groups[key].transactions.push(tx);
    if (tx.type === 'income') groups[key].income += tx.amount;
    else groups[key].expenses += tx.amount;
  });
  return Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

export function getWeeklySpending(transactions, weeksBack = 8) {
  const weeks = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const weekTx = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= weekStart && d <= weekEnd && tx.type === 'expense';
    });

    const total = weekTx.reduce((s, t) => s + t.amount, 0);
    weeks.push({
      label: `W${weeksBack - i}`,
      week: `${weekStart.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`,
      amount: total,
    });
  }
  return weeks;
}

export function getDailySpending(transactions, daysBack = 14) {
  const days = [];
  const now = new Date();

  for (let i = daysBack - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dateStr = day.toISOString().split('T')[0];

    const dayTx = transactions.filter(tx => tx.date === dateStr && tx.type === 'expense');
    const total = dayTx.reduce((s, t) => s + t.amount, 0);

    days.push({
      date: dateStr,
      label: day.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      amount: total,
    });
  }
  return days;
}

export function truncateText(text, maxLength = 30) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function exportToCSV(transactions, filename = 'transactions') {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'];
  const rows = transactions.map(tx => [
    tx.date,
    `"${tx.title}"`,
    tx.type,
    tx.category,
    tx.amount,
    tx.paymentMethod || '',
    `"${tx.description || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
