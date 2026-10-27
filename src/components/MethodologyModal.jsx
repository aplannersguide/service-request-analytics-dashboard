import React, { useEffect, useRef, useId, useState } from 'react';
import { BookOpen, X, Calendar, Calculator, BarChart3, Filter, ShieldCheck, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MethodologyModal({ isOpen, focusSectionId, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const [activeHighlight, setActiveHighlight] = useState(null);

  // Open / close native <dialog> using showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      if (focusSectionId) {
        setActiveHighlight(focusSectionId);
        requestAnimationFrame(() => {
          const targetEl = dialog.querySelector(`[data-section-id="${focusSectionId}"]`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      } else {
        setActiveHighlight(null);
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, focusSectionId]);

  // Mandatory Safari / legacy fallback when HTMLDialogElement.prototype.closedBy is unsupported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  const jumpToSection = (sectionId) => {
    setActiveHighlight(sectionId);
    const dialog = dialogRef.current;
    if (!dialog) return;
    const targetEl = dialog.querySelector(`[data-section-id="${sectionId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cardClass = (id) => `methodology-card ${activeHighlight === id ? 'highlighted' : ''}`;

  return (
    <dialog
      ref={dialogRef}
      className="methodology-dialog"
      {...({ closedby: 'any' })}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      {/* Modal Sticky Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid #e2e8f0',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(38, 70, 119, 0.1)', color: 'var(--rva-navy)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 id={titleId} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rva-navy)' }}>
                Dashboard Methodology & Metric Definitions
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reference guide to date scoping, KPI formulas, chart interactions, data hygiene, and canonical definitions.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <X size={16} /> Close (Esc)
          </button>
        </div>

        {/* Section Quick-Jump Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'date-scoping', label: '1. Date Scoping & As-Of Date', icon: Calendar },
            { id: 'kpi-effective-sla', label: '2. KPI Formulas', icon: Calculator },
            { id: 'chart-pareto', label: '3. Chart & Tab Guide', icon: BarChart3 },
            { id: 'data-hygiene', label: '4. Data Hygiene & Exclusions', icon: Filter },
            { id: 'hierarchy-glossary', label: '5. Hierarchy Glossary & Privacy', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => jumpToSection(tab.id)}
              >
                <Icon size={12} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Modal Body */}
      <div style={{
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        background: '#f8fafc'
      }}>

        {/* SECTION 1: DATE SCOPING & SNAPSHOT ANCHOR */}
        <section data-section-id="date-scoping" className={cardClass('date-scoping')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 800, fontSize: '1rem' }}>
            <Calendar size={18} /> 1. Context-Aware Date Scoping & The "Data As Of" Anchor
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
            <strong>Why it matters:</strong> Applying a single timestamp filter across an entire 311 dashboard distorts operational reality—filtering everything by <em>Closed Date</em> zeroes out open backlog, while filtering everything by <em>Opened Date</em> hides long-standing stalled tickets (`30+ Days`) whenever a user selects <em>Last 30 Days</em>. Instead, when you choose a Date Range Window in the toolbar, the dashboard automatically evaluates each metric by its natural lifecycle timestamp:
          </p>

          <div className="formula-box">
            <div><strong>📅 Data As Of (Snapshot Anchor):</strong> Automatically derived from the most recent <code>Opened Date</code>, <code>Closed Date</code>, or survey <code>Submitted Date</code> in the loaded dataset. Relative presets (<em>Last 30 Days</em>, <em>Last 90 Days</em>, <em>Last 365 Days</em>), backlog aging, and open SLA checks are anchored to this snapshot date.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '4px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--rva-navy)', marginBottom: '4px' }}>📅 Closed Date</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Used for <strong>Avg Resolution Time</strong> and the <strong>Target vs. Actual SLA Gap</strong> chart. Evaluates strictly Completed Requests whose <code>Closed Date</code> falls inside the selected window.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--rva-red)', marginBottom: '4px' }}>📅 Closed + Open Overdue</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Used for <strong>Effective SLA Attainment</strong> and the <strong>Pareto SLA Drivers</strong> chart. Combines Completed Requests from the window with currently overdue Backlog requests (<code>Open Breaches</code>) so overdue tickets cannot be hidden by leaving them open.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--rva-navy)', marginBottom: '4px' }}>📌 Standing Open Queue</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Used for <strong>Active Backlog Count</strong> and the <strong>Backlog & Aging</strong> tab. Includes all unfulfilled requests opened on or before the end of the selected period so <code>30+ Days (Stalled)</code> tickets never vanish when viewing a 30-day window.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--rva-navy)', marginBottom: '4px' }}>📅 Survey / Closed Date</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Used for <strong>Avg Customer Satisfaction</strong> and the <strong>CSAT Deep-Dive</strong> tab. Scopes surveyed requests by the survey's <code>Submitted Date</code> (falling back to <code>Closed Date</code> if absent).
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: KPI FORMULAS & CALCULATION RULES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 800, fontSize: '1rem' }}>
            <Calculator size={18} /> 2. Executive KPI Formulas & Calculation Rules
          </div>

          <div className="grid-2col" style={{ gap: '14px' }}>
            {/* Effective SLA Attainment */}
            <div data-section-id="kpi-effective-sla" className={cardClass('kpi-effective-sla')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--rva-navy)', fontSize: '0.92rem' }}>Effective SLA Attainment Rate</strong>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Target: ≥ 80%</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Operational Purpose:</strong> Measures on-time service delivery across all resolved work <em>plus</em> any open requests that have already missed their target due date (guaranteed SLA failures). Open requests that are still within their target window (<code>Open On Schedule</code>) are excluded until resolved or overdue.
              </p>
              <div className="formula-box">
                <div><strong>Effective SLA % =</strong> <code>Completed On-Time in Period ÷ (Completed in Period + Currently Open Past-Due) × 100</code></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  • <strong>Closed Breach:</strong> <code>Closed Date &gt; Due Date</code><br />
                  • <strong>Open Breach:</strong> Request is still open and <code>As-Of Date &gt; Due Date</code><br />
                  • <strong>Closed-Only SLA %:</strong> <code>Completed On-Time ÷ Completed in Period × 100</code> (shown as a secondary badge for comparison)
                </div>
              </div>
            </div>

            {/* Avg Customer Satisfaction */}
            <div data-section-id="kpi-csat" className={cardClass('kpi-csat')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--rva-navy)', fontSize: '0.92rem' }}>Avg Customer Satisfaction (CSAT)</strong>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Scale: 1.0 – 5.0 ★</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Operational Purpose:</strong> Captures resident perception of service outcomes across all post-completion survey responses submitted during the selected period.
              </p>
              <div className="formula-box">
                <div><strong>Request CSAT Score =</strong> Mean of the 3 survey rating questions for that Request ID (<em>Overall Satisfaction</em>, <em>Process Explanation</em>, <em>Service Quality</em>)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  • <strong>Headline Avg CSAT =</strong> <code>Sum of Request CSAT Scores ÷ Number of Surveyed Requests in Period</code>
                </div>
              </div>
            </div>

            {/* Active Backlog Count */}
            <div data-section-id="kpi-backlog" className={cardClass('kpi-backlog')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--rva-navy)', fontSize: '0.92rem' }}>Active Backlog Count & Past-Due Share</strong>
                <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>Standing Queue</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Operational Purpose:</strong> Quantifies the total standing workload of unfulfilled requests currently awaiting completion, highlighting what percentage is already overdue.
              </p>
              <div className="formula-box">
                <div><strong>Active Backlog =</strong> Count of all uncompleted requests (<code>Open</code>, <code>In Progress</code>, <code>Submitted</code>, <code>Assigned</code>) opened on or before the period end date</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  • <strong>Past-Due Share % =</strong> <code>Open Breaches ÷ Total Active Backlog × 100</code>
                </div>
              </div>
            </div>

            {/* Avg Resolution Time */}
            <div data-section-id="kpi-resolution-time" className={cardClass('kpi-resolution-time')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--rva-navy)', fontSize: '0.92rem' }}>Avg Resolution Time (Days)</strong>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Completed Work</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Operational Purpose:</strong> Measures the average turnaround time (in calendar days) from request intake to completion for requests closed during the selected window.
              </p>
              <div className="formula-box">
                <div><strong>Resolution Days (per request) =</strong> <code>(Closed Date − Opened Date)</code> in days</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  • <strong>Avg Resolution Time =</strong> <code>Sum of Resolution Days ÷ Total Completed Requests in Period</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VISUALIZATION & TAB GUIDE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 800, fontSize: '1rem' }}>
            <BarChart3 size={18} /> 3. Visualization & Tab Guide (How Charts Work)
          </div>

          <div className="grid-2col" style={{ gap: '14px' }}>
            {/* Pareto Chart */}
            <div data-section-id="chart-pareto" className={cardClass('chart-pareto')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>Pareto Analysis: SLA Breach Drivers (80/20 Rule)</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Ranks categories from highest to lowest total SLA breaches so leaders can pinpoint the vital 20% of categories driving 80% of performance failures.
              </p>
              <div className="formula-box">
                <div>• <strong>Stacked Bars (Left Axis):</strong> Stacks <span style={{ color: '#AA242A', fontWeight: 700 }}>Closed Breaches</span> (completed late) and <span style={{ color: '#c2410c', fontWeight: 700 }}>Open Breaches</span> (still open past due). Use the 3-way toggle (<em>All Breaches</em> | <em>Closed Late</em> | <em>Open Overdue</em>) or <em>Group By</em> selector to pivot views.</div>
                <div>• <strong>Cumulative Line (Right Axis):</strong> Running percentage of total breaches accounted for as you move left to right.</div>
              </div>
            </div>

            {/* Target SLA vs Actual Resolution Gap */}
            <div data-section-id="chart-sla-gap" className={cardClass('chart-sla-gap')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>Target SLA vs. Actual Resolution Time (Days)</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Compares the average promised SLA window against actual completion duration for the top 10 categories with the largest delay gap.
              </p>
              <div className="formula-box">
                <div>• <strong>Target SLA (Days):</strong> <code>(Due Date − Opened Date)</code> averaged across completed requests in that category.</div>
                <div>• <strong>Delay Gap:</strong> <code>Avg Actual Resolution Days − Avg Target SLA Days</code> (sorted largest gap first).</div>
              </div>
            </div>

            {/* CSAT Dimensions & Follow-Up Friction */}
            <div data-section-id="chart-csat-dimensions" className={cardClass('chart-csat-dimensions')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>CSAT Survey Dimensions & Resident Follow-Up Friction</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Separates post-service surveys into their three specific prompts and pairs them with resident follow-up counts to diagnose whether dissatisfaction stems from poor communication or service quality.
              </p>
              <div className="formula-box">
                <div>• <strong>3 Survey Dimensions:</strong> <em>1. Overall Satisfaction</em>, <em>2. Process Explanation ("what would happen next")</em>, and <em>3. Service Quality</em>.</div>
                <div>• <strong>Resident Follow-Up Friction:</strong> Tracks the <code>Follow-ups</code> count logged per request, showing the % of surveyed requests requiring <code>2+ follow-ups</code> and comparing average follow-ups on Dissatisfied (<code>&lt;3★</code>) vs. Satisfied (<code>≥4★</code>) requests.</div>
              </div>
            </div>

            {/* CSAT Distribution, Low Drivers & Keywords */}
            <div data-section-id="chart-csat-dist" className={cardClass('chart-csat-dist')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>Interactive CSAT Distribution, Low Drivers & Keyword Themes</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                All charts and chips on the CSAT Deep-Dive tab cross-filter one another in real time.
              </p>
              <div className="formula-box" data-section-id="chart-csat-keywords">
                <div>• <strong>Star Distribution & Low Drivers:</strong> Click any star bar (1★–5★) or Low-CSAT category bar (<code>&lt; 3★</code>) to cross-filter the rest of the page.</div>
                <div>• <strong>Automated Complaint Keywords:</strong> Extracts the most frequent recurring words (excluding common stop-words) from free-text comments on dissatisfied surveys (<code>CSAT &lt; 3.0</code>). Click any keyword chip or <code>🔄 High Follow-Ups (2+)</code> to filter comments.</div>
              </div>
            </div>

            {/* Backlog & Aging Charts */}
            <div data-section-id="chart-backlog-type" className={cardClass('chart-backlog-type')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>Backlog by Request Type, Aging Buckets & Service Owner Workload</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Provides 3-way interactive cross-filtering across the standing open queue so managers can isolate stalled bottlenecks down to individual staff queues.
              </p>
              <div className="formula-box" data-section-id="chart-backlog-aging">
                <div data-section-id="chart-backlog-owner">
                  • <strong>Backlog Age (Days):</strong> <code>(As-Of Date − Opened Date)</code> in days, grouped into <code>0–7 Days</code>, <code>8–14 Days</code>, <code>15–30 Days</code>, and <code>30+ Days (Stalled)</code>.<br />
                  • <strong>Interactive Drill-Down:</strong> Click any Request Type bar, Aging Bucket bar, or Service Owner bar to cross-filter the other two charts and the ranked Backlog table below.
                </div>
              </div>
            </div>

            {/* Data Explorer Table */}
            <div data-section-id="table-explorer" className={cardClass('table-explorer')}>
              <strong style={{ color: 'var(--rva-navy)', fontSize: '0.9rem' }}>Data Explorer (Combined Dataset & Record Detail Modal)</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Combines Completed Requests from the selected date window with the Standing Open Backlog (deduplicated by Request ID) for granular record inspection.
              </p>
              <div className="formula-box">
                <div>• Use the local <strong>Status / SLA Filter</strong> dropdown to isolate <em>Completed Only</em>, <em>Standing Backlog Only</em>, <em>All SLA Breaches</em>, <em>Open Overdue Breaches Only</em>, or <em>High Follow-Ups (2+)</em>.</div>
                <div>• Click <strong>View</strong> on any row to inspect timestamps, Follow-Up count, and all 3 Survey Dimension scores.</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: DATA HYGIENE & INTAKE EXCLUSIONS */}
        <section data-section-id="data-hygiene" className={cardClass('data-hygiene')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 800, fontSize: '1rem' }}>
            <Filter size={18} /> 4. Data Hygiene, Intake Exclusions & Normalization Rules
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            To ensure operational metrics reflect genuine service delivery work rather than administrative noise, the data parser automatically applies the following rules upon CSV/TSV upload:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div className="formula-box">
              <strong>1. Informational Call Logs Excluded</strong>
              <span>Records where <code>Service Request Type</code> contains <code>"Citizen Service and Response - Call Log"</code> or <code>"Call Log"</code> are excluded at intake so rapid call-center inquiries do not artificially inflate completion counts or SLA attainment.</span>
            </div>
            <div className="formula-box">
              <strong>2. Canceled & Duplicate Requests Excluded</strong>
              <span>Records with a <code>Canceled</code> or <code>Duplicate</code> status are excluded so terminated/duplicate submissions are never miscounted as unfulfilled Active Backlog or Open SLA Breaches.</span>
            </div>
            <div className="formula-box">
              <strong>3. Survey Rating Scale Normalization</strong>
              <span>Numeric survey answers on a 1–5 scale are used directly; if an uploaded survey uses a 1–10 rating scale (values <code>&gt; 5</code>), scores are automatically normalized to the standard 1–5 scale (<code>score ÷ 2</code>).</span>
            </div>
          </div>
        </section>

        {/* SECTION 5: HIERARCHY GLOSSARY & LOCAL PRIVACY */}
        <section data-section-id="hierarchy-glossary" className={cardClass('hierarchy-glossary')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 800, fontSize: '1rem' }}>
            <Layers size={18} /> 5. Organizational Hierarchy Glossary & Client-Side Privacy
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rva-navy)' }}>1. Department</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Top-level municipal agency responsible for the request, extracted from the alphabetic prefix of the <code>Request ID</code> (e.g., <code>DPU</code>, <code>DPW</code>, <code>DOF</code>).
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rva-navy)' }}>2. Owner Group</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The operational division or work unit within a Department (mapped from <code>Service Owner Group</code>) responsible for triaging and fulfilling the request.
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rva-navy)' }}>3. Service Owner</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The individual staff member currently accountable for progressing or resolving the specific Service Request.
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rva-navy)' }}>4. Service Request Type</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The standardized classification of the issue or municipal service requested by the resident.
              </p>
            </div>
          </div>

          <div className="formula-box" style={{ marginTop: '4px', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem' }}>
              <strong>100% Client-Side Data Privacy & Security Hardening:</strong> Uploaded CSV/TSV files (UTF-16 and UTF-8, up to 250MB) are processed exclusively inside your local browser memory. A strict Content Security Policy (<code>connect-src 'none'</code>) blocks all outbound network connections; non-essential GIS/address columns (<code>Location</code>, <code>X</code>, <code>Y</code>) are stripped upon ingest; and local <code>IndexedDB</code> cache automatically expires after 12 hours to protect shared workstations.
            </span>
          </div>
        </section>

      </div>
    </dialog>
  );
}
