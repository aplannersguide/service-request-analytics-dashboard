import React from 'react';
import { Star, Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICards({ requestsOpened = [], requestsClosed = [] }) {
  // 1. CSAT Calculation (Scoped by Closed / Survey Date)
  const csatItems = requestsClosed.filter(r => r.csatScore !== null);
  const avgCSAT = csatItems.length > 0
    ? (csatItems.reduce((acc, r) => acc + r.csatScore, 0) / csatItems.length).toFixed(1)
    : 'N/A';

  // 2. SLA Attainment Calculation (Scoped by Closed Date)
  const totalBreaches = requestsClosed.filter(r => r.isSLABreached).length;
  const slaAttainmentPct = requestsClosed.length > 0
    ? (((requestsClosed.length - totalBreaches) / requestsClosed.length) * 100).toFixed(1)
    : '0.0';

  // 3. Active Backlog Calculation (Scoped by Opened Date)
  const backlogRequests = requestsOpened.filter(r => r.isBacklog);
  const openBreaches = backlogRequests.filter(r => r.isSLABreached).length;
  const openBreachPct = backlogRequests.length > 0
    ? ((openBreaches / backlogRequests.length) * 100).toFixed(0)
    : 0;

  // 4. Avg Resolution Time for completed (Scoped by Closed Date)
  const completedItems = requestsClosed.filter(r => r.isCompleted && r.resolutionDays !== null);
  const avgResolutionDays = completedItems.length > 0
    ? (completedItems.reduce((acc, r) => acc + r.resolutionDays, 0) / completedItems.length).toFixed(1)
    : 'N/A';

  return (
    <div className="kpi-grid">
      {/* CSAT Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '3px solid var(--rva-navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Avg Customer Satisfaction
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
              📅 Closed Date
            </span>
          </div>
          <div style={{ background: 'rgba(38, 70, 119, 0.08)', padding: '6px', borderRadius: '8px', color: 'var(--rva-navy)' }}>
            <Star size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--rva-dark)' }}>
            {avgCSAT}
          </span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706' }}>
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
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '3px solid var(--rva-navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              SLA Attainment Rate
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
              📅 Closed Date
            </span>
          </div>
          <div style={{ background: 'rgba(38, 70, 119, 0.08)', padding: '6px', borderRadius: '8px', color: 'var(--rva-navy)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--rva-dark)' }}>
            {slaAttainmentPct}%
          </span>
          <span className={`badge ${parseFloat(slaAttainmentPct) >= 80 ? 'badge-success' : 'badge-danger'}`}>
            {parseFloat(slaAttainmentPct) >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {parseFloat(slaAttainmentPct) >= 80 ? 'On Target' : 'Below Goal'}
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--rva-red)' }}>{totalBreaches} Total Breaches</strong> (Closed + Open past-due)
        </div>
      </div>

      {/* Backlog Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '3px solid var(--rva-navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Active Backlog Count
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
              📅 Opened Date
            </span>
          </div>
          <div style={{ background: 'rgba(170, 36, 42, 0.08)', padding: '6px', borderRadius: '8px', color: 'var(--rva-red)' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--rva-dark)' }}>
            {backlogRequests.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Open Requests</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--rva-red)', fontWeight: 700 }}>{openBreaches} ({openBreachPct}%)</span> currently past due SLA
        </div>
      </div>

      {/* Avg Resolution Time Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '3px solid var(--rva-navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Avg Resolution Time
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
              📅 Closed Date
            </span>
          </div>
          <div style={{ background: 'rgba(38, 70, 119, 0.08)', padding: '6px', borderRadius: '8px', color: 'var(--rva-navy)' }}>
            <Clock size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--rva-dark)' }}>
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
