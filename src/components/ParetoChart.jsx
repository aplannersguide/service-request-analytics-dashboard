import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart, Bar } from 'react-chartjs-2';
import { BarChart2, Info, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ParetoChart({ requests }) {
  const [groupBy, setGroupBy] = useState('serviceType'); // 'serviceType', 'ownerGroup', 'owner'

  // Filter breached items for Pareto Chart
  const breachedItems = requests.filter(r => r.isSLABreached);

  const countsMap = {};
  breachedItems.forEach(item => {
    let key = 'Unspecified';
    if (groupBy === 'serviceType') key = `${item.department} - ${item.serviceType}`;
    else if (groupBy === 'ownerGroup') key = item.ownerGroup;
    else if (groupBy === 'owner') key = item.owner;

    countsMap[key] = (countsMap[key] || 0) + 1;
  });

  const sortedEntries = Object.entries(countsMap).sort((a, b) => b[1] - a[1]);

  const labels = sortedEntries.map(e => e[0]);
  const breachCounts = sortedEntries.map(e => e[1]);
  const totalBreaches = breachCounts.reduce((a, b) => a + b, 0);

  let runningSum = 0;
  const cumulativePcts = breachCounts.map(count => {
    runningSum += count;
    return totalBreaches > 0 ? parseFloat(((runningSum / totalBreaches) * 100).toFixed(1)) : 0;
  });

  const paretoChartData = {
    labels: labels.length > 0 ? labels : ['No Breaches Found'],
    datasets: [
      {
        type: 'bar',
        label: 'SLA Breach Count',
        data: breachCounts.length > 0 ? breachCounts : [0],
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'yCount',
        order: 2,
      },
      {
        type: 'line',
        label: 'Cumulative Breach %',
        data: cumulativePcts.length > 0 ? cumulativePcts : [0],
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        borderWidth: 3,
        pointBackgroundColor: '#38bdf8',
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
        labels: { color: '#f8fafc', font: { family: 'Inter', size: 12, weight: '600' } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#38bdf8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            if (context.dataset.type === 'line') {
              return ` Cumulative Impact: ${context.parsed.y}%`;
            }
            return ` SLA Breaches: ${context.parsed.y} requests`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, maxRotation: 35 }
      },
      yCount: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'SLA Breach Count', color: '#ef4444', font: { size: 12, weight: 'bold' } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', precision: 0 }
      },
      yPct: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        title: { display: true, text: 'Cumulative Percentage (%)', color: '#38bdf8', font: { size: 12, weight: 'bold' } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8', callback: (val) => `${val}%` }
      }
    }
  };

  // Target SLA vs. Actual Resolution Time Comparison Chart
  const categoryTimeMap = {};
  requests.forEach(r => {
    const key = `${r.department} - ${r.serviceType}`;
    if (!categoryTimeMap[key]) {
      categoryTimeMap[key] = { targetSum: 0, actualSum: 0, targetCount: 0, actualCount: 0 };
    }
    if (r.targetSLADays) {
      categoryTimeMap[key].targetSum += r.targetSLADays;
      categoryTimeMap[key].targetCount++;
    }
    if (r.isCompleted && r.resolutionDays) {
      categoryTimeMap[key].actualSum += r.resolutionDays;
      categoryTimeMap[key].actualCount++;
    }
  });

  const timeEntries = Object.entries(categoryTimeMap)
    .filter(([_, data]) => data.targetCount > 0 && data.actualCount > 0)
    .map(([key, data]) => ({
      category: key,
      avgTarget: parseFloat((data.targetSum / data.targetCount).toFixed(1)),
      avgActual: parseFloat((data.actualSum / data.actualCount).toFixed(1)),
      gap: parseFloat(((data.actualSum / data.actualCount) - (data.targetSum / data.targetCount)).toFixed(1))
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  const timeChartData = {
    labels: timeEntries.map(e => e.category),
    datasets: [
      {
        label: 'Target SLA (Days)',
        data: timeEntries.map(e => e.avgTarget),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4
      },
      {
        label: 'Actual Resolution (Days)',
        data: timeEntries.map(e => e.avgActual),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-danger)', fontWeight: 700 }}>
              <BarChart2 size={18} /> PARETO ANALYSIS: SLA BREACH DRIVERS
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Identify the vital 20% of categories driving 80% of SLA performance failures.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Group By:</span>
            <select 
              className="select-input"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.825rem' }}
            >
              <option value="serviceType">Service Request Type</option>
              <option value="ownerGroup">Unit (Owner Group)</option>
              <option value="owner">Assignee (Owner)</option>
            </select>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: '4px' }}>
          <Clock size={18} /> TARGET SLA VS. ACTUAL RESOLUTION TIME (DAYS)
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Identifies categories with unrealistic SLA targets vs operational delays.
        </p>
        <div style={{ height: '280px' }}>
          <Bar
            data={timeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 11 } } } },
              scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 25 } },
                y: { ticks: { color: '#94a3b8' } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
