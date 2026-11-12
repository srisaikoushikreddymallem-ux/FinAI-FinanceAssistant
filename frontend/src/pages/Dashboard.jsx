
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Bell,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  UserCircle,
  LogOut
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

function Dashboard() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [monthlyData, setMonthlyData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  // Profile states
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Fetch the logged-in user's profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await apiRequest('/api/auth/me');
        setCurrentUser(data);
      } catch (err) {
        setProfileError(err.message || 'Unable to load profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch dashboard summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const data = await apiRequest(
          `/api/dashboard/summary?month=${month}&year=${year}`
        );

        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Fetch monthly analytics
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const year = new Date().getFullYear();

        const data = await apiRequest(
          `/api/dashboard/monthly-analytics?year=${year}`
        );

        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr',
          'May', 'Jun', 'Jul', 'Aug',
          'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const formattedData = data.map((item) => ({
          month: monthNames[item.month - 1],
          income: Number(item.total_income),
          expenses: Number(item.total_expenses)
        }));

        setMonthlyData(formattedData);
      } catch (err) {
        console.error('Monthly analytics error:', err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // Fetch category expenses
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const data = await apiRequest(
          `/api/dashboard/category-expenses?month=${month}&year=${year}`
        );

        const formattedData = data.map((item) => ({
          name: item.category,
          value: Number(item.total_expenses)
        }));

        setCategoryData(formattedData);
      } catch (err) {
        console.error('Category analytics error:', err);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const data = await apiRequest(
          '/api/dashboard/recent-transactions?limit=5'
        );

        setRecentTransactions(data);
      } catch (err) {
        console.error('Recent transactions error:', err);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  // Fetch notifications from saved AI insights
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationError('');

    try {
      const data = await apiRequest('/api/insights/');
      setNotifications(data);
    } catch (err) {
      setNotificationError(
        err.message || 'Unable to load notifications.'
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Open notification panel
  const toggleNotifications = () => {
    const shouldOpen = !showNotifications;

    setShowNotifications(shouldOpen);

    if (shouldOpen) {
      fetchNotifications();
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiRequest(`/api/insights/${notificationId}/read`, {
        method: 'PATCH'
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      setNotificationError(
        err.message || 'Unable to mark notification as read.'
      );
    }
  };

  // Navigate to all insights
  const viewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/insights');
  };

  // Toggle profile menu
  const toggleProfile = () => {
    setShowProfile((previous) => !previous);
    setShowNotifications(false);
    setShowSearch(false);
  };

  // Log out the current user
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/', { replace: true });
  };

  // Search transactions
  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      return;
    }

    navigate(
      `/transactions?search=${encodeURIComponent(trimmedSearch)}`
    );
  };


  // Format notification date
  const formatNotificationDate = (value) => {
    if (!value) return 'Recently generated';

    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Notification icon
  const getNotificationIcon = (type) => {
    if (type === 'budget_exceeded') {
      return AlertTriangle;
    }

    if (type === 'budget_warning') {
      return Bell;
    }

    if (
      type === 'expense_increase' ||
      type === 'expense_decrease'
    ) {
      return TrendingUp;
    }

    return Lightbulb;
  };

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const summaryCards = [
    {
      title: 'Total Balance',
      amount: summary ? formatCurrency(summary.balance) : formatCurrency(0),
      change: 'Income minus expenses',
      icon: Wallet,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Income',
      amount: summary ? formatCurrency(summary.total_income) : formatCurrency(0),
      change: 'This month',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total Expenses',
      amount: summary ? formatCurrency(summary.total_expenses) : formatCurrency(0),
      change: 'This month',
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Transactions',
      amount: summary ? summary.transaction_count : '0',
      change: 'This month',
      icon: PiggyBank,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="min-w-0 flex-1 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back! Here's your financial overview.
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowSearch(!showSearch);
                setShowNotifications(false);
              }}
              className="rounded-full bg-white p-3 shadow-sm transition hover:bg-slate-100"
              title="Search transactions"
            >
              {showSearch ? (
                <X size={19} className="text-slate-600" />
              ) : (
                <Search size={19} className="text-slate-600" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">

              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-full bg-white p-3 shadow-sm transition hover:bg-slate-100"
                title="Notifications"
              >
                <Bell size={19} className="text-slate-600" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">

                  <div className="flex items-center justify-between border-b px-4 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Notifications
                      </h3>

                      <p className="text-xs text-slate-500">
                        {unreadCount} unread notifications
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {notificationError && (
                    <p className="px-4 py-3 text-sm text-red-600">
                      {notificationError}
                    </p>
                  )}

                  <div className="max-h-96 overflow-y-auto">

                    {notificationsLoading ? (
                      <p className="p-8 text-center text-sm text-slate-500">
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell
                          size={30}
                          className="mx-auto mb-3 text-slate-300"
                        />

                        <p className="text-sm font-medium text-slate-700">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Generate AI insights to receive financial notifications.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const Icon = getNotificationIcon(
                          item.insight_type
                        );

                        return (
                          <div
                            key={item.id}
                            className={`border-b p-4 transition ${
                              item.is_read
                                ? 'bg-white'
                                : 'bg-blue-50/60'
                            }`}
                          >
                            <div className="flex gap-3">

                              <div className="rounded-lg bg-slate-100 p-2">
                                <Icon
                                  size={18}
                                  className="text-slate-600"
                                />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-slate-800">
                                    {item.title}
                                  </h4>

                                  {!item.is_read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  {item.message}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                  {formatNotificationDate(item.created_at)}
                                </p>

                                {!item.is_read && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      markNotificationAsRead(item.id)
                                    }
                                    className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                )}

                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                  </div>

                  <div className="border-t p-3">
                    <button
                      type="button"
                      onClick={viewAllNotifications}
                      className="w-full rounded-lg py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      View all notifications
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Profile menu */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleProfile}
                className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-sm transition hover:bg-slate-100"
                title="Your profile"
                aria-label="Open profile menu"
                aria-expanded={showProfile}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {currentUser?.name
                    ? currentUser.name.trim().charAt(0).toUpperCase()
                    : 'F'}
                </span>
                <ChevronDown size={16} className="mr-1 text-slate-500" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <UserCircle size={27} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {profileLoading
                            ? 'Loading profile...'
                            : currentUser?.name || 'User'}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {currentUser?.email || (profileLoading ? 'Please wait' : '')}
                        </p>
                      </div>
                    </div>
                    {profileError && (
                      <p className="mt-3 text-xs text-red-600">{profileError}</p>
                    )}
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Loading and Error Messages */}
        {loading && (
          <p className="mb-5 text-sm text-blue-600">
            Loading your financial data...
          </p>
        )}

        {error && (
          <p className="mb-5 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <div className={`rounded-lg p-3 ${card.color}`}>
                    <Icon size={21} />
                  </div>

                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-800">
                  {card.amount}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  {card.change}
                </p>

              </div>
            );
          })}

        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Income vs Expenses */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-800">
              Income vs Expenses
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your monthly financial activity
            </p>

            <div className="mt-6 h-64 w-full">

              {chartLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Loading monthly analytics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Legend />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#16a34a"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

          {/* Expenses by Category */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-800">
              Expenses by Category
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Understand where your money goes
            </p>

            <div className="mt-6 h-64 w-full">

              {categoryLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Loading category expenses...
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No expense data available for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            '#2563eb',
                            '#16a34a',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6',
                            '#06b6d4',
                            '#ec4899'
                          ][index % 7]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

        </div>


{/* Recent Transactions */}
<div className="mt-8 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">

  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-lg font-semibold text-slate-800">
      Recent Transactions
    </h2>

    <button
      type="button"
      onClick={() => navigate('/transactions')}
      className="text-sm font-medium text-blue-600 hover:underline"
    >
      View all
    </button>
  </div>

  {transactionsLoading ? (
    <div className="py-12 text-center text-sm text-slate-400">
      Loading transactions...
    </div>
  ) : recentTransactions.length === 0 ? (
    <div className="py-12 text-center text-sm text-slate-400">
      No transactions found. Start by adding your first transaction.
    </div>
  ) : (
    <>
      {/* Mobile transaction cards */}
      <div className="space-y-3 md:hidden">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="rounded-lg border border-slate-100 p-4"
          >
            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold text-slate-800">
                  {transaction.category}
                </p>

                <p className="mt-1 break-words text-sm text-slate-500">
                  {transaction.description || '-'}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {transaction.transaction_date}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    transaction.transaction_type === 'income'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transaction.transaction_type}
                </span>

                <p
                  className={`mt-3 whitespace-nowrap text-sm font-semibold ${
                    transaction.transaction_type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.transaction_type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Desktop transaction table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-slate-500">
              <th className="py-3 font-medium">Category</th>
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Type</th>
              <th className="py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {recentTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b last:border-0"
              >
                <td className="py-4 font-medium text-slate-700">
                  {transaction.category}
                </td>

                <td className="py-4 text-sm text-slate-500">
                  {transaction.description || '-'}
                </td>

                <td className="py-4 text-sm text-slate-500">
                  {transaction.transaction_date}
                </td>

                <td className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      transaction.transaction_type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.transaction_type}
                  </span>
                </td>

                <td
                  className={`py-4 text-right font-semibold ${
                    transaction.transaction_type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.transaction_type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>


      </main>
    </div>
  );
}

export default Dashboard;
