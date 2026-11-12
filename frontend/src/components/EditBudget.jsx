
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../services/api';

function EditBudget({ budget, onClose, onBudgetUpdated }) {
  const [formData, setFormData] = useState({
    category: budget.category,
    amount: budget.amount,
    month: budget.month,
    year: budget.year
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

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
      await apiRequest(`/api/budgets/${budget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          month: Number(formData.month),
          year: Number(formData.year)
        })
      });

      await onBudgetUpdated();
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
            Edit Budget
          </h2>

          <button type="button" onClick={onClose}>
            <X size={22} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

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
              Monthly Budget Amount (₹)
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
              Month
            </label>

            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Year
            </label>

            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              max="2100"
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
              {loading ? 'Updating...' : 'Update Budget'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditBudget;
