const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?expired=true';
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  async login(usernameOrEmail, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    return handleResponse(res);
  },

  async register(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(res);
  },

  async verifyEmail(token) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createTransaction(txData) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(txData),
    });
    return handleResponse(res);
  },

  async updateTransaction(id, txData) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(txData),
    });
    return handleResponse(res);
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getSummary(monthYear) {
    const query = monthYear ? `?monthYear=${encodeURIComponent(monthYear)}` : '';
    const res = await fetch(`${API_BASE}/transactions/summary${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getCategoryAnalytics(monthYear, type) {
    const query = new URLSearchParams();
    if (monthYear) query.append('monthYear', monthYear);
    if (type) query.append('type', type);

    const res = await fetch(`${API_BASE}/transactions/category-analytics?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getMonthlyTrends(months = 6) {
    const res = await fetch(`${API_BASE}/transactions/monthly-trend?months=${months}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async processRecurringTransactions() {
    const res = await fetch(`${API_BASE}/transactions/process-recurring`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Budgets
  async getBudgets(monthYear) {
    const query = monthYear ? `?monthYear=${encodeURIComponent(monthYear)}` : '';
    const res = await fetch(`${API_BASE}/budgets${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async saveBudget(budgetData) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(budgetData),
    });
    return handleResponse(res);
  },

  async deleteBudget(id) {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Admin
  async getAllUsers(page = 0, size = 10) {
    const res = await fetch(`${API_BASE}/admin/users?page=${page}&size=${size}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async toggleUserVerification(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-verification`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
};
