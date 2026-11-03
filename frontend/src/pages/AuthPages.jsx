import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WalletIcon, CheckCircleIcon, AlertCircleIcon } from '../components/Icons';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div className="brand-icon">
            <WalletIcon size={22} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e1b4b' }}>SmartTracker</span>
        </div>

        <h2>Sign In</h2>
        <p className="subtitle">Enter your credentials to access your finances</p>

        {error && <div className="alert-banner alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Username or Email
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. user@expensetracker.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successToken, setSuccessToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(username, email, password);
      setSuccessToken(res.data);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Start tracking your income and budgets today</p>

        {error && <div className="alert-banner alert-danger">{error}</div>}

        {successToken ? (
          <div className="alert-banner alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div>
              <strong>Account created successfully!</strong>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                A verification token has been generated:
              </p>
              <code style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '4px', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                {successToken}
              </code>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('verify-email', { token: successToken })}
            >
              Verify Email Now &rarr;
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export function VerifyEmailPage({ onNavigate, initialToken = '' }) {
  const { verifyEmail } = useAuth();
  const [token, setToken] = useState(initialToken);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await verifyEmail(token);
      setMessage(res.message || 'Email verified successfully!');
    } catch (err) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Verify Email Address</h2>
        <p className="subtitle">Enter your verification token to unlock your account</p>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {message && (
          <div className="alert-banner alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <span>{message}</span>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('login')}>
              Go to Login
            </button>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Verification Token</label>
              <input
                type="text"
                className="input-field"
                placeholder="Paste your token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            &larr; Back to Dashboard
          </button>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ onNavigate }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setToken(res.data);
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your registered email to receive a reset token</p>

        {error && <div className="alert-banner alert-danger">{error}</div>}

        {token ? (
          <div className="alert-banner alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div>
              <strong>Reset Token Generated:</strong>
              <code style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '4px', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                {token}
              </code>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('reset-password', { token })}
            >
              Reset Password Now &rarr;
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            &larr; Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export function ResetPasswordPage({ onNavigate, initialToken = '' }) {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      setMessage(res.message || 'Password reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter the token and choose a new password</p>

        {error && <div className="alert-banner alert-danger">{error}</div>}
        {message && (
          <div className="alert-banner alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <span>{message}</span>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('login')}>
              Sign In with New Password
            </button>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Reset Token</label>
              <input
                type="text"
                className="input-field"
                placeholder="Paste token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            &larr; Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
