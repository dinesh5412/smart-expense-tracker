import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import {
  LoginPage, RegisterPage, VerifyEmailPage,
  ForgotPasswordPage, ResetPasswordPage
} from './pages/AuthPages';

export function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [authParams, setAuthParams] = useState({});

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAuthNavigate = (page, params = {}) => {
    setAuthPage(page);
    setAuthParams(params);
  };

  const handleSaveTransaction = async (formData) => {
    if (editingTx) {
      await api.updateTransaction(editingTx.id, formData);
      showNotification('Transaction updated successfully!');
    } else {
      await api.createTransaction(formData);
      showNotification('New transaction recorded!');
    }
  };

  const handleSaveBudget = async (formData) => {
    await api.saveBudget(formData);
    showNotification('Budget allowance configured!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        <p>Initializing Smart Tracker...</p>
      </div>
    );
  }

  // Unauthenticated view
  if (!isAuthenticated) {
    if (authPage === 'register') {
      return <RegisterPage onNavigate={handleAuthNavigate} />;
    }
    if (authPage === 'verify-email') {
      return <VerifyEmailPage onNavigate={handleAuthNavigate} initialToken={authParams.token} />;
    }
    if (authPage === 'forgot-password') {
      return <ForgotPasswordPage onNavigate={handleAuthNavigate} />;
    }
    if (authPage === 'reset-password') {
      return <ResetPasswordPage onNavigate={handleAuthNavigate} initialToken={authParams.token} />;
    }
    return <LoginPage onNavigate={handleAuthNavigate} />;
  }

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        {notification && (
          <div className={`alert-banner alert-${notification.type}`}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ×
            </button>
          </div>
        )}

        {activePage === 'dashboard' && (
          <Dashboard
            onOpenTransactionModal={() => { setEditingTx(null); setTxModalOpen(true); }}
            onOpenBudgetModal={() => setBudgetModalOpen(true)}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'transactions' && (
          <TransactionsPage
            onOpenTransactionModal={() => { setEditingTx(null); setTxModalOpen(true); }}
            onEditTransaction={(tx) => { setEditingTx(tx); setTxModalOpen(true); }}
          />
        )}

        {activePage === 'budgets' && (
          <BudgetsPage onOpenBudgetModal={() => setBudgetModalOpen(true)} />
        )}

        {activePage === 'analytics' && <AnalyticsPage />}

        {activePage === 'admin' && isAdmin && <AdminPage />}

        {activePage === 'verify-email' && (
          <VerifyEmailPage onNavigate={(p) => setActivePage(p || 'dashboard')} />
        )}
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editData={editingTx}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
