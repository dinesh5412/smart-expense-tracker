import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WalletIcon, LogOutIcon, ShieldIcon, AlertCircleIcon } from './Icons';

export function Navbar({ activePage, setActivePage }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActivePage('dashboard')}>
          <div className="brand-icon">
            <WalletIcon size={22} />
          </div>
          <span>SmartTracker</span>
        </div>

        {/* Links */}
        <nav className="nav-links">
          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`}
            onClick={() => setActivePage('transactions')}
          >
            Transactions
          </button>
          <button
            className={`nav-item ${activePage === 'budgets' ? 'active' : ''}`}
            onClick={() => setActivePage('budgets')}
          >
            Budgets
          </button>
          <button
            className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`}
            onClick={() => setActivePage('analytics')}
          >
            Analytics & Reports
          </button>
          {isAdmin && (
            <button
              className={`nav-item ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
              style={{ color: '#7c3aed' }}
            >
              <ShieldIcon size={16} />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right side user menu */}
        <div className="nav-right">
          {user && !user.emailVerified && (
            <button
              onClick={() => setActivePage('verify-email')}
              className="badge badge-warning"
              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Click to verify your email"
            >
              <AlertCircleIcon size={14} />
              Verify Email
            </button>
          )}

          <div className="user-badge">
            <div className="avatar">
              {user ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, lineHeight: 1.2 }}>{user ? user.username : 'User'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ padding: '7px 10px' }}
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
