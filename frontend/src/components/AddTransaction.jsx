
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { apiRequest } from '../services/api';

function AddTransaction({ onClose, onTransactionAdded }) {
  const [formData, setFormData] = useState({
    amount: '',
    transaction_type: 'expense',
    category: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [suggestionMessage, setSuggestionMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (e.target.name === 'description') {
      setSuggestionMessage('');
    }
  };

  const handleSuggestCategory = async () => {
    if (!formData.description.trim()) {
      setSuggestionMessage('Please enter a transaction description first.');
      return;
    }

    setSuggesting(true);
    setSuggestionMessage('');
    setError('');

    try {
      const result = await apiRequest('/api/ml/predict-category', {
        method: 'POST',
        body: JSON.stringify({
          description: formData.description.trim()
        })
      });

      setFormData((previousData) => ({
        ...previousData,
        category: result.predicted_category
      }));

      setSuggestionMessage(
        `AI suggested: ${result.predicted_category}`
      );

    } catch (err) {
      setSuggestionMessage(err.message || 'Unable to suggest category.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiRequest('/api/transactions/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          description: formData.description.trim() || null
        })
      });

      onTransactionAdded();
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
            Add Transaction
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
              className="w-full rounded-lg border p-3 outline-none"
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
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
              className="w-full rounded-lg border p-3 outline-none"
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
              placeholder="e.g. Food, Travel, Salary"
              minLength="2"
              maxLength="100"
              required
              className="w-full rounded-lg border p-3 outline-none"
            />

            <button
              type="button"
              onClick={handleSuggestCategory}
              disabled={suggesting || loading}
              className="mt-3 flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={16} />
              {suggesting ? 'Predicting...' : 'Suggest Category'}
            </button>

            {suggestionMessage && (
              <p className="mt-2 text-sm text-purple-700">
                {suggestionMessage}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
              maxLength="255"
              className="w-full rounded-lg border p-3 outline-none"
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
              className="w-full rounded-lg border p-3 outline-none"
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
              disabled={loading || suggesting}
              className="rounded-lg border px-5 py-3 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || suggesting}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AddTransaction;
