import React from 'react';
import { Star, Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICards({ requests }) {
  // 1. CSAT Calculation
  const csatItems = requests.filter(r => r.csatScore !== null);
  const avgCSAT = csatItems.length > 0
    ? (csatItems.reduce((acc, r) => acc + r.csatScore, 0) / csatItems.length).toFixed(1)
    : 'N/A';

  // 2. SLA Attainment Calculation
  const totalBreaches = requests.filter(r => r.isSLABreached).length;
  const slaAttainmentPct = requests.length > 0
    ? (((requests.length - totalBreaches) / requests.length) * 100).toFixed(1)
    : '0.0';

  // 3. Active Backlog Calculation
  const backlogRequests = requests.filter(r => r.isBacklog);
  const openBreaches = backlogRequests.filter(r => r.isSLABreached).length;
  const openBreachPct = backlogRequests.length > 0
    ? ((openBreaches / backlogRequests.length) * 100).toFixed(0)
    : 0;

  // 4. Avg Resolution Time for completed
  const completedItems = requests.filter(r => r.isCompleted && r.resolutionDays !== null);
  const avgResolutionDays = completedItems.length > 0
    ? (completedItems.reduce((acc, r) => acc + r.resolutionDays, 0) / completedItems.length).toFixed(1)
    : 'N/A';

  return (
    <div className="kpi-grid">
      {/* CSAT Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Avg Customer Satisfaction
          </span>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-purple)' }}>
            <Star size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {avgCSAT}
          </span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={14}
              fill={star <= Math.round(parseFloat(avgCSAT) || 0) ? '#f59e0b' : 'none'}
              stroke="#f59e0b"
            />
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
            ({csatItems.length} surveys)
          </span>
        </div>
      </div>

      {/* SLA Attainment Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            SLA Attainment Rate
          </span>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {slaAttainmentPct}%
          </span>
          <span className={`badge ${parseFloat(slaAttainmentPct) >= 80 ? 'badge-success' : 'badge-danger'}`}>
            {parseFloat(slaAttainmentPct) >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {parseFloat(slaAttainmentPct) >= 80 ? 'On Target' : 'Below Goal'}
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--status-danger)' }}>{totalBreaches} Total Breaches</strong> (Closed + Open past-due)
        </div>
      </div>

      {/* Backlog Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--status-warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Active Backlog Count
          </span>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--status-warning)' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {backlogRequests.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Open Requests</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--status-danger)', fontWeight: 700 }}>{openBreaches} ({openBreachPct}%)</span> currently past due SLA
        </div>
      </div>

      {/* Avg Resolution Time Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Avg Resolution Time
          </span>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-blue)' }}>
            <Clock size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {avgResolutionDays}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Days / Request</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Based on {completedItems.length} completed service requests
        </div>
      </div>
    </div>
  );
}
