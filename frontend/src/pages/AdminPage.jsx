import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldIcon, CheckCircleIcon, AlertCircleIcon, RefreshCwIcon } from '../components/Icons';

export function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(page, 10),
      ]);
      setStats(statsRes);
      setUsers(usersRes.content || []);
      setTotalElements(usersRes.totalElements || 0);
      setTotalPages(usersRes.totalPages || 0);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [page]);

  const handleToggleVerification = async (userId) => {
    try {
      const res = await api.toggleUserVerification(userId);
      setMessage(res.message);
      setTimeout(() => setMessage(''), 4000);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed' }}>
            <ShieldIcon size={22} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Portal
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            User management, verification status overrides, and system health metrics.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadAdminData}>
          <RefreshCwIcon size={16} /> Refresh Metrics
        </button>
      </div>

      {message && (
        <div className="alert-banner alert-success">
          <span>{message}</span>
        </div>
      )}

      {/* Global Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          <div className="card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{stats.totalTransactions}</div>
          </div>
          <div className="card">
            <div className="stat-label">Active Budgets</div>
            <div className="stat-value">{stats.totalBudgets}</div>
          </div>
          <div className="card">
            <div className="stat-label">Security Role</div>
            <div className="stat-value" style={{ fontSize: '1.2rem', color: '#7c3aed', paddingTop: '8px' }}>
              ROLE_ADMIN
            </div>
          </div>
        </div>
      )}

      {/* User Directory Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Registered Accounts Directory</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Email Verified</th>
                <th>Registration Date</th>
                <th style={{ textAlign: 'center' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>#{u.id}</td>
                    <td style={{ fontWeight: 700 }}>{u.username}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.emailVerified ? (
                        <span className="badge badge-income">
                          <CheckCircleIcon size={12} /> Verified
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <AlertCircleIcon size={12} /> Unverified
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.createdAt ? u.createdAt.slice(0, 10) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleVerification(u.id)}
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <div>
              Showing {users.length} of {totalElements} users
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
    </div>
  );
}
