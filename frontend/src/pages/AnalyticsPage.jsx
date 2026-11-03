import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DonutChart, MonthlyBarChart } from '../components/Charts';
import { DownloadIcon, RefreshCwIcon } from '../components/Icons';

export function AnalyticsPage() {
  const [monthYear, setMonthYear] = useState(() => new Date().toISOString().slice(0, 7));
  const [categoryData, setCategoryData] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [catRes, trendRes] = await Promise.all([
        api.getCategoryAnalytics(monthYear, 'EXPENSE'),
        api.getMonthlyTrends(6),
      ]);
      setCategoryData(catRes);
      setTrends(trendRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [monthYear]);

  const handleExportJson = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      month: monthYear,
      categorySpending: categoryData,
      monthlyTrends: trends,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_analytics_${monthYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Spending Analytics & Trends</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            In-depth breakdown of your cash inflows, outflows, and category trends.
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
          <button className="btn btn-secondary" onClick={handleExportJson}>
            <DownloadIcon size={16} /> Export JSON Report
          </button>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            Category Distribution ({monthYear})
          </h3>
          <DonutChart data={categoryData} />
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            6-Month Net Savings Flow
          </h3>
          <MonthlyBarChart data={trends} />
        </div>
      </div>

      {/* Monthly Trends Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Monthly Breakdown History</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Total Income</th>
                <th style={{ textAlign: 'right' }}>Total Expenses</th>
                <th style={{ textAlign: 'right' }}>Net Savings</th>
                <th style={{ textAlign: 'right' }}>Savings %</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((t) => {
                const inc = Number(t.income || 0);
                const exp = Number(t.expense || 0);
                const net = inc - exp;
                const pct = inc > 0 ? (net / inc) * 100 : 0;

                return (
                  <tr key={t.monthYear}>
                    <td style={{ fontWeight: 700 }}>{t.monthLabel}</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      +₹{inc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                      -₹{exp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        color: net >= 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
