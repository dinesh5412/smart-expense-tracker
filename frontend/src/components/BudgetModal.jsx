import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'Housing', 'Groceries', 'Food & Dining', 'Transportation',
  'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Personal Care', 'Other'
];

export function BudgetModal({ isOpen, onClose, onSave, currentMonthYear }) {
  const [formData, setFormData] = useState({
    category: 'Groceries',
    monthlyLimit: '',
    monthYear: currentMonthYear || new Date().toISOString().slice(0, 7),
    alertThreshold: 80,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        category: 'Groceries',
        monthlyLimit: '',
        monthYear: currentMonthYear || new Date().toISOString().slice(0, 7),
        alertThreshold: 80,
      });
      setError('');
    }
  }, [isOpen, currentMonthYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numLimit = parseFloat(formData.monthlyLimit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid monthly limit greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        monthlyLimit: numLimit,
        alertThreshold: parseInt(formData.alertThreshold, 10),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Category Budget</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-banner alert-danger">{error}</div>}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
              <select
                className="select-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  className="input-field"
                  placeholder="15000"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Target Month</label>
                <input
                  type="month"
                  className="input-field"
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alert Threshold</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{formData.alertThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                You will be warned when your category expenses reach {formData.alertThreshold}% of this limit.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
