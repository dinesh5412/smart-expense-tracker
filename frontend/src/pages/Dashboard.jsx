import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DonutChart, MonthlyBarChart } from '../components/Charts';
import {
  WalletIcon, TrendingUpIcon, TrendingDownIcon, PiggyBankIcon,
  PlusIcon, RefreshCwIcon, AlertCircleIcon
} from '../components/Icons';

export function Dashboard({ onOpenTransactionModal, onOpenBudgetModal, setActivePage }) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async (month) => {
    try {
      const [sumRes, catRes, trendRes, budgetRes] = await Promise.all([
        api.getSummary(month),
        api.getCategoryAnalytics(month, 'EXPENSE'),
        api.getMonthlyTrends(6),
        api.getBudgets(month),
      ]);
      setSummary(sumRes);
      setCategoryData(catRes);
      setTrendData(trendRes);
      setBudgets(budgetRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(currentMonth);
  }, [currentMonth]);

  const handleProcessRecurring = async () => {
    try {
      const res = await api.processRecurringTransactions();
      setMessage(res.message);
      setTimeout(() => setMessage(''), 4000);
      loadData(currentMonth);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  const balance = summary ? summary.totalBalance : 0;
  const income = summary ? summary.totalIncome : 0;
  const expense = summary ? summary.totalExpense : 0;
  const savingsRate = summary ? summary.savingsRate : 0;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Welcome back, {user ? user.username : 'User'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Here is your financial health and spending summary.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="month"
            className="input-field"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            style={{ width: 'auto' }}
          />

          <button
            className="btn btn-secondary"
            onClick={() => { setRefreshing(true); loadData(currentMonth); }}
            title="Refresh Data"
          >
            <RefreshCwIcon size={16} />
          </button>

          <button className="btn btn-secondary" onClick={handleProcessRecurring} title="Run recurring transactions">
            Run Recurring
          </button>

          <button className="btn btn-secondary" onClick={onOpenBudgetModal}>
            <PlusIcon size={16} /> Budget
          </button>

          <button className="btn btn-primary" onClick={() => onOpenTransactionModal()}>
            <PlusIcon size={16} /> Transaction
          </button>
        </div>
      </div>

      {message && (
        <div className="alert-banner alert-success">
          <span>{message}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid-4">
        {/* Net Balance */}
        <div className="card stat-card">
          <div>
            <div className="stat-label">Net Balance</div>
            <div className="stat-value" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>
              ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For selected period</span>
          </div>
          <div className="stat-icon primary">
            <WalletIcon size={24} />
          </div>
        </div>

        {/* Total Income */}
        <div className="card stat-card">
          <div>
            <div className="stat-label">Total Income</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              +₹{Number(income).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earned revenue</span>
          </div>
          <div className="stat-icon success">
            <TrendingUpIcon size={24} />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card stat-card">
          <div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              -₹{Number(expense).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total spending</span>
          </div>
          <div className="stat-icon danger">
            <TrendingDownIcon size={24} />
          </div>
        </div>

        {/* Savings Rate */}
        <div className="card stat-card">
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value" style={{ color: '#4f46e5' }}>
              {savingsRate}%
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Of total income saved</span>
          </div>
          <div className="stat-icon warning">
            <PiggyBankIcon size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Spending by Category</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentMonth}</span>
          </div>
          <DonutChart data={categoryData} />
        </div>

        {/* Cash Flow Trends */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>6-Month Cash Flow Trend</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Income vs Expenses</span>
          </div>
          <MonthlyBarChart data={trendData} />
        </div>
      </div>

      {/* Budgets & Recent Transactions */}
      <div className="grid-2">
        {/* Active Budgets Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Budgets ({budgets.length})</h3>
            <button
              onClick={() => setActivePage('budgets')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View All &rarr;
            </button>
          </div>

          {budgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p>No budgets created for this month.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenBudgetModal}
                style={{ marginTop: '10px' }}
              >
                Create your first budget
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {budgets.slice(0, 4).map((b) => {
                let barColor = '#10b981';
                if (b.status === 'WARNING') barColor = '#f59e0b';
                if (b.status === 'EXCEEDED') barColor = '#ef4444';

                return (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{b.category}</span>
                      <span>
                        <strong>₹{Number(b.spentAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> / ₹{Number(b.monthlyLimit).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({b.percentageUsed}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(b.percentageUsed, 100)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Transactions</h3>
            <button
              onClick={() => setActivePage('transactions')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              All Transactions &rarr;
            </button>
          </div>

          {(!summary || !summary.recentTransactions || summary.recentTransactions.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p>No transactions found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.category} • {tx.transactionDate} {tx.recurring ? '🔄' : ''}
                    </span>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: tx.type === 'INCOME' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
