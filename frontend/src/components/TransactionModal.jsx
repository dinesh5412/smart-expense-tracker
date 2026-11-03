import React, { useState, useEffect } from 'react';

const EXPENSE_CATEGORIES = [
  'Housing', 'Groceries', 'Food & Dining', 'Transportation',
  'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Personal Care', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Dividends', 'Gifts', 'Bonus', 'Rental Income', 'Other'
];

export function TransactionModal({ isOpen, onClose, onSave, editData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: 'Groceries',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: '',
    recurring: false,
    recurringFrequency: 'MONTHLY',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        amount: editData.amount ? String(editData.amount) : '',
        type: editData.type || 'EXPENSE',
        category: editData.category || 'Groceries',
        transactionDate: editData.transactionDate || new Date().toISOString().split('T')[0],
        paymentMethod: editData.paymentMethod || 'Credit Card',
        notes: editData.notes || '',
        recurring: Boolean(editData.recurring),
        recurringFrequency: editData.recurringFrequency || 'MONTHLY',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: 'Groceries',
        transactionDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        notes: '',
        recurring: false,
        recurringFrequency: 'MONTHLY',
      });
    }
    setError('');
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a title');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: numAmount,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editData ? 'Edit Transaction' : 'New Transaction'}</h3>
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

            {/* Type toggle */}
            <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#f1f5f9', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: 'Groceries' })}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: formData.type === 'EXPENSE' ? '#ffffff' : 'transparent',
                  color: formData.type === 'EXPENSE' ? '#ef4444' : 'var(--text-muted)',
                  boxShadow: formData.type === 'EXPENSE' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'Salary' })}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: formData.type === 'INCOME' ? '#ffffff' : 'transparent',
                  color: formData.type === 'INCOME' ? '#10b981' : 'var(--text-muted)',
                  boxShadow: formData.type === 'INCOME' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Income
              </button>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Grocery store, Monthly Salary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Amount & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                <select
                  className="select-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Payment Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Payment Method</label>
                <select
                  className="select-field"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Recurring toggle */}
            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                />
                <span>Recurring Transaction</span>
              </label>

              {formData.recurring && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Frequency</label>
                  <select
                    className="select-field"
                    value={formData.recurringFrequency}
                    onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Notes (Optional)</label>
              <textarea
                className="input-field"
                rows="2"
                placeholder="Additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editData ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
