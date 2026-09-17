import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Clock, AlertOctagon, UserCheck, ShieldAlert, Layers, RotateCcw, Filter, X, CheckCircle2 } from 'lucide-react';

export default function BacklogAnalysis({ requests }) {
  const backlogRequests = requests.filter(r => r.isBacklog);

  // Interactive Multi-Dimensional Drill-Down Filter States
  const [selectedBacklogType, setSelectedBacklogType] = useState(null);
  const [selectedAgingBucket, setSelectedAgingBucket] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  // Helper filter function for individual charts & table
  const filterRequest = (r, skipType = false, skipAging = false, skipAssignee = false) => {
    if (!skipType && selectedBacklogType) {
      const fullType = `${r.department} - ${r.serviceType}`;
      if (fullType !== selectedBacklogType && r.serviceType !== selectedBacklogType) return false;
    }
    if (!skipAging && selectedAgingBucket) {
      const age = r.backlogAgeDays || 0;
      if (selectedAgingBucket === '0 - 7 Days' && (age < 0 || age > 7)) return false;
      if (selectedAgingBucket === '8 - 14 Days' && (age <= 7 || age > 14)) return false;
      if (selectedAgingBucket === '15 - 30 Days' && (age <= 14 || age > 30)) return false;
      if (selectedAgingBucket === '30+ Days (Stalled)' && age <= 30) return false;
    }
    if (!skipAssignee && selectedAssignee) {
      if (r.owner !== selectedAssignee) return false;
    }
    return true;
  };

  // 1. Cross-Filtered Data for BACKLOG BY SERVICE REQUEST TYPE (skips type filter)
  const backlogForTypeChart = backlogRequests.filter(r => filterRequest(r, true, false, false));
  
  const typeMap = {};
  backlogForTypeChart.forEach(r => {
    const key = `${r.department} - ${r.serviceType}`;
    typeMap[key] = (typeMap[key] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const typeLabels = sortedTypes.length > 0 ? sortedTypes.map(e => e[0]) : ['No Backlog Items'];
  const typeCounts = sortedTypes.length > 0 ? sortedTypes.map(e => e[1]) : [0];

  const typeColors = typeLabels.map(label => {
    if (!selectedBacklogType) return 'rgba(127, 177, 229, 0.85)';
    if (selectedBacklogType === label) return 'rgba(127, 177, 229, 0.98)';
    return 'rgba(148, 163, 184, 0.25)'; // Grayed out
  });

  const typeChartData = {
    labels: typeLabels,
    datasets: [{
      label: 'Open Backlog Count',
      data: typeCounts,
      backgroundColor: typeColors,
      borderColor: '#7fb1e5',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // 2. Cross-Filtered Data for BACKLOG AGING DISTRIBUTION (skips aging filter)
  const backlogForAgingChart = backlogRequests.filter(r => filterRequest(r, false, true, false));

  const ageBuckets = {
    '0 - 7 Days': 0,
    '8 - 14 Days': 0,
    '15 - 30 Days': 0,
    '30+ Days (Stalled)': 0
  };

  backlogForAgingChart.forEach(r => {
    const age = r.backlogAgeDays || 0;
    if (age <= 7) ageBuckets['0 - 7 Days']++;
    else if (age <= 14) ageBuckets['8 - 14 Days']++;
    else if (age <= 30) ageBuckets['15 - 30 Days']++;
    else ageBuckets['30+ Days (Stalled)']++;
  });

  const agingLabels = Object.keys(ageBuckets);
  const defaultAgingColors = [
    'rgba(168, 221, 131, 0.85)', // 0-7 Days: Light Green
    'rgba(127, 177, 229, 0.85)', // 8-14 Days: Sky Blue
    'rgba(255, 232, 107, 0.85)', // 15-30 Days: Yellow
    'rgba(170, 36, 42, 0.85)'    // 30+ Days: Crimson Red
  ];

  const agingColors = agingLabels.map((bucket, idx) => {
    if (!selectedAgingBucket) return defaultAgingColors[idx];
    if (selectedAgingBucket === bucket) return defaultAgingColors[idx];
    return 'rgba(148, 163, 184, 0.25)'; // Grayed out
  });

  const agingChartData = {
    labels: agingLabels,
    datasets: [{
      label: 'Open Backlog Requests',
      data: Object.values(ageBuckets),
      backgroundColor: agingColors,
      borderRadius: 6
    }]
  };

  // 3. Cross-Filtered Data for WORKLOAD BY ASSIGNEE (skips assignee filter)
  const backlogForOwnerChart = backlogRequests.filter(r => filterRequest(r, false, false, true));

  const ownerBacklog = {};
  backlogForOwnerChart.forEach(r => {
    const owner = r.owner || 'Unassigned';
    ownerBacklog[owner] = (ownerBacklog[owner] || 0) + 1;
  });

  const ownerSorted = Object.entries(ownerBacklog).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const ownerLabels = ownerSorted.length > 0 ? ownerSorted.map(e => e[0]) : ['No Assignees'];

  const ownerColors = ownerLabels.map(label => {
    if (!selectedAssignee) return 'rgba(38, 70, 119, 0.85)';
    if (selectedAssignee === label) return 'rgba(38, 70, 119, 0.98)';
    return 'rgba(148, 163, 184, 0.25)'; // Grayed out
  });

  const ownerChartData = {
    labels: ownerLabels,
    datasets: [{
      label: 'Open Requests Assigned',
      data: ownerSorted.length > 0 ? ownerSorted.map(e => e[1]) : [0],
      backgroundColor: ownerColors,
      borderRadius: 6
    }]
  };

  // 4. Backlog Explorer Table (Enforces ALL 3 active chart filters on ALL backlog items)
  const filteredBacklogItems = backlogRequests
    .filter(r => filterRequest(r, false, false, false))
    .sort((a, b) => (b.backlogAgeDays || 0) - (a.backlogAgeDays || 0));

  const handleTypeChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const idx = elements[0].index;
      const clickedType = typeLabels[idx];
      setSelectedBacklogType(prev => prev === clickedType ? null : clickedType);
    }
  };

  const handleAgingChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const idx = elements[0].index;
      const clickedBucket = agingLabels[idx];
      setSelectedAgingBucket(prev => prev === clickedBucket ? null : clickedBucket);
    }
  };

  const handleOwnerChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const idx = elements[0].index;
      const clickedOwner = ownerLabels[idx];
      setSelectedAssignee(prev => prev === clickedOwner ? null : clickedOwner);
    }
  };

  const handleResetBacklogChartFilters = () => {
    setSelectedBacklogType(null);
    setSelectedAgingBucket(null);
    setSelectedAssignee(null);
  };

  const isAnyChartFilterActive = selectedBacklogType || selectedAgingBucket || selectedAssignee;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Active Drill-Down Banner */}
      {isAnyChartFilterActive && (
        <div style={{
          background: 'rgba(38, 70, 119, 0.08)',
          border: '1px solid rgba(38, 70, 119, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--rva-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> CROSS-CHART DRILL-DOWN ACTIVE:
            </span>
            {selectedBacklogType && (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Type: {selectedBacklogType}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setSelectedBacklogType(null)} />
              </span>
            )}
            {selectedAgingBucket && (
              <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Aging: {selectedAgingBucket}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setSelectedAgingBucket(null)} />
              </span>
            )}
            {selectedAssignee && (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Assignee: {selectedAssignee}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setSelectedAssignee(null)} />
              </span>
            )}
          </div>

          <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleResetBacklogChartFilters}>
            <RotateCcw size={12} /> Clear Drill-Down
          </button>
        </div>
      )}

      {/* 1. TOP FULL-WIDTH CHART: BACKLOG BY SERVICE REQUEST TYPE */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
                <Layers size={18} /> BACKLOG BY SERVICE REQUEST TYPE (CROSS-FILTERS PAGE)
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                📅 Scoped by Opened Date
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any bar to drill down into aging and workload distribution for that category.
            </p>
          </div>

          {selectedBacklogType && (
            <button
              className="btn btn-outline"
              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              onClick={() => setSelectedBacklogType(null)}
            >
              Reset Type
            </button>
          )}
        </div>

        <div style={{ height: '260px' }}>
          <Bar
            data={typeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: handleTypeChartClick,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    afterBody: () => '💡 Click to cross-filter aging chart, workload chart, & backlog table'
                  }
                }
              },
              scales: {
                x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 }, maxRotation: 30 } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', precision: 0 } }
              }
            }}
          />
        </div>
      </div>

      {/* 2. TWO-COLUMN CHARTS: AGING & WORKLOAD */}
      <div className="grid-2col">
        {/* Backlog Aging Buckets */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-red)', fontWeight: 700 }}>
              <Clock size={18} /> AGING DISTRIBUTION (CROSS-FILTERS PAGE)
            </div>
            {selectedAgingBucket && (
              <button
                className="btn btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setSelectedAgingBucket(null)}
              >
                Reset
              </button>
            )}
          </div>

          <div style={{ height: '240px' }}>
            <Bar
              data={agingChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: handleAgingChartClick,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      afterBody: () => '💡 Click to cross-filter request type chart, workload chart, & backlog table'
                    }
                  }
                },
                scales: {
                  x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 } } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', precision: 0 } }
                }
              }}
            />
          </div>
        </div>

        {/* Workload by Assignee */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
              <UserCheck size={18} /> WORKLOAD BY ASSIGNEE (CROSS-FILTERS PAGE)
            </div>
            {selectedAssignee && (
              <button
                className="btn btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setSelectedAssignee(null)}
              >
                Reset
              </button>
            )}
          </div>

          <div style={{ height: '240px' }}>
            <Bar
              data={ownerChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                onClick: handleOwnerChartClick,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      afterBody: () => '💡 Click to cross-filter request type chart, aging chart, & backlog table'
                    }
                  }
                },
                scales: {
                  x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', precision: 0 } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. ACTIVE BACKLOG DRILL-DOWN TABLE */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
              <ShieldAlert size={18} /> ACTIVE BACKLOG RECORDS ({filteredBacklogItems.length})
            </span>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing all matching active backlog requests ranked by age
          </span>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>Request ID</th>
                <th>Dept</th>
                <th>Unit Group</th>
                <th>Request Type</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Age (Days)</th>
                <th>SLA Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filteredBacklogItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No active backlog items matching the active chart drill-downs.
                  </td>
                </tr>
              ) : (
                filteredBacklogItems.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>#{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.department}</td>
                    <td>{r.ownerGroup}</td>
                    <td>{r.serviceType}</td>
                    <td>{r.owner}</td>
                    <td>
                      <span className={`badge ${r.priority === 'Critical' ? 'badge-danger' : r.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td style={{ color: r.isSLABreached ? 'var(--status-danger)' : 'var(--text-main)', fontWeight: r.isSLABreached ? 600 : 400 }}>
                      {r.dueDate ? r.dueDate.toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {r.backlogAgeDays ? `${Math.round(r.backlogAgeDays)}d` : 'N/A'}
                    </td>
                    <td>
                      {r.isSLABreached ? (
                        <span className="badge badge-danger">
                          <AlertOctagon size={12} /> Past Due SLA
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> On Schedule
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
