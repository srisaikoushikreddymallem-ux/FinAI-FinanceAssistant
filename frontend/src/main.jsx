import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import './style.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';

import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            <Route path="/transactions" element={
              <ProtectedRoute><Transactions /></ProtectedRoute>
            } />

            <Route path="/budgets" element={
              <ProtectedRoute><Budgets /></ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute><Analytics /></ProtectedRoute>
            } />

            <Route path="/insights" element={
              <ProtectedRoute><Insights /></ProtectedRoute>
            } />

            <Route path="/chatbot" element={
              <ProtectedRoute><Chatbot /></ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);