
import React, { useState, useEffect } from 'react';

import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BrainCircuit
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

const COLORS = [
  '#6366f1',
  '#14b8a6',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16'
];

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

function Analytics() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Overall expense forecasting states
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastError, setForecastError] = useState('');

  // Category-wise forecasting states
  const [categoryForecast, setCategoryForecast] = useState(null);
  const [categoryForecastLoading, setCategoryForecastLoading] = useState(true);
  const [categoryForecastError, setCategoryForecastError] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { formatCurrency } = useCurrency();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryResult, monthlyResult, categoryResult] =
        await Promise.all([
          apiRequest(
            `/api/dashboard/summary?month=${month}&year=${year}`
          ),

          apiRequest(
            `/api/dashboard/monthly-analytics?year=${year}`
          ),

          apiRequest(
            `/api/dashboard/category-expenses?month=${month}&year=${year}`
          )
        ]);

      setSummary(summaryResult);

      setMonthlyData(
        monthlyResult.map((item) => ({
          ...item,
          monthName: months[item.month - 1],
          income: Number(item.total_income),
          expenses: Number(item.total_expenses)
        }))
      );

      setCategoryData(
        categoryResult.map((item) => ({
          ...item,
          total_expenses: Number(item.total_expenses)
        }))
      );

    } catch (err) {
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch overall expense forecast
  const fetchForecast = async () => {
    setForecastLoading(true);
    setForecastError('');

    try {
      const result = await apiRequest('/api/forecast/monthly');

      setForecast(result);

    } catch (err) {
      setForecastError(
        err.message || 'Unable to load expense forecast.'
      );
    } finally {
      setForecastLoading(false);
    }
  };

  // Fetch category-wise expense forecast
  const fetchCategoryForecast = async () => {
    setCategoryForecastLoading(true);
    setCategoryForecastError('');

    try {
      const result = await apiRequest('/api/forecast/category-wise');

      setCategoryForecast(result);

    } catch (err) {
      setCategoryForecastError(
        err.message || 'Unable to load category-wise forecast.'
      );
    } finally {
      setCategoryForecastLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [month, year]);

  useEffect(() => {
    fetchForecast();
    fetchCategoryForecast();
  }, []);



  const totalIncome = Number(summary?.total_income || 0);
  const totalExpenses = Number(summary?.total_expenses || 0);
  const savings = totalIncome - totalExpenses;

  const cards = [
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600',
      background: 'bg-emerald-50'
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: TrendingDown,
      color: 'text-rose-600',
      background: 'bg-rose-50'
    },
    {
      title: 'Net Savings',
      amount: savings,
      icon: PiggyBank,
      color: savings >= 0 ? 'text-blue-600' : 'text-rose-600',
      background: 'bg-blue-50'
    },
    {
      title: 'Transactions',
      amount: summary?.transaction_count || 0,
      icon: Wallet,
      color: 'text-violet-600',
      background: 'bg-violet-50',
      isCount: true
    }
  ];

  // Overall forecast chart data
  const forecastChartData = forecast
    ? [
        ...forecast.historical_data.map((item) => ({
          monthName: `${months[item.month - 1].slice(0, 3)} ${item.year}`,
          actual: Number(item.actual_expenses),
          predicted: null
        })),
        {
          monthName: `${months[forecast.prediction_month - 1].slice(0, 3)} ${forecast.prediction_year}`,
          actual: null,
          predicted: Number(forecast.predicted_amount)
        }
      ]
    : [];

  // Category forecast chart data
  const categoryForecastChartData = categoryForecast?.categories
    ? categoryForecast.categories.map((item) => ({
        category: item.category,
        predicted: Number(item.predicted_amount)
      }))
    : [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand your income, expenses and savings patterns.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
            >
              {months.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
            >
              {[
                today.getFullYear(),
                today.getFullYear() - 1,
                today.getFullYear() - 2
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading analytics...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center text-rose-600 shadow-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Summary Cards */}

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {card.title}
                      </p>

                      <div className={`rounded-lg p-2 ${card.background}`}>
                        <Icon size={20} className={card.color} />
                      </div>
                    </div>

                    <h2 className={`mt-4 text-2xl font-bold ${card.color}`}>
                      {card.isCount
                        ? card.amount
                        : formatCurrency(card.amount)}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {months[month - 1]} {year}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Overall Monthly Expense Forecast */}

            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-3">
                  <BrainCircuit className="text-purple-600" size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Monthly Expense Forecast
                  </h2>

                  <p className="text-sm text-slate-500">
                    ML-powered prediction of your upcoming expenses.
                  </p>
                </div>
              </div>

              {forecastLoading ? (
                <p className="py-12 text-center text-slate-500">
                  Generating expense forecast...
                </p>
              ) : forecastError ? (
                <div className="rounded-lg bg-amber-50 p-5 text-sm text-amber-700">
                  Forecast unavailable: {forecastError}
                </div>
              ) : forecast ? (
                <>
                  <div className="mb-6 rounded-xl bg-purple-50 p-5">
                    <p className="text-sm font-medium text-purple-700">
                      Predicted Expenses for{' '}
                      {months[forecast.prediction_month - 1]}{' '}
                      {forecast.prediction_year}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-purple-800">
                      {formatCurrency(forecast.predicted_amount)}
                    </h3>

                    <p className="mt-2 text-xs text-purple-600">
                      Forecasting method:{' '}
                      {forecast.model_version === 'linear_regression_v1'
                        ? 'Linear Regression'
                        : 'Historical Average'}
                    </p>
                  </div>

                  <h3 className="mb-2 font-semibold text-slate-800">
                    Historical Expenses vs Forecast
                  </h3>

                  <p className="mb-5 text-sm text-slate-500">
                    Actual monthly expenses compared with the predicted amount.
                  </p>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={forecastChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />

                      <Bar
                        dataKey="actual"
                        name="Actual Expenses"
                        fill="#6366f1"
                        radius={[5, 5, 0, 0]}
                      />

                      <Bar
                        dataKey="predicted"
                        name="Predicted Expenses"
                        fill="#f59e0b"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <p className="mt-4 text-xs text-slate-400">
                    This is an estimate based on historical spending.
                    Actual expenses may differ.
                  </p>
                </>
              ) : null}
            </div>

            {/* Category-wise Expense Forecast */}

            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-3">
                  <BrainCircuit className="text-indigo-600" size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Category-wise Expense Forecast
                  </h2>

                  <p className="text-sm text-slate-500">
                    Predicted expenses for each spending category in the upcoming month.
                  </p>
                </div>
              </div>

              {categoryForecastLoading ? (
                <p className="py-12 text-center text-slate-500">
                  Generating category-wise forecasts...
                </p>
              ) : categoryForecastError ? (
                <div className="rounded-lg bg-amber-50 p-5 text-sm text-amber-700">
                  Category forecast unavailable: {categoryForecastError}
                </div>
              ) : categoryForecast?.categories?.length > 0 ? (
                <>
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-indigo-50 p-5">
                      <p className="text-sm font-medium text-indigo-700">
                        Forecast Month
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-indigo-800">
                        {months[categoryForecast.prediction_month - 1]}{' '}
                        {categoryForecast.prediction_year}
                      </h3>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-5">
                      <p className="text-sm font-medium text-emerald-700">
                        Total Predicted Expenses
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-emerald-800">
                        {formatCurrency(categoryForecast.total_predicted_expenses)}
                      </h3>
                    </div>
                  </div>

                  <h3 className="mb-4 font-semibold text-slate-800">
                    Predicted Expenses by Category
                  </h3>

                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={categoryForecastChartData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />

                      <Bar
                        dataKey="predicted"
                        name="Predicted Expenses"
                        radius={[5, 5, 0, 0]}
                      >
                        {categoryForecastChartData.map((item, index) => (
                          <Cell
                            key={item.category}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryForecast.categories.map((item, index) => (
                      <div
                        key={item.category}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />

                          <p className="font-medium text-slate-700">
                            {item.category}
                          </p>
                        </div>

                        <h3 className="mt-3 text-xl font-bold text-slate-800">
                          {formatCurrency(item.predicted_amount)}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.model_version === 'linear_regression_v1'
                            ? 'Linear Regression'
                            : 'Historical Average'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-xs text-slate-400">
                    Category forecasts are estimates based on each category's
                    available historical expenses. Categories with limited
                    history may use a historical average.
                  </p>
                </>
              ) : (
                <p className="py-12 text-center text-slate-400">
                  No completed historical category expenses available for forecasting.
                </p>
              )}
            </div>

            {/* Monthly Income vs Expenses */}

            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">
                Monthly Income vs Expenses
              </h2>

              <p className="mb-6 text-sm text-slate-500">
                Your financial activity throughout {year}.
              </p>

              {monthlyData.length === 0 ? (
                <p className="py-16 text-center text-slate-400">
                  No monthly data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthName" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#f43f5e"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Analytics */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                  Expense Distribution
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Spending breakdown by category for {months[month - 1]}.
                </p>

                {categoryData.length === 0 ? (
                  <p className="py-16 text-center text-slate-400">
                    No expenses recorded for this month.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="total_expenses"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((item, index) => (
                          <Cell
                            key={item.category}
                            fill={COLORS[index % COLORS.length]}
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

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-slate-800">
                  Category-wise Expenses
                </h2>

                {categoryData.length === 0 ? (
                  <p className="py-16 text-center text-slate-400">
                    No category expenses to display.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {categoryData.map((item) => (
                      <div key={item.category}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {item.category}
                          </span>

                          <span className="text-sm font-semibold text-slate-800">
                            {formatCurrency(item.total_expenses)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${Math.min(
                                Number(item.percentage || 0),
                                100
                              )}%`
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {Number(item.percentage || 0).toFixed(1)}% of expenses
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Analytics;
