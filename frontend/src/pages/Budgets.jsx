
import React, { useState, useEffect } from 'react';

import {
  Plus,
  TrendingUp,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import AddBudget from '../components/AddBudget';
import EditBudget from '../components/EditBudget';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

function Budgets() {
  const today = new Date();

  const [budgets, setBudgets] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const { formatCurrency } = useCurrency();

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  // Fetch all budgets
  const fetchBudgets = async () => {
    try {
      const data = await apiRequest('/api/budgets/');
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Fetch budget summary for selected month
  const fetchBudgetSummary = async () => {
    try {
      const data = await apiRequest(
        `/api/budgets/summary?month=${month}&year=${year}`
      );
      setBudgetSummary(data);
    } catch (error) {
      console.error('Error fetching budget summary:', error);
    }
  };

  // Refresh both budgets and summary
  const refreshData = async () => {
    setLoading(true);

    await Promise.all([
      fetchBudgets(),
      fetchBudgetSummary()
    ]);

    setLoading(false);
  };

  // Delete budget
  const handleDeleteBudget = async (budgetId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this budget?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/api/budgets/${budgetId}`, {
        method: 'DELETE'
      });

      await refreshData();

    } catch (error) {
      alert(error.message);
    }
  };

  // Load data when page opens or month/year changes
  useEffect(() => {
    refreshData();
  }, [month, year]);

  // Calculate totals
  const totalBudget = budgetSummary.reduce(
    (total, item) => total + Number(item.budget_amount),
    0
  );

  const totalSpent = budgetSummary.reduce(
    (total, item) => total + Number(item.spent_amount),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="min-w-0 flex-1 p-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Budgets
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Plan and manage your monthly spending limits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddBudget(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={19} />
            Create Budget
          </button>

        </div>

        {/* Month and Year Filters */}
        <div className="mb-6 flex flex-wrap gap-4">

          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border bg-white px-4 py-3 text-slate-600 outline-none"
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
            className="rounded-lg border bg-white px-4 py-3 text-slate-600 outline-none"
          >
            {[
              today.getFullYear() - 1,
              today.getFullYear(),
              today.getFullYear() + 1
            ].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

        </div>

        {loading ? (
          <div className="rounded-xl bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
            Loading budgets...
          </div>
        ) : (
          <>

            {/* Budget Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Budget
                </p>

                <h2 className="mt-2 text-2xl font-bold text-blue-600">
                  {formatCurrency(totalBudget)}
                </h2>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Spent
                </p>

                <h2 className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(totalSpent)}
                </h2>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Remaining Budget
                </p>

                <h2 className={`mt-2 text-2xl font-bold ${
                  totalRemaining < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(totalRemaining)}
                </h2>
              </div>

            </div>

            {/* Category Budget Progress */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                Budget Progress
              </h2>

              {budgetSummary.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No budgets found for this month. Create a budget to get started.
                </p>
              ) : (
                <div className="space-y-6">

                  {budgetSummary.map((item) => {
                    const percentage = Number(item.percentage_used);
                    const progress = Math.min(Math.max(percentage, 0), 100);

                    return (
                      <div key={item.category}>

                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                          <div>
                            <h3 className="font-semibold text-slate-700">
                              {item.category}
                            </h3>

                            <p className="text-xs text-slate-500">
                              {formatCurrency(item.spent_amount)}
                              {' spent of '}
                              {formatCurrency(item.budget_amount)}
                            </p>
                          </div>

                          <div className="text-right">

                            <p className={`font-semibold ${
                              item.over_budget ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {percentage.toFixed(1)}%
                            </p>

                            {item.over_budget && (
                              <p className="flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle size={13} />
                                Over budget
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.over_budget ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">

                          <span>
                            Remaining: {formatCurrency(item.remaining_amount)}
                          </span>

                          {item.over_budget && (
                            <span className="font-medium text-red-600">
                              <TrendingUp size={13} className="inline" /> Overspending
                            </span>
                          )}

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>

            {/* All Budgets */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                All Budgets
              </h2>

              {budgets.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No budgets created yet.
                </p>
              ) : (
                <div className="space-y-3">

                  {budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {budget.category}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {months[budget.month - 1]} {budget.year}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">

                        <p className="font-semibold text-slate-800">
                          {formatCurrency(budget.amount)}
                        </p>

                        {/* Edit Budget */}
                        <button
                          type="button"
                          onClick={() => setSelectedBudget(budget)}
                          className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                          title="Edit budget"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Delete Budget */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Delete budget"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </>
        )}

      </main>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <AddBudget
          onClose={() => setShowAddBudget(false)}
          onBudgetAdded={refreshData}
        />
      )}

      {/* Edit Budget Modal */}
      {selectedBudget && (
        <EditBudget
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
          onBudgetUpdated={refreshData}
        />
      )}

    </div>
  );
}

export default Budgets;
