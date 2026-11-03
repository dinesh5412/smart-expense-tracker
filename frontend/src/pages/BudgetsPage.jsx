import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusIcon, TrashIcon, AlertCircleIcon, CheckCircleIcon } from '../components/Icons';

export function BudgetsPage({ onOpenBudgetModal }) {
  const [monthYear, setMonthYear] = useState(() => new Date().toISOString().slice(0, 7));
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = async (my) => {
    setLoading(true);
    try {
      const data = await api.getBudgets(my);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets(monthYear);
  }, [monthYear]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget limit?')) {
      try {
        await api.deleteBudget(id);
        loadBudgets(monthYear);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spentAmount || 0), 0);
  const overallRemaining = totalBudgeted - totalSpent;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Budget Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Set category limits and track your monthly spending allowances.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="month"
            className="input-field"
            style={{ width: 'auto' }}
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />
          <button className="btn btn-primary" onClick={onOpenBudgetModal}>
            <PlusIcon size={16} /> Set Category Budget
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div className="stat-label">Total Monthly Budget</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            ₹{totalBudgeted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Total Spent In Categories</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Remaining Safe Budget</div>
          <div className="stat-value" style={{ color: overallRemaining >= 0 ? '#10b981' : '#ef4444' }}>
            ₹{overallRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Active Monitored Budgets</div>
          <div className="stat-value" style={{ color: '#0f172a' }}>
            {budgets.length}
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p>Loading your budget cards...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>No Budgets for {monthYear}</h3>
          <p style={{ maxWidth: '450px', margin: '0 auto 20px' }}>
            Setting limits helps you curb unnecessary expenses. Click below to define monthly allowances for categories like Groceries, Dining, and Utilities.
          </p>
          <button className="btn btn-primary" onClick={onOpenBudgetModal}>
            <PlusIcon size={16} /> Create Your First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.map((b) => {
            let statusBadge = (
              <span className="badge badge-income">
                <CheckCircleIcon size={12} /> Within Budget
              </span>
            );
            let barColor = '#10b981';

            if (b.status === 'WARNING') {
              statusBadge = (
                <span className="badge badge-warning">
                  <AlertCircleIcon size={12} /> Near Threshold ({b.alertThreshold}%)
                </span>
              );
              barColor = '#f59e0b';
            } else if (b.status === 'EXCEEDED') {
              statusBadge = (
                <span className="badge badge-expense">
                  <AlertCircleIcon size={12} /> Exceeded by ₹{(Number(b.spentAmount) - Number(b.monthlyLimit)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              );
              barColor = '#ef4444';
            }

            return (
              <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{b.category}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.monthYear}</span>
                    </div>
                    {statusBadge}
                  </div>

                  <div style={{ margin: '16px 0 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Spent</span>
                      <span>
                        <strong>₹{Number(b.spentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> / ₹{Number(b.monthlyLimit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>{b.percentageUsed}% of limit</span>
                      <span>
                        {Number(b.remainingAmount) >= 0
                          ? `₹${Number(b.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining`
                          : `₹${Math.abs(Number(b.remainingAmount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })} over limit`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(b.id)}
                    style={{ color: '#ef4444' }}
                    title="Delete Budget"
                  >
                    <TrashIcon size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
