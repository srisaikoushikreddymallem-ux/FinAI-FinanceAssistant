import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../services/api';

function EditTransaction({ transaction, onClose, onTransactionUpdated }) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    transaction_type: transaction.transaction_type,
    category: transaction.category,
    description: transaction.description || '',
    transaction_date: transaction.transaction_date
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiRequest(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          description: formData.description.trim() || null
        })
      });

      onTransactionUpdated();
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Edit Transaction
          </h2>

          <button onClick={onClose} type="button">
            <X size={22} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Transaction Type
            </label>

            <select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount (₹)
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              minLength="2"
              maxLength="100"
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength="255"
              rows="3"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Transaction Date
            </label>

            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-5 py-3 font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Transaction'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditTransaction;