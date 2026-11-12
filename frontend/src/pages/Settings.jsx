import React, { useEffect, useState } from 'react';
import {
  User,
  Palette,
  Globe,
  ShieldCheck,
  Sun,
  Moon,
  Save
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest('/api/auth/me');
        setUser(data);
      } catch (err) {
        setError(err.message || 'Unable to load account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleCurrencySave = () => {
    setSuccess('Currency preference saved successfully.');
    setTimeout(() => setSuccess(''), 3000);
  };
  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setPasswordLoading(true);

    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      setPasswordSuccess('Password changed successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account and application preferences.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        {/* Account Information */}
        <section className="mb-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <User className="text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Account Information
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your registered account details.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading account details...
            </p>
          ) : user ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full Name
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-white">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email Address
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-white">
                  {user.email}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {/* Appearance */}
        <section className="mb-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <Palette className="text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose how FinAI looks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun size={18} />
              Light Mode
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon size={18} />
              Dark Mode
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="mb-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <Globe className="text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Preferences
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customize your financial display preferences.
              </p>
            </div>
          </div>

          <div className="max-w-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Default Currency
            </label>

            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setSuccess('');
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>

            <button
              type="button"
              onClick={handleCurrencySave}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Save size={17} />
              Save Preference
            </button>
          </div>
        </section>

        {/* Account Security */}
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Account Security
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keep your account secure.
              </p>
            </div>
          </div>

  <form onSubmit={handlePasswordChange} className="mt-5 max-w-lg space-y-4">

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Current Password
      </label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Enter current password"
        autoComplete="current-password"
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        New Password
      </label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
        minLength={8}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Confirm New Password
      </label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        autoComplete="new-password"
        minLength={8}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>

    {passwordError && (
      <p className="text-sm text-red-600">
        {passwordError}
      </p>
    )}

    {passwordSuccess && (
      <p className="text-sm text-green-600">
        {passwordSuccess}
      </p>
    )}

    <button
      type="submit"
      disabled={passwordLoading}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {passwordLoading ? 'Changing Password...' : 'Change Password'}
    </button>

  </form>
        </section>
      </main>
    </div>
  );
}

export default Settings;
