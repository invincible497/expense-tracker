// Default categories with icons and colors
export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Groceries', icon: '🛒', color: '#f59e0b', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'rent', name: 'Rent & Housing', icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f97316', type: 'expense' },
  { id: 'education', name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ef4444', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#eab308', type: 'expense' },
  { id: 'internet', name: 'Internet & Airtime', icon: '📱', color: '#14b8a6', type: 'expense' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6b7280', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: '💼', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#22c55e', type: 'income' },
  { id: 'business', name: 'Business', icon: '📈', color: '#16a34a', type: 'income' },
  { id: 'investment', name: 'Investment', icon: '💰', color: '#15803d', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: '🎁', color: '#4ade80', type: 'income' },
];

export const PAYMENT_METHODS = [
  'Cash',
  'M-Pesa',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cheque',
  'Other',
];

export const CURRENCIES = [
  { code: 'KSh', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX', locale: 'en-UG' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TZS', locale: 'en-TZ' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
];

// Generate a demo dataset of realistic transactions
export function generateSampleTransactions() {
  const now = new Date();
  const transactions = [];

  const expenses = [
    { title: 'Naivas Supermarket', amount: 4850, category: 'food', paymentMethod: 'M-Pesa', desc: 'Weekly groceries' },
    { title: 'Uber Ride', amount: 650, category: 'transport', paymentMethod: 'Cash', desc: 'CBD to Westlands' },
    { title: 'House Rent', amount: 25000, category: 'rent', paymentMethod: 'Bank Transfer', desc: 'November rent' },
    { title: 'Netflix', amount: 1300, category: 'entertainment', paymentMethod: 'Credit Card', desc: 'Monthly subscription' },
    { title: 'Zara Shopping', amount: 7500, category: 'shopping', paymentMethod: 'Credit Card', desc: 'Clothes' },
    { title: 'Coursera Course', amount: 2200, category: 'education', paymentMethod: 'M-Pesa', desc: 'Data Science course' },
    { title: 'Pharmacy', amount: 1800, category: 'healthcare', paymentMethod: 'Cash', desc: 'Medicine' },
    { title: 'KPLC Bill', amount: 3200, category: 'utilities', paymentMethod: 'M-Pesa', desc: 'Electricity bill' },
    { title: 'Safaricom Airtime', amount: 500, category: 'internet', paymentMethod: 'M-Pesa', desc: 'Monthly data bundle' },
    { title: 'Java House', amount: 1200, category: 'food', paymentMethod: 'Cash', desc: 'Lunch' },
    { title: 'Matatu Fare', amount: 300, category: 'transport', paymentMethod: 'Cash', desc: 'Daily commute' },
    { title: 'Spotify', amount: 650, category: 'entertainment', paymentMethod: 'Credit Card', desc: 'Music subscription' },
    { title: 'Water Bill', amount: 1500, category: 'utilities', paymentMethod: 'M-Pesa', desc: 'Monthly water' },
    { title: 'Java Groceries', amount: 2300, category: 'food', paymentMethod: 'Cash', desc: 'Fruits and vegetables' },
    { title: 'Fuel', amount: 4000, category: 'transport', paymentMethod: 'Cash', desc: 'Car fuel' },
    { title: 'Gym Membership', amount: 3000, category: 'healthcare', paymentMethod: 'M-Pesa', desc: 'Monthly gym fee' },
    { title: 'Amazon Shopping', amount: 5500, category: 'shopping', paymentMethod: 'Credit Card', desc: 'Electronics accessories' },
  ];

  const incomes = [
    { title: 'Monthly Salary', amount: 85000, category: 'salary', paymentMethod: 'Bank Transfer', desc: 'November salary' },
    { title: 'Freelance Project', amount: 25000, category: 'freelance', paymentMethod: 'M-Pesa', desc: 'Web dev project' },
    { title: 'Side Business', amount: 12000, category: 'business', paymentMethod: 'M-Pesa', desc: 'Online store earnings' },
    { title: 'Dividends', amount: 5000, category: 'investment', paymentMethod: 'Bank Transfer', desc: 'Stock dividends' },
    { title: 'Consultation Fee', amount: 8000, category: 'freelance', paymentMethod: 'M-Pesa', desc: 'IT consultation' },
  ];

  // Spread over last 60 days
  let id = 1;
  for (let i = 0; i < 60; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    if (i % 30 === 0 || i === 1) {
      // Add salary at start of month
      const inc = incomes[0];
      transactions.push({
        id: `demo-${id++}`,
        title: inc.title,
        amount: inc.amount,
        type: 'income',
        category: inc.category,
        date: date.toISOString().split('T')[0],
        paymentMethod: inc.paymentMethod,
        description: inc.desc,
        createdAt: date.toISOString(),
      });
    }

    if (i % 15 === 0) {
      const inc = incomes[1 + (i % (incomes.length - 1))];
      transactions.push({
        id: `demo-${id++}`,
        title: inc.title,
        amount: inc.amount,
        type: 'income',
        category: inc.category,
        date: date.toISOString().split('T')[0],
        paymentMethod: inc.paymentMethod,
        description: inc.desc,
        createdAt: date.toISOString(),
      });
    }

    // Add 1-3 expenses per day
    const numExpenses = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numExpenses; j++) {
      const exp = expenses[Math.floor(Math.random() * expenses.length)];
      const variation = 0.8 + Math.random() * 0.4;
      transactions.push({
        id: `demo-${id++}`,
        title: exp.title,
        amount: Math.round(exp.amount * variation),
        type: 'expense',
        category: exp.category,
        date: date.toISOString().split('T')[0],
        paymentMethod: exp.paymentMethod,
        description: exp.desc,
        createdAt: date.toISOString(),
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}
