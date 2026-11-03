import React from 'react';

const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4',
  '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export function DonutChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        <p>No category spending recorded yet.</p>
      </div>
    );
  }

  const total = data.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0);
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            const amount = Number(item.totalAmount || 0);
            const percent = total > 0 ? (amount / total) : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={item.category || index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SPENT</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', width: '100%' }}>
        {data.slice(0, 6).map((item, index) => (
          <div key={item.category || index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--text-muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.category}
            </span>
            <span style={{ fontWeight: 700 }}>
              ₹{Number(item.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        <p>No monthly data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d) => Math.max(Number(d.income || 0), Number(d.expense || 0))),
    100
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981' }} />
          <span>Income</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ef4444' }} />
          <span>Expense</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px', height: '180px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        {data.map((item, idx) => {
          const incHeight = maxVal > 0 ? (Number(item.income || 0) / maxVal) * 140 : 0;
          const expHeight = maxVal > 0 ? (Number(item.expense || 0) / maxVal) * 140 : 0;

          return (
            <div
              key={item.monthYear || idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                {/* Income Bar */}
                <div
                  title={`Income: ₹${Number(item.income).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  style={{
                    width: '40%',
                    maxWidth: '16px',
                    height: `${Math.max(incHeight, 4)}px`,
                    backgroundColor: '#10b981',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                {/* Expense Bar */}
                <div
                  title={`Expense: ₹${Number(item.expense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  style={{
                    width: '40%',
                    maxWidth: '16px',
                    height: `${Math.max(expHeight, 4)}px`,
                    backgroundColor: '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.monthLabel ? item.monthLabel.split(' ')[0] : item.monthYear}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
