
import React, { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

import {
  BrainCircuit,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Lightbulb,
  Bell
} from 'lucide-react';

function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { formatCurrency } = useCurrency();

  const fetchInsights = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest('/api/insights/');
      setInsights(result);
    } catch (err) {
      setError(err.message || 'Unable to load insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const generateInsights = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest('/api/insights/generate', {
        method: 'POST'
      });

      await fetchInsights();

      setSuccess(
        `${result.generated_count} insights generated. ${result.saved_count} new insights saved.`
      );
    } catch (err) {
      setError(err.message || 'Unable to generate insights.');
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId) => {
    setError('');

    try {
      await apiRequest(`/api/insights/${insightId}/read`, {
        method: 'PATCH'
      });

      setInsights((previous) =>
        previous.map((item) =>
          item.id === insightId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      setError(err.message || 'Unable to update insight.');
    }
  };

  const deleteInsight = async (insightId) => {
    setError('');

    try {
      await apiRequest(`/api/insights/${insightId}`, {
        method: 'DELETE'
      });

      setInsights((previous) =>
        previous.filter((item) => item.id !== insightId)
      );
    } catch (err) {
      setError(err.message || 'Unable to delete insight.');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Recently generated';

    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const formatInsightMessage = (message) => {
    return message.replace(/₹\s?([\d,]+(?:\.\d{1,2})?)/g, (match, amount) => {
      const numericAmount = Number(amount.replace(/,/g, ''));
      return formatCurrency(numericAmount);
    });
  };




  const getInsightStyle = (type) => {
    if (type === 'budget_exceeded') {
      return {
        icon: AlertTriangle,
        color: 'text-rose-600',
        background: 'bg-rose-50'
      };
    }

    if (type === 'budget_warning') {
      return {
        icon: Bell,
        color: 'text-amber-600',
        background: 'bg-amber-50'
      };
    }

    if (type === 'expense_increase') {
      return {
        icon: TrendingUp,
        color: 'text-rose-600',
        background: 'bg-rose-50'
      };
    }

    if (type === 'expense_decrease') {
      return {
        icon: TrendingDown,
        color: 'text-emerald-600',
        background: 'bg-emerald-50'
      };
    }

    if (type === 'savings_rate') {
      return {
        icon: Wallet,
        color: 'text-blue-600',
        background: 'bg-blue-50'
      };
    }

    return {
      icon: Lightbulb,
      color: 'text-purple-600',
      background: 'bg-purple-50'
    };
  };

  const unreadCount = insights.filter(
    (item) => !item.is_read
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">

        {/* Page Header */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              AI Spending Insights
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand your financial habits with intelligent spending analysis.
            </p>
          </div>

          <button
            onClick={generateInsights}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={generating ? 'animate-spin' : ''}
            />

            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>

        {/* Status Messages */}

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Summary Cards */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Insights
              </p>

              <div className="rounded-lg bg-indigo-50 p-3">
                <BrainCircuit className="text-indigo-600" size={22} />
              </div>
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-800">
              {insights.length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Unread Insights
              </p>

              <div className="rounded-lg bg-amber-50 p-3">
                <Bell className="text-amber-600" size={22} />
              </div>
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-800">
              {unreadCount}
            </h2>
          </div>
        </div>

        {/* Insights List */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Your Financial Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recommendations and observations based on your financial activity.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">
              Loading your financial insights...
            </div>
          ) : insights.length === 0 ? (
            <div className="py-16 text-center">
              <BrainCircuit
                size={48}
                className="mx-auto mb-4 text-slate-300"
              />

              <h3 className="font-semibold text-slate-700">
                No insights available yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Generate your first insights to understand your spending habits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((item) => {
                const style = getInsightStyle(item.insight_type);
                const Icon = style.icon;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-5 transition ${
                      item.is_read
                        ? 'border-slate-100 bg-white'
                        : 'border-indigo-100 bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                      <div className={`rounded-lg p-3 ${style.background}`}>
                        <Icon size={22} className={style.color} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-800">
                            {item.title}
                          </h3>

                          {!item.is_read && (
                            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {formatInsightMessage(item.message)}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          {formatDate(item.created_at)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {!item.is_read && (
                            <button
                              onClick={() => markAsRead(item.id)}
                              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              <CheckCircle size={15} />
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() => deleteInsight(item.id)}
                            className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Insights;
