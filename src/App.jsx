import React, { useState, useEffect, useMemo } from 'react';
import DropZoneHeader from './components/DropZoneHeader';
import FilterToolbar from './components/FilterToolbar';
import KPICards from './components/KPICards';
import ParetoChart from './components/ParetoChart';
import CSATAnalysis from './components/CSATAnalysis';
import BacklogAnalysis from './components/BacklogAnalysis';
import RequestDataTable from './components/RequestDataTable';

import { generateMockDataset } from './services/mockData';
import { processRawDatasets, computeDatasetAsOfDate } from './services/dataParser';
import { saveLocalData, getLocalData, clearLocalData } from './services/storageService';
import { BarChart3, Star, Clock, Table } from 'lucide-react';

export default function App() {
  const [isDemoData, setIsDemoData] = useState(true);
  const [rawRequests, setRawRequests] = useState([]);
  const [rawSurveys, setRawSurveys] = useState([]);
  const [activeTab, setActiveTab] = useState('pareto');

  // Multi-Select Hierarchy Filter States (Department -> Owner Group -> Service Owner -> Service Request Type)
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  // Date Window Filters
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load Initial Data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const savedReqs = await getLocalData('sr_dashboard_raw_reqs');
        const savedSurveys = await getLocalData('sr_dashboard_raw_surveys');

        if (savedReqs && Array.isArray(savedReqs) && savedReqs.length > 0) {
          setRawRequests(savedReqs);
          setRawSurveys(savedSurveys || []);
          setIsDemoData(false);
          return;
        }
      } catch (e) {
        console.error('Error reading local dataset:', e);
      }

      loadDemoDataset();
    }

    loadInitialData();
  }, []);

  const loadDemoDataset = () => {
    const { requests, surveys } = generateMockDataset();
    setRawRequests(requests);
    setRawSurveys(surveys);
    setIsDemoData(true);
    clearLocalData();
  };

  const handleCustomDataLoaded = async (requestsData, surveysData) => {
    if (requestsData) {
      setRawRequests(requestsData);
      saveLocalData('sr_dashboard_raw_reqs', requestsData).catch(err => {
        console.warn('Could not persist requests dataset to storage:', err);
      });
    }
    if (surveysData) {
      setRawSurveys(surveysData);
      saveLocalData('sr_dashboard_raw_surveys', surveysData).catch(err => {
        console.warn('Could not persist surveys dataset to storage:', err);
      });
    }

    setIsDemoData(false);
  };

  // Dynamic Dataset As-Of Date (Snapshot Anchor)
  const asOfDate = useMemo(() => {
    return computeDatasetAsOfDate(rawRequests, rawSurveys);
  }, [rawRequests, rawSurveys]);

  // 1. Process raw items anchored to asOfDate
  const processedRequests = useMemo(() => {
    return processRawDatasets(rawRequests, rawSurveys, asOfDate);
  }, [rawRequests, rawSurveys, asOfDate]);

  // 2. Filter options & cascade
  const departments = useMemo(() => {
    return Array.from(new Set(processedRequests.map(r => r.department))).filter(Boolean).sort();
  }, [processedRequests]);

  const isDeptFilteringActive = selectedDepts.length > 0 && !selectedDepts.includes('ALL');

  const ownerGroups = useMemo(() => {
    let list = processedRequests;
    if (isDeptFilteringActive) {
      list = list.filter(r => selectedDepts.includes(r.department));
    }
    return Array.from(new Set(list.map(r => r.ownerGroup))).filter(Boolean).sort();
  }, [processedRequests, selectedDepts, isDeptFilteringActive]);

  const isGroupFilteringActive = selectedGroups.length > 0 && !selectedGroups.includes('ALL');

  const availableOwners = useMemo(() => {
    let list = processedRequests;
    if (isDeptFilteringActive) {
      list = list.filter(r => selectedDepts.includes(r.department));
    }
    if (isGroupFilteringActive) {
      list = list.filter(r => selectedGroups.includes(r.ownerGroup));
    }
    return Array.from(new Set(list.map(r => r.owner))).filter(Boolean).sort();
  }, [processedRequests, selectedDepts, isDeptFilteringActive, selectedGroups, isGroupFilteringActive]);

  const isOwnerFilteringActive = selectedOwners.length > 0 && !selectedOwners.includes('ALL');

  const availableRequestTypes = useMemo(() => {
    let list = processedRequests;
    if (isDeptFilteringActive) {
      list = list.filter(r => selectedDepts.includes(r.department));
    }
    if (isGroupFilteringActive) {
      list = list.filter(r => selectedGroups.includes(r.ownerGroup));
    }
    if (isOwnerFilteringActive) {
      list = list.filter(r => selectedOwners.includes(r.owner));
    }
    return Array.from(new Set(list.map(r => r.serviceType))).filter(Boolean).sort();
  }, [processedRequests, selectedDepts, isDeptFilteringActive, selectedGroups, isGroupFilteringActive, selectedOwners, isOwnerFilteringActive]);

  const isTypeFilteringActive = selectedTypes.length > 0 && !selectedTypes.includes('ALL');

  // Generic Toggle Handler
  const makeToggleHandler = (allOptions, setSelectedState) => (item) => {
    setSelectedState(prev => {
      if (prev.length === 0 || prev.includes('ALL')) {
        const allOthers = allOptions.filter(opt => opt !== item);
        return allOthers;
      }
      if (prev.includes(item)) {
        const next = prev.filter(opt => opt !== item);
        return next.length === 0 ? [] : next;
      } else {
        const next = [...prev, item];
        return next.length === allOptions.length ? [] : next;
      }
    });
  };

  const handleDeptToggle = makeToggleHandler(departments, setSelectedDepts);
  const handleGroupToggle = makeToggleHandler(ownerGroups, setSelectedGroups);
  const handleOwnerToggle = makeToggleHandler(availableOwners, setSelectedOwners);
  const handleTypeToggle = makeToggleHandler(availableRequestTypes, setSelectedTypes);

  const handleResetFilters = () => {
    setSelectedDepts([]);
    setSelectedGroups([]);
    setSelectedOwners([]);
    setSelectedTypes([]);
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Helper filter function for date window filtering
  const matchesDateRange = (refDate, anchorDate) => {
    if (datePreset === 'ALL') return true;
    if (!refDate) return false;

    if (datePreset === 'LAST_MONTH') {
      const thirtyDaysAgo = new Date(anchorDate.getTime() - 30 * 86400000);
      return refDate >= thirtyDaysAgo && refDate <= anchorDate;
    } else if (datePreset === 'LAST_QUARTER') {
      const ninetyDaysAgo = new Date(anchorDate.getTime() - 90 * 86400000);
      return refDate >= ninetyDaysAgo && refDate <= anchorDate;
    } else if (datePreset === 'LAST_YEAR') {
      const oneYearAgo = new Date(anchorDate.getTime() - 365 * 86400000);
      return refDate >= oneYearAgo && refDate <= anchorDate;
    } else if (datePreset === 'CUSTOM') {
      if (customStartDate && refDate < new Date(customStartDate)) return false;
      if (customEndDate && refDate > new Date(customEndDate + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  // Base organizational hierarchy filters (Department, Owner Group, Service Owner, Service Request Type)
  const baseFilteredRequests = useMemo(() => {
    return processedRequests.filter(r => {
      if (isDeptFilteringActive && !selectedDepts.includes(r.department)) return false;
      if (isGroupFilteringActive && !selectedGroups.includes(r.ownerGroup)) return false;
      if (isOwnerFilteringActive && !selectedOwners.includes(r.owner)) return false;
      if (isTypeFilteringActive && !selectedTypes.includes(r.serviceType)) return false;
      return true;
    });
  }, [
    processedRequests, 
    selectedDepts, isDeptFilteringActive, 
    selectedGroups, isGroupFilteringActive, 
    selectedOwners, isOwnerFilteringActive, 
    selectedTypes, isTypeFilteringActive
  ]);

  // 1. STANDING OPEN QUEUE (Backlog): All unfulfilled requests opened on or before the end of the selected period
  const filteredRequestsBacklog = useMemo(() => {
    const windowEnd = (datePreset === 'CUSTOM' && customEndDate)
      ? new Date(customEndDate + 'T23:59:59')
      : asOfDate;

    return baseFilteredRequests.filter(r => {
      if (!r.isBacklog) return false;
      if (r.openedDate && r.openedDate > windowEnd) return false;
      return true;
    });
  }, [baseFilteredRequests, datePreset, customEndDate, asOfDate]);

  // 2. COMPLETED IN PERIOD (Closed Date Scope): Strictly Completed Requests closed within the selected date window
  const filteredRequestsCompleted = useMemo(() => {
    return baseFilteredRequests.filter(r => {
      if (!r.isCompleted) return false;
      return matchesDateRange(r.closedDate || r.openedDate, asOfDate);
    });
  }, [baseFilteredRequests, datePreset, customStartDate, customEndDate, asOfDate]);

  // 3. EFFECTIVE SLA DATASET (Completed in Period + Currently Open Past-Due Breaches)
  const filteredRequestsEffectiveSLA = useMemo(() => {
    const openBreaches = filteredRequestsBacklog.filter(r => r.isSLABreached);
    return [...filteredRequestsCompleted, ...openBreaches];
  }, [filteredRequestsCompleted, filteredRequestsBacklog]);

  // 4. CSAT DATASET (Survey Submitted Date or Closed Date Scope)
  const filteredRequestsCSAT = useMemo(() => {
    return baseFilteredRequests.filter(r => {
      if (!r.isCompleted && r.csatScore === null) return false;
      return matchesDateRange(r.surveyDate || r.closedDate || r.openedDate, asOfDate);
    });
  }, [baseFilteredRequests, datePreset, customStartDate, customEndDate, asOfDate]);

  // 5. COMBINED DATASET FOR DATA EXPLORER (Completed in Period + Standing Open Backlog, deduplicated)
  const filteredRequestsCombined = useMemo(() => {
    const map = new Map();
    filteredRequestsCompleted.forEach(r => map.set(r.id, r));
    filteredRequestsBacklog.forEach(r => map.set(r.id, r));
    return Array.from(map.values());
  }, [filteredRequestsCompleted, filteredRequestsBacklog]);

  return (
    <div className="dashboard-container">
      {/* Header & Drag-and-Drop Area */}
      <DropZoneHeader
        isDemoData={isDemoData}
        requestCount={processedRequests.length}
        surveyCount={rawSurveys.length}
        asOfDate={asOfDate}
        onDataLoaded={handleCustomDataLoaded}
        onResetDemo={loadDemoDataset}
      />

      {/* Global Filter Toolbar */}
      <FilterToolbar
        departments={departments}
        ownerGroups={ownerGroups}
        owners={availableOwners}
        requestTypes={availableRequestTypes}
        selectedDepts={selectedDepts}
        selectedGroups={selectedGroups}
        selectedOwners={selectedOwners}
        selectedTypes={selectedTypes}
        datePreset={datePreset}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onDeptToggle={handleDeptToggle}
        onSelectAllDepts={() => setSelectedDepts([])}
        onClearAllDepts={() => setSelectedDepts(['NONE'])}
        onGroupToggle={handleGroupToggle}
        onSelectAllGroups={() => setSelectedGroups([])}
        onClearAllGroups={() => setSelectedGroups(['NONE'])}
        onOwnerToggle={handleOwnerToggle}
        onSelectAllOwners={() => setSelectedOwners([])}
        onClearAllOwners={() => setSelectedOwners(['NONE'])}
        onTypeToggle={handleTypeToggle}
        onSelectAllTypes={() => setSelectedTypes([])}
        onClearAllTypes={() => setSelectedTypes(['NONE'])}
        onDatePresetChange={setDatePreset}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
        onResetFilters={handleResetFilters}
      />

      {/* Executive KPI Summary Banner */}
      <KPICards
        requestsBacklog={filteredRequestsBacklog}
        requestsCompleted={filteredRequestsCompleted}
        requestsCSAT={filteredRequestsCSAT}
      />

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'pareto' ? 'active' : ''}`}
          onClick={() => setActiveTab('pareto')}
        >
          <BarChart3 size={16} /> Pareto SLA Drivers
        </button>
        <button
          className={`tab-btn ${activeTab === 'csat' ? 'active' : ''}`}
          onClick={() => setActiveTab('csat')}
        >
          <Star size={16} /> CSAT Deep-Dive
        </button>
        <button
          className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          <Clock size={16} /> Backlog & Aging ({filteredRequestsBacklog.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <Table size={16} /> Data Explorer ({filteredRequestsCombined.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'pareto' && (
        <ParetoChart
          requestsEffectiveSLA={filteredRequestsEffectiveSLA}
          requestsCompleted={filteredRequestsCompleted}
        />
      )}

      {activeTab === 'csat' && (
        <CSATAnalysis requests={filteredRequestsCSAT} />
      )}

      {activeTab === 'backlog' && (
        <BacklogAnalysis requests={filteredRequestsBacklog} />
      )}

      {activeTab === 'explorer' && (
        <RequestDataTable requests={filteredRequestsCombined} />
      )}

      {/* Footer Info */}
      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Service Request & CSAT Business Data Analytics Dashboard • Operating locally via client-side HTML5 & IndexedDB
      </footer>
    </div>
  );
}
