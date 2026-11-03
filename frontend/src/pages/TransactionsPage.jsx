import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusIcon, SearchIcon, FilterIcon, DownloadIcon, EditIcon, TrashIcon } from '../components/Icons';

export function TransactionsPage({ onOpenTransactionModal, onEditTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('transactionDate');
  const [direction, setDirection] = useState('desc');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        keyword,
        type: type || undefined,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        page,
        size,
        sortBy,
        direction,
      });

      setTransactions(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, size, sortBy, direction]);

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setPage(0);
    loadTransactions();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(id);
        loadTransactions();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Title', 'Type', 'Amount', 'Category', 'Date', 'Payment Method', 'Recurring', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${t.category}"`,
      t.transactionDate,
      `"${t.paymentMethod}"`,
      t.recurring ? `Yes (${t.recurringFrequency})` : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Search, filter, and manage your income and expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <DownloadIcon size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => onOpenTransactionModal()}>
            <PlusIcon size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleApplyFilter} className="filter-bar">
        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            className="input-field"
            placeholder="Search title or notes..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          className="select-field"
          style={{ width: 'auto', minWidth: '130px' }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>

        {/* Date From */}
        <input
          type="date"
          className="input-field"
          style={{ width: 'auto' }}
          placeholder="From"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        {/* Date To */}
        <input
          type="date"
          className="input-field"
          style={{ width: 'auto' }}
          placeholder="To"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {/* Min Amount */}
        <input
          type="number"
          step="0.01"
          className="input-field"
          style={{ width: '100px' }}
          placeholder="Min ₹"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />

        {/* Max Amount */}
        <input
          type="number"
          step="0.01"
          className="input-field"
          style={{ width: '100px' }}
          placeholder="Max ₹"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />

        <button type="submit" className="btn btn-primary btn-sm">
          <FilterIcon size={14} /> Filter
        </button>

        <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
          Reset
        </button>
      </form>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSortBy('transactionDate');
                  setDirection(direction === 'asc' ? 'desc' : 'asc');
                }}
              >
                Date {sortBy === 'transactionDate' ? (direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSortBy('title');
                  setDirection(direction === 'asc' ? 'desc' : 'asc');
                }}
              >
                Title {sortBy === 'title' ? (direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Category</th>
              <th>Method</th>
              <th
                style={{ cursor: 'pointer', textAlign: 'right' }}
                onClick={() => {
                  setSortBy('amount');
                  setDirection(direction === 'asc' ? 'desc' : 'asc');
                }}
              >
                Amount {sortBy === 'amount' ? (direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions match your search or filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{tx.transactionDate}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700 }}>{tx.title}</span>
                      {tx.recurring && (
                        <span
                          className="badge"
                          style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                          title={`Recurring: ${tx.recurringFrequency}`}
                        >
                          🔄 {tx.recurringFrequency}
                        </span>
                      )}
                    </div>
                    {tx.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {tx.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{tx.paymentMethod || 'Cash'}</td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: tx.type === 'INCOME' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditTransaction(tx)}
                        title="Edit"
                      >
                        <EditIcon size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(tx.id)}
                        title="Delete"
                        style={{ color: '#ef4444' }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination bar */}
        <div className="pagination">
          <div>
            Showing {transactions.length} of {totalElements} transactions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              className="select-field"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>

            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
