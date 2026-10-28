import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Star, MessageSquare, Search, Award, AlertTriangle, Filter, RotateCcw, X, Tag, RefreshCw, Info, Download } from 'lucide-react';
import { exportFeedbackCommentsToCSV } from '../services/dataParser';

export default function CSATAnalysis({ requests, onOpenMethodology }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStarFilter, setActiveStarFilter] = useState('ALL');
  const [activeLowTypeFilter, setActiveLowTypeFilter] = useState(null);
  const [activeKeywordFilter, setActiveKeywordFilter] = useState(null);
  const [highFollowUpOnly, setHighFollowUpOnly] = useState(false);

  const requestsWithCSAT = requests.filter(r => r.csatScore !== null);

  // Calculate 3 Survey Dimensions & Follow-Up Friction Metrics
  const calcAvg = (items, getter) => {
    const valid = items.map(getter).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (valid.length === 0) return 'N/A';
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
  };

  const avgOverallDim = calcAvg(requestsWithCSAT, r => r.csatDimensions?.overall ?? r.csatScore);
  const avgExplanationDim = calcAvg(requestsWithCSAT, r => r.csatDimensions?.explanation);
  const avgQualityDim = calcAvg(requestsWithCSAT, r => r.csatDimensions?.quality);

  const dissatisfiedReqs = requestsWithCSAT.filter(r => r.csatScore < 3);
  const satisfiedReqs = requestsWithCSAT.filter(r => r.csatScore >= 4);
  const avgFollowUpsLowCSAT = calcAvg(dissatisfiedReqs, r => r.followUps || 0);
  const avgFollowUpsHighCSAT = calcAvg(satisfiedReqs, r => r.followUps || 0);
  const highFollowUpCount = requestsWithCSAT.filter(r => (r.followUps || 0) >= 2).length;
  const highFollowUpPct = requestsWithCSAT.length > 0
    ? Math.round((highFollowUpCount / requestsWithCSAT.length) * 100)
    : 0;

  // 1. Cross-Filtered Data for CSAT Rating Distribution Chart
  const requestsForDistChart = requestsWithCSAT.filter(r => {
    if (activeLowTypeFilter) {
      const fullType = `${r.department} - ${r.serviceType}`;
      if (fullType !== activeLowTypeFilter && r.serviceType !== activeLowTypeFilter) return false;
    }
    if (highFollowUpOnly && (r.followUps || 0) < 2) return false;
    return true;
  });

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  requestsForDistChart.forEach(r => {
    const rounded = Math.round(r.csatScore);
    if (rounded >= 1 && rounded <= 5) {
      ratingCounts[rounded]++;
    }
  });

  const defaultDistColors = [
    'rgba(170, 36, 42, 0.85)',   // 1 Star: Crimson Red
    'rgba(255, 134, 102, 0.85)',  // 2 Stars: Coral
    'rgba(255, 232, 107, 0.85)',  // 3 Stars: Yellow
    'rgba(127, 177, 229, 0.85)',  // 4 Stars: Sky Blue
    'rgba(168, 221, 131, 0.85)'   // 5 Stars: Light Green
  ];

  const distColors = [1, 2, 3, 4, 5].map((star, idx) => {
    if (activeStarFilter === 'ALL') return defaultDistColors[idx];
    if (activeStarFilter === 'LOW' && star < 3) return defaultDistColors[idx];
    if (activeStarFilter === star) return defaultDistColors[idx];
    return 'rgba(148, 163, 184, 0.25)';
  });

  const distChartData = {
    labels: ['1 Star (Poor)', '2 Stars (Fair)', '3 Stars (Neutral)', '4 Stars (Good)', '5 Stars (Excellent)'],
    datasets: [{
      label: 'Survey Count',
      data: [ratingCounts[1], ratingCounts[2], ratingCounts[3], ratingCounts[4], ratingCounts[5]],
      backgroundColor: distColors,
      borderRadius: 6
    }]
  };

  // 2. Cross-Filtered Data for Low CSAT Drivers Chart (< 3 Stars)
  const requestsForLowChart = requestsWithCSAT.filter(r => {
    if (r.csatScore >= 3) return false;
    if (activeStarFilter === 1 && Math.round(r.csatScore) !== 1) return false;
    if (activeStarFilter === 2 && Math.round(r.csatScore) !== 2) return false;
    if (highFollowUpOnly && (r.followUps || 0) < 2) return false;
    return true;
  });

  const lowCSATMap = {};
  requestsForLowChart.forEach(r => {
    const key = `${r.department} - ${r.serviceType}`;
    lowCSATMap[key] = (lowCSATMap[key] || 0) + 1;
  });

  const sortedLowCSAT = Object.entries(lowCSATMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const lowLabels = sortedLowCSAT.length > 0 ? sortedLowCSAT.map(e => e[0]) : ['No Low Ratings'];
  const lowData = sortedLowCSAT.length > 0 ? sortedLowCSAT.map(e => e[1]) : [0];

  const lowColors = lowLabels.map(label => {
    if (!activeLowTypeFilter) return 'rgba(170, 36, 42, 0.85)';
    if (activeLowTypeFilter === label) return 'rgba(170, 36, 42, 0.98)';
    return 'rgba(148, 163, 184, 0.25)';
  });

  const lowCSATChartData = {
    labels: lowLabels,
    datasets: [{
      label: 'Count of Low Ratings',
      data: lowData,
      backgroundColor: lowColors,
      borderColor: '#AA242A',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // 3. Extract Customer Comments & Complaint Keyword Extractor
  const allComments = [];
  const wordFreqMap = {};
  const stopWords = new Set(['the', 'and', 'was', 'for', 'with', 'this', 'that', 'were', 'have', 'from', 'your', 'service', 'request']);

  requests.forEach(r => {
    if (r.comments && r.comments.length > 0) {
      r.comments.forEach(c => {
        allComments.push({
          reqId: r.id,
          dept: r.department,
          ownerGroup: r.ownerGroup,
          owner: r.owner,
          type: r.serviceType,
          fullTypeLabel: `${r.department} - ${r.serviceType}`,
          csat: r.csatScore,
          dimensions: r.csatDimensions,
          surveyDate: r.surveyDate,
          breachType: r.breachType,
          followUps: r.followUps || 0,
          comment: c
        });

        // Count recurring words for negative feedback (< 3 CSAT)
        if (r.csatScore !== null && r.csatScore < 3) {
          const words = c.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
          words.forEach(w => {
            if (w.length > 3 && !stopWords.has(w)) {
              wordFreqMap[w] = (wordFreqMap[w] || 0) + 1;
            }
          });
        }
      });
    }
  });

  const topComplaintKeywords = Object.entries(wordFreqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const filteredComments = allComments.filter(c => {
    if (activeStarFilter === 'LOW') {
      if (!c.csat || c.csat >= 3) return false;
    } else if (activeStarFilter !== 'ALL') {
      if (Math.round(c.csat) !== activeStarFilter) return false;
    }

    if (activeLowTypeFilter) {
      if (c.fullTypeLabel !== activeLowTypeFilter && c.type !== activeLowTypeFilter) return false;
    }

    if (activeKeywordFilter) {
      if (!c.comment.toLowerCase().includes(activeKeywordFilter.toLowerCase())) return false;
    }

    if (highFollowUpOnly && c.followUps < 2) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      c.comment.toLowerCase().includes(term) ||
      c.ownerGroup.toLowerCase().includes(term) ||
      c.type.toLowerCase().includes(term) ||
      c.dept.toLowerCase().includes(term) ||
      c.reqId.toLowerCase().includes(term)
    );
  });

  const handleDistChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const clickedIdx = elements[0].index;
      const starRating = clickedIdx + 1;
      setActiveStarFilter(prev => prev === starRating ? 'ALL' : starRating);
    }
  };

  const handleLowChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const clickedIdx = elements[0].index;
      const clickedLabel = lowLabels[clickedIdx];
      setActiveLowTypeFilter(prev => prev === clickedLabel ? null : clickedLabel);
    }
  };

  const handleResetChartFilters = () => {
    setActiveStarFilter('ALL');
    setActiveLowTypeFilter(null);
    setActiveKeywordFilter(null);
    setHighFollowUpOnly(false);
  };

  const isChartFilterActive = activeStarFilter !== 'ALL' || activeLowTypeFilter !== null || activeKeywordFilter !== null || highFollowUpOnly;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 4-Card Survey Dimensions & Follow-Up Friction Summary Strip */}
      <div className="kpi-grid">
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '3px solid var(--rva-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              1. Overall Satisfaction
            </span>
            <button
              type="button"
              className="info-icon-btn"
              onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dimensions')}
              title="How Survey Dimensions & Follow-Up Friction work"
              aria-label="Overall Satisfaction Dimension Methodology"
            >
              <Info size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rva-dark)' }}>{avgOverallDim}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            "What was your overall satisfaction with your service request?"
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '3px solid var(--rva-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              2. Process Explanation
            </span>
            <button
              type="button"
              className="info-icon-btn"
              onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dimensions')}
              title="How Survey Dimensions & Follow-Up Friction work"
              aria-label="Process Explanation Dimension Methodology"
            >
              <Info size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rva-dark)' }}>{avgExplanationDim}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            "How satisfied are you with the explanation of what would happen next?"
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '3px solid var(--rva-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              3. Service Quality
            </span>
            <button
              type="button"
              className="info-icon-btn"
              onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dimensions')}
              title="How Survey Dimensions & Follow-Up Friction work"
              aria-label="Service Quality Dimension Methodology"
            >
              <Info size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rva-dark)' }}>{avgQualityDim}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            "How satisfied are you with the quality of the service provided?"
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '3px solid var(--rva-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-red)', textTransform: 'uppercase' }}>
                Resident Follow-Up Friction
              </span>
              <button
                type="button"
                className="info-icon-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dimensions')}
                title="How Resident Follow-Up Friction is calculated"
                aria-label="Resident Follow-Up Friction Methodology"
              >
                <Info size={12} />
              </button>
            </div>
            <RefreshCw size={14} style={{ color: 'var(--rva-red)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rva-dark)' }}>{highFollowUpPct}%</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>needed 2+ follow-ups</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Avg <strong style={{ color: 'var(--rva-red)' }}>{avgFollowUpsLowCSAT} follow-ups</strong> on &lt;3★ vs. <strong>{avgFollowUpsHighCSAT}</strong> on ≥4★
          </span>
        </div>
      </div>

      {/* Active Drill-Down Banner */}
      {isChartFilterActive && (
        <div style={{
          background: 'rgba(38, 70, 119, 0.08)',
          border: '1px solid rgba(38, 70, 119, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--rva-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> CROSS-CHART DRILL-DOWN ACTIVE:
            </span>
            {activeStarFilter !== 'ALL' && (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Rating: {activeStarFilter === 'LOW' ? '< 3 Stars' : `${activeStarFilter} Stars`}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setActiveStarFilter('ALL')} />
              </span>
            )}
            {activeLowTypeFilter && (
              <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Driver: {activeLowTypeFilter}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setActiveLowTypeFilter(null)} />
              </span>
            )}
            {activeKeywordFilter && (
              <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Keyword: "{activeKeywordFilter}"
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setActiveKeywordFilter(null)} />
              </span>
            )}
            {highFollowUpOnly && (
              <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                High Follow-Ups (2+)
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setHighFollowUpOnly(false)} />
              </span>
            )}
          </div>

          <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleResetChartFilters}>
            <RotateCcw size={12} /> Clear Drill-Down
          </button>
        </div>
      )}

      {/* Both Interactive Cross-Filtered Charts */}
      <div className="grid-2col">
        {/* CSAT Rating Distribution */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
                <Award size={18} /> CSAT RATING DISTRIBUTION (CROSS-FILTERS PAGE)
              </div>
              <button
                type="button"
                className="info-icon-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dist')}
                title="How CSAT Rating Distribution & Cross-Filtering work"
                aria-label="CSAT Rating Distribution Methodology"
              >
                <Info size={12} />
              </button>
              <button
                type="button"
                className="scope-badge-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('date-scoping')}
                title="Click to learn about Survey / Closed Date scoping"
              >
                📅 Scoped by Survey / Closed Date
              </button>
            </div>
            {activeStarFilter !== 'ALL' && (
              <button
                className="btn btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setActiveStarFilter('ALL')}
              >
                Reset
              </button>
            )}
          </div>
          <div style={{ height: '250px' }}>
            <Bar 
              data={distChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: handleDistChartClick,
                plugins: { 
                  legend: { display: false },
                  tooltip: { callbacks: { afterBody: () => '💡 Click to cross-filter driver chart & comments' } }
                },
                scales: {
                  x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 } } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', precision: 0 } }
                }
              }} 
            />
          </div>
        </div>

        {/* Low CSAT Drivers Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-red)', fontWeight: 700 }}>
                <AlertTriangle size={18} /> TOP LOW CSAT DRIVERS (CROSS-FILTERS PAGE)
              </div>
              <button
                type="button"
                className="info-icon-btn"
                onClick={() => onOpenMethodology && onOpenMethodology('chart-csat-dist')}
                title="How Low CSAT Drivers & Cross-Filtering work"
                aria-label="Top Low CSAT Drivers Methodology"
              >
                <Info size={12} />
              </button>
            </div>
            {activeLowTypeFilter && (
              <button
                className="btn btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setActiveLowTypeFilter(null)}
              >
                Reset
              </button>
            )}
          </div>
          <div style={{ height: '250px' }}>
            <Bar
              data={lowCSATChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                onClick: handleLowChartClick,
                plugins: { 
                  legend: { display: false },
                  tooltip: { callbacks: { afterBody: () => '💡 Click to cross-filter rating chart & comments' } }
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

      {/* Automated Complaint Keyword / Theme Badges */}
      {topComplaintKeywords.length > 0 && (
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rva-red)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={13} /> AUTOMATED COMPLAINT KEYWORD THEMES (CLICK TO FILTER COMMENTS)
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {topComplaintKeywords.map(([word, count]) => {
              const isSelected = activeKeywordFilter === word;
              return (
                <button
                  key={word}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderColor: isSelected ? 'var(--rva-red)' : 'rgba(170, 36, 42, 0.3)',
                    background: isSelected ? 'var(--rva-red)' : '#ffffff',
                    color: isSelected ? 'white' : 'var(--text-main)'
                  }}
                  onClick={() => setActiveKeywordFilter(prev => prev === word ? null : word)}
                >
                  🔥 "{word}" ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Feedback & Sentiment Comments Container */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700 }}>
                <MessageSquare size={18} /> CUSTOMER SURVEY FEEDBACK ({filteredComments.length} COMMENTS)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Filtered synchronously by active chart selections, follow-up friction, and complaint keywords.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search feedback text, request #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.825rem' }}
              />
            </div>

            <button
              type="button"
              className="btn btn-outline"
              disabled={filteredComments.length === 0}
              onClick={() => exportFeedbackCommentsToCSV(filteredComments, 'RVA_311_CSAT_Feedback')}
              style={{ padding: '7px 12px', fontSize: '0.78rem', opacity: filteredComments.length === 0 ? 0.5 : 1 }}
              title="Download all matching survey feedback comments and dimension scores as a CSV file"
            >
              <Download size={13} /> Export Feedback CSV ({filteredComments.length})
            </button>
          </div>
        </div>

        {/* Star Rating & Follow-Up Friction Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} /> Filter Chips:
          </span>
          <button
            className={`btn ${activeStarFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => setActiveStarFilter('ALL')}
          >
            All Ratings ({allComments.length})
          </button>
          <button
            className={`btn ${activeStarFilter === 'LOW' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--rva-red)', color: activeStarFilter === 'LOW' ? 'white' : 'var(--rva-red)', background: activeStarFilter === 'LOW' ? 'var(--rva-red)' : '#ffffff' }}
            onClick={() => setActiveStarFilter('LOW')}
          >
            ⚠️ Dissatisfied (&lt; 3★)
          </button>

          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`btn ${activeStarFilter === star ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setActiveStarFilter(star)}
            >
              {star} Star{star > 1 ? 's' : ''} ({ratingCounts[star]})
            </button>
          ))}

          <button
            className={`btn ${highFollowUpOnly ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderColor: 'var(--rva-navy)',
              background: highFollowUpOnly ? 'var(--rva-navy)' : '#ffffff',
              color: highFollowUpOnly ? '#ffffff' : 'var(--rva-navy)'
            }}
            onClick={() => setHighFollowUpOnly(prev => !prev)}
          >
            🔄 High Follow-Ups (2+)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredComments.length === 0 ? (
            <div style={{ padding: '30px', color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>
              No customer comments matching active chart filters or keyword selection.
            </div>
          ) : (
            filteredComments.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: '#f8fafc', 
                  border: item.csat && item.csat < 3 ? '1px solid rgba(170, 36, 42, 0.35)' : '1px solid #e2e8f0', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-navy)' }}>
                    [{item.dept}] #{item.reqId} • {item.ownerGroup}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${item.followUps >= 2 ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                      🔄 {item.followUps} Follow-up{item.followUps === 1 ? '' : 's'}
                    </span>
                    <span className={`badge ${item.csat && item.csat >= 4 ? 'badge-success' : item.csat && item.csat < 3 ? 'badge-danger' : 'badge-warning'}`}>
                      CSAT {item.csat ? `${item.csat}/5` : 'N/A'}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{item.comment}"
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {item.type}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
