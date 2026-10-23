import React, { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart, Bar } from 'react-chartjs-2';
import { BarChart2, Info, Clock } from 'lucide-react';

ChartJS.register(...registerables);

export default function ParetoChart({ requestsEffectiveSLA = [], requestsCompleted = [], onOpenMethodology }) {
  const [groupBy, setGroupBy] = useState('serviceType'); // 'serviceType', 'ownerGroup', 'owner'
  const [breachScope, setBreachScope] = useState('ALL'); // 'ALL', 'CLOSED', 'OPEN'

  // Filter breached items based on active breachScope toggle
  const breachedItems = requestsEffectiveSLA.filter(r => {
    if (!r.isSLABreached) return false;
    if (breachScope === 'CLOSED') return r.breachType === 'Closed Breach';
    if (breachScope === 'OPEN') return r.breachType === 'Open Breach';
    return true;
  });

  const countsMap = {};
  breachedItems.forEach(item => {
    let key = 'Unspecified';
    if (groupBy === 'serviceType') key = `${item.department} - ${item.serviceType}`;
    else if (groupBy === 'ownerGroup') key = item.ownerGroup;
    else if (groupBy === 'owner') key = item.owner;

    if (!countsMap[key]) {
      countsMap[key] = { closed: 0, open: 0, total: 0 };
    }
    if (item.breachType === 'Closed Breach') {
      countsMap[key].closed++;
    } else if (item.breachType === 'Open Breach') {
      countsMap[key].open++;
    }
    countsMap[key].total++;
  });

  const sortedEntries = Object.entries(countsMap).sort((a, b) => b[1].total - a[1].total);

  const labels = sortedEntries.map(e => e[0]);
  const closedBreachCounts = sortedEntries.map(e => e[1].closed);
  const openBreachCounts = sortedEntries.map(e => e[1].open);
  const totalBreachCounts = sortedEntries.map(e => e[1].total);
  const totalBreaches = totalBreachCounts.reduce((a, b) => a + b, 0);

  let runningSum = 0;
  const cumulativePcts = totalBreachCounts.map(count => {
    runningSum += count;
    return totalBreaches > 0 ? parseFloat(((runningSum / totalBreaches) * 100).toFixed(1)) : 0;
  });

  const barDatasets = [];
  if (breachScope === 'ALL' || breachScope === 'CLOSED') {
    barDatasets.push({
      type: 'bar',
      label: 'Closed Breach (Completed Late)',
      data: closedBreachCounts.length > 0 ? closedBreachCounts : [0],
      backgroundColor: 'rgba(170, 36, 42, 0.88)',
      borderColor: '#AA242A',
      borderWidth: 1,
      borderRadius: 4,
      stack: 'breaches',
      yAxisID: 'yCount',
      order: 2,
    });
  }
  if (breachScope === 'ALL' || breachScope === 'OPEN') {
    barDatasets.push({
      type: 'bar',
      label: 'Open Breach (Currently Past-Due)',
      data: openBreachCounts.length > 0 ? openBreachCounts : [0],
      backgroundColor: 'rgba(255, 134, 102, 0.9)',
      borderColor: '#ff8666',
      borderWidth: 1,
      borderRadius: 4,
      stack: 'breaches',
      yAxisID: 'yCount',
      order: 2,
    });
  }

  const paretoChartData = {
    labels: labels.length > 0 ? labels : ['No Breaches Found'],
    datasets: [
      ...barDatasets,
      {
        type: 'line',
        label: 'Cumulative Breach %',
        data: cumulativePcts.length > 0 ? cumulativePcts : [0],
        borderColor: '#7fb1e5',
        backgroundColor: '#7fb1e5',
        borderWidth: 3,
        pointBackgroundColor: '#7fb1e5',
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.2,
        yAxisID: 'yPct',
        order: 1,
      },
    ],
  };

  const paretoChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#282938', font: { family: 'Inter', size: 12, weight: '600' } }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#264677',
        bodyColor: '#282938',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        callbacks: {
          label: (context) => {
            if (context.dataset.type === 'line') {
              return ` Cumulative Share: ${context.parsed.y}%`;
            }
            return ` ${context.dataset.label}: ${context.parsed.y} requests`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#475569', font: { family: 'Inter', size: 11 }, maxRotation: 35 }
      },
      yCount: {
        type: 'linear',
        position: 'left',
        stacked: true,
        title: { display: true, text: 'SLA Breach Count', color: '#AA242A', font: { size: 12, weight: 'bold' } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#475569', precision: 0 }
      },
      yPct: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        title: { display: true, text: 'Cumulative Percentage (%)', color: '#264677', font: { size: 12, weight: 'bold' } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#475569', callback: (val) => `${val}%` }
      }
    }
  };

  // Target SLA vs. Actual Resolution Time Comparison Chart (Strictly Completed Requests)
  const categoryTimeMap = {};
  requestsCompleted.forEach(r => {
    if (!r.isCompleted || r.targetSLADays === null || r.resolutionDays === null) return;
    const key = `${r.department} - ${r.serviceType}`;
    if (!categoryTimeMap[key]) {
      categoryTimeMap[key] = { targetSum: 0, actualSum: 0, count: 0 };
    }
    categoryTimeMap[key].targetSum += r.targetSLADays;
    categoryTimeMap[key].actualSum += r.resolutionDays;
    categoryTimeMap[key].count++;
  });

  const timeEntries = Object.entries(categoryTimeMap)
    .filter(([_, data]) => data.count > 0)
    .map(([key, data]) => ({
      category: key,
      avgTarget: parseFloat((data.targetSum / data.count).toFixed(1)),
      avgActual: parseFloat((data.actualSum / data.count).toFixed(1)),
      gap: parseFloat(((data.actualSum / data.count) - (data.targetSum / data.count)).toFixed(1))
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  const timeChartData = {
    labels: timeEntries.map(e => e.category),
    datasets: [
      {
        label: 'Target SLA (Days)',
        data: timeEntries.map(e => e.avgTarget),
        backgroundColor: 'rgba(38, 70, 119, 0.75)',
        borderRadius: 4
      },
      {
        label: 'Actual Resolution (Days)',
        data: timeEntries.map(e => e.avgActual),
        backgroundColor: 'rgba(170, 36, 42, 0.85)',
        borderRadius: 4
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Primary Dual-Axis Pareto Chart */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-red)', fontWeight: 700 }}>
                <BarChart2 size={18} /> PARETO ANALYSIS: SLA BREACH DRIVERS
              </div>
              <button
                type="button"
                className="info-icon-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('chart-pareto')}
                title="How the Pareto SLA Breach Drivers chart works"
                aria-label="Pareto SLA Breach Drivers Methodology"
              >
                <Info size={12} />
              </button>
              <button
                type="button"
                className="scope-badge-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('date-scoping')}
                title="Click to learn about Closed + Open Overdue scoping"
              >
                📅 Scoped by Closed + Open Overdue
              </button>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Identifies the vital 20% of categories driving 80% of SLA breaches across both late completions and open past-due requests.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* 3-Way Breach Scope Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1', gap: '2px' }}>
              {[
                { id: 'ALL', label: 'All Breaches' },
                { id: 'CLOSED', label: 'Closed Late' },
                { id: 'OPEN', label: 'Open Overdue' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBreachScope(opt.id)}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: breachScope === opt.id ? 'var(--rva-navy)' : 'transparent',
                    color: breachScope === opt.id ? '#ffffff' : 'var(--text-main)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Group By:</span>
              <select 
                className="select-input"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.825rem' }}
              >
                <option value="serviceType">Service Request Type</option>
                <option value="ownerGroup">Owner Group</option>
                <option value="owner">Service Owner</option>
              </select>
            </div>
          </div>
        </div>

        {totalBreaches === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--status-success)' }}>
            <Info size={24} style={{ marginBottom: '8px' }} />
            <div>No SLA breaches found in current filtered view! All requests met target SLA.</div>
          </div>
        ) : (
          <div style={{ height: '360px', width: '100%', position: 'relative' }}>
            <Chart type="bar" data={paretoChartData} options={paretoChartOptions} />
          </div>
        )}
      </div>

      {/* Target SLA vs Actual Days Comparison Chart (Full Width) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
            <Clock size={18} /> TARGET SLA VS. ACTUAL RESOLUTION TIME (DAYS)
          </div>
          <button
            type="button"
            className="info-icon-btn"
            onClick={() => onOpenMethodology && onOpenMethodology('chart-sla-gap')}
            title="How Target SLA vs. Actual Resolution Time is calculated"
            aria-label="Target SLA vs Actual Resolution Time Methodology"
          >
            <Info size={12} />
          </button>
          <button
            type="button"
            className="scope-badge-btn"
            onClick={() => onOpenMethodology && onOpenMethodology('date-scoping')}
            title="Click to learn about Closed Date scoping"
          >
            📅 Scoped by Closed Date
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Compares target SLA against actual days to resolution across completed requests in the selected window.
        </p>
        <div style={{ height: '280px' }}>
          <Bar
            data={timeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top', labels: { color: '#282938', font: { size: 11, weight: '600' } } } },
              scales: {
                x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 }, maxRotation: 25 } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
