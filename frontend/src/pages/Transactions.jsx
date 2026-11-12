
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import AddTransaction from '../components/AddTransaction';
import EditTransaction from '../components/EditTransaction';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

import {
  Plus,
  Search,
  Trash2,
  Pencil
} from 'lucide-react';

import Sidebar from '../components/Sidebar';

function Transactions() {
  const [searchParams] = useSearchParams();
  const { formatCurrency } = useCurrency();

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Calculate total income
  const totalIncome = transactions
    .filter((transaction) => transaction.transaction_type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  // Calculate total expenses
  const totalExpenses = transactions
    .filter((transaction) => transaction.transaction_type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  // Calculate net balance
  const netBalance = totalIncome - totalExpenses;

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const data = await apiRequest('/api/transactions/');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search and filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      transaction.category.toLowerCase().includes(search) ||
      (transaction.description || '').toLowerCase().includes(search) ||
      transaction.transaction_type.toLowerCase().includes(search);

    const matchesType =
      typeFilter === 'all' ||
      transaction.transaction_type === typeFilter;

    const matchesCategory =
      categoryFilter === 'all' ||
      transaction.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Delete transaction
  const handleDelete = async (transactionId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this transaction?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/api/transactions/${transactionId}`, {
        method: 'DELETE'
      });

      await fetchTransactions();
    } catch (error) {
      alert(error.message);
    }
  };

  // Load transactions when page opens
  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">

      {/* Page Header */}
      <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your income and expenses in one place.
            </p>
          </div>

          <button
            onClick={() => setShowAddTransaction(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            <Plus size={19} />
            Add Transaction
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Income</p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <h2 className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Net Balance</p>
            <h2 className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(netBalance)}
            </h2>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-5 shadow-sm">

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by category, description or type..."
              className="w-full py-3 outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border px-4 py-3 text-slate-600 outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border px-4 py-3 text-slate-600 outline-none"
          >
            <option value="all">All Categories</option>

            {[...new Set(transactions.map((transaction) => transaction.category))].map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>

        </div>


{/* Transactions Table */}
<div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">

  <h2 className="mb-5 text-lg font-semibold text-slate-800">
    All Transactions
  </h2>

  {loading ? (
    <div className="py-12 text-center text-sm text-slate-400">
      Loading transactions...
    </div>
  ) : transactions.length === 0 ? (
    <div className="py-12 text-center text-sm text-slate-400">
      No transactions available. Add your first transaction.
    </div>
  ) : filteredTransactions.length === 0 ? (
    <div className="py-12 text-center text-sm text-slate-400">
      No matching transactions found.
    </div>
  ) : (
    <>
      {/* Mobile Transaction Cards */}
      <div className="space-y-3 md:hidden">
        {filteredTransactions.map((transaction) => (
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

            {/* Mobile Actions */}
            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">

              <button
                type="button"
                onClick={() => setSelectedTransaction(transaction)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(transaction.id)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Desktop Transaction Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-sm text-slate-500">
              <th className="py-3 font-medium">Category</th>
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Type</th>
              <th className="py-3 text-right font-medium">Amount</th>
              <th className="py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
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

                <td className="py-4 text-center">
                  <div className="flex items-center justify-center gap-2">

                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                      title="Edit transaction"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(transaction.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Delete transaction"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
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

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <AddTransaction
          onClose={() => setShowAddTransaction(false)}
          onTransactionAdded={fetchTransactions}
        />
      )}

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransaction
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onTransactionUpdated={fetchTransactions}
        />
      )}

    </div>
  );
}

export default Transactions;
