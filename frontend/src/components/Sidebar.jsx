
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Lightbulb,
  MessageCircle,
  Settings,
  LogOut,
  CircleDollarSign
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  { name: 'Budgets', icon: Wallet, path: '/budgets' },
  { name: 'Analytics', icon: ChartNoAxesCombined, path: '/analytics' },
  { name: 'AI Insights', icon: Lightbulb, path: '/insights' },
  { name: 'AI Assistant', icon: MessageCircle, path: '/chatbot' }
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex w-full items-center justify-center gap-3 rounded-lg px-2 py-3 text-sm transition md:justify-start md:px-4 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <aside className="flex min-h-screen w-16 shrink-0 flex-col border-r border-slate-200 bg-white px-2 py-6 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white md:w-64 md:px-5">

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-10 flex items-center justify-center gap-3 text-left md:justify-start"
        title="Go to Dashboard"
      >
        <div className="rounded-xl bg-blue-600 p-2 text-white">
          <CircleDollarSign size={26} />
        </div>

        <div className="hidden md:block">
          <h1 className="text-lg font-bold">FinAI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Finance Assistant
          </p>
        </div>
      </button>

      <p className="mb-4 hidden text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 md:block">
        Main Menu
      </p>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={item.name}
              className={navLinkClass}
            >
              <Icon size={19} />
              <span className="hidden md:inline">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-5 dark:border-slate-700">

        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            `mb-3 ${navLinkClass({ isActive })}`
          }
        >
          <Settings size={19} />
          <span className="hidden md:inline">Settings</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="flex w-full items-center justify-center gap-3 rounded-lg px-2 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800 md:justify-start md:px-4"
        >
          <LogOut size={19} />
          <span className="hidden md:inline">Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
