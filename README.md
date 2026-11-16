# FinTrack — Personal Expense Tracker Web Application

FinTrack is a modern, responsive, and full-featured Personal Expense Tracker built with React, Vite, Tailwind CSS, Recharts, and Lucide Icons.

---

## 🚀 Features

- **Executive Dashboard**
  - Live Total Balance, Monthly Income, Monthly Expenses, and Remaining Budget metrics.
  - Interactive Income vs. Expenses comparison chart (last 6 months).
  - Monthly Expense Breakdown by category using doughnut / pie charts.
  - Daily spending activity visualization (last 14 days).
  - Budget utilization tracking with real-time progress bars.
  - Quick summary cards for Monthly Savings, Transaction counts, and highest expense days.
  - Recent transactions overview with direct deep-links.

- **Transaction Management**
  - Add new Income and Expenses with title, amount, category, date, payment method, and description.
  - Inline edit and delete capabilities with confirmation modals.
  - Full-text search and advanced multi-filter controls (Type, Category, Date range).
  - Multi-criteria sorting (Date ascending/descending, Amount ascending/descending).
  - Category icon and color tags.

- **Budget Management**
  - Set an overall monthly spending ceiling.
  - Set category-specific monthly spending budgets.
  - Real-time progress bars with dynamic warning/alert states (Safe, Approaching 80%, Over budget).
  - Prominent budget alert banners when limits are breached.

- **Reports & Analytics**
  - Multi-window date ranges: This Month, Last 3 Months, Last 6 Months, This Year, All Time.
  - Savings trend area charts tracking net wealth over time.
  - Weekly spending activity trends.
  - Category expense breakdown with vertical ranking charts and percentage distribution bars.
  - One-click **Export to CSV** for transactions and reports.

- **Customization & Settings**
  - Personalized Display Name.
  - Multi-currency support: Default **Kenyan Shilling (KSh)**, plus USD ($), EUR (€), GBP (£), UGX, TZS, ZAR, NGN.
  - System-wide Dark Mode / Light Mode with seamless theme transition.
  - Predefined and Custom Expense & Income Categories with an emoji icon selector and custom color palette.
  - Safe data management with confirmation prompts to reset/clear data.

- **Persistence & First-time Experience**
  - Automatic `localStorage` persistence across all sessions.
  - Includes realistic demo transactions spanning 60 days on initial launch.
  - Seamless responsive experience with desktop collapsible dark sidebar and mobile bottom navigation bar.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, React Router 7
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Storage:** HTML5 LocalStorage

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

```bash
cd "c:\xampp\htdocs\expense tracker"
npm install
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build

```bash
npm run build
```

The production assets will be output to the `dist/` folder.
