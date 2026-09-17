import React, { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, Layers, ShieldAlert, RotateCcw, ChevronDown, Check, X, Building2, UserCheck, Tag, Clock } from 'lucide-react';

/**
 * Reusable Multi-Select Dropdown Component with Clean Multi-Line Text Display
 */
function MultiSelectDropdown({ label, icon: Icon, options, selectedValues, onToggle, onSelectAll, onClearAll, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeItems = selectedValues.filter(v => v !== 'NONE' && v !== 'ALL');
  const isNoneSelected = selectedValues.includes('NONE');
  const isAllSelected = !isNoneSelected && (selectedValues.length === 0 || selectedValues.includes('ALL') || activeItems.length === options.length);

  let displayLabel = `All ${placeholder}`;
  if (isNoneSelected || (activeItems.length === 0 && !isAllSelected)) {
    displayLabel = `0 ${placeholder} Selected`;
  } else if (!isAllSelected) {
    if (activeItems.length === 1) {
      displayLabel = activeItems[0];
    } else {
      displayLabel = `${activeItems.length} ${placeholder} Selected`;
    }
  }

  return (
    <div className="form-group" style={{ position: 'relative', zIndex: isOpen ? 9000 : 100 }} ref={dropdownRef}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Icon && <Icon size={12} />} {label}
      </label>

      <button
        type="button"
        className="select-input"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          background: '#ffffff',
          borderColor: isOpen ? 'var(--rva-navy)' : '#cbd5e1'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px', color: 'var(--rva-dark)' }}>
          {displayLabel}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          minWidth: '280px',
          marginTop: '6px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
          zIndex: 9999,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '320px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onSelectAll}
              style={{ background: 'none', border: 'none', color: 'var(--rva-navy)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={onClearAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>

          {options.map(opt => {
            const checked = isAllSelected || activeItems.includes(opt);

            return (
              <label
                key={opt}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.85rem',
                  color: 'var(--rva-dark)',
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: checked ? 'rgba(38, 70, 119, 0.08)' : 'transparent',
                  border: checked ? '1px solid rgba(38, 70, 119, 0.25)' : '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(opt)}
                  style={{ cursor: 'pointer', accentColor: 'var(--rva-navy)', width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }}
                />
                <span style={{ flex: 1, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.35', fontWeight: checked ? 600 : 400 }}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterToolbar({
  departments,
  ownerGroups,
  owners,
  requestTypes,
  selectedDepts,
  selectedGroups,
  selectedOwners,
  selectedTypes,
  datePreset,
  customStartDate,
  customEndDate,
  statusFilter,
  onDeptToggle,
  onSelectAllDepts,
  onClearAllDepts,
  onGroupToggle,
  onSelectAllGroups,
  onClearAllGroups,
  onOwnerToggle,
  onSelectAllOwners,
  onClearAllOwners,
  onTypeToggle,
  onSelectAllTypes,
  onClearAllTypes,
  onDatePresetChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onStatusFilterChange,
  onResetFilters
}) {
  return (
    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 100, overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rva-navy)', fontWeight: 700, fontSize: '0.9rem' }}>
          <Filter size={16} /> GLOBAL FILTER TOOLBAR
        </div>
        
        <button 
          onClick={onResetFilters} 
          className="btn btn-outline" 
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <RotateCcw size={13} /> Reset Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', position: 'relative', zIndex: 101 }}>
        
        {/* 1. Department Filter */}
        <MultiSelectDropdown
          label="Department"
          icon={Building2}
          options={departments}
          selectedValues={selectedDepts}
          onToggle={onDeptToggle}
          onSelectAll={onSelectAllDepts}
          onClearAll={onClearAllDepts}
          placeholder="Departments"
        />

        {/* 2. Unit Groups Filter */}
        <MultiSelectDropdown
          label="Unit Group"
          icon={Layers}
          options={ownerGroups}
          selectedValues={selectedGroups}
          onToggle={onGroupToggle}
          onSelectAll={onSelectAllGroups}
          onClearAll={onClearAllGroups}
          placeholder="Unit Groups"
        />

        {/* 3. Service Owner / Assignee Filter */}
        <MultiSelectDropdown
          label="Service Owner"
          icon={UserCheck}
          options={owners}
          selectedValues={selectedOwners}
          onToggle={onOwnerToggle}
          onSelectAll={onSelectAllOwners}
          onClearAll={onClearAllOwners}
          placeholder="Owners"
        />

        {/* 4. Service Request Type Filter */}
        <MultiSelectDropdown
          label="Request Type"
          icon={Tag}
          options={requestTypes}
          selectedValues={selectedTypes}
          onToggle={onTypeToggle}
          onSelectAll={onSelectAllTypes}
          onClearAll={onClearAllTypes}
          placeholder="Request Types"
        />

        {/* 5. Focus Category / Status */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} /> Focus Category
          </label>
          <select 
            className="select-input" 
            value={statusFilter} 
            onChange={(e) => onStatusFilterChange(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Active Backlog Only</option>
            <option value="BREACHED">SLA Breached Only (Closed + Open)</option>
            <option value="COMPLETED">Completed Requests</option>
          </select>
        </div>

        {/* 6. Date Range Presets */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> Date Range Filter
          </label>
          <select 
            className="select-input" 
            value={datePreset} 
            onChange={(e) => onDatePresetChange(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="ALL">All Time</option>
            <option value="LAST_MONTH">Last Month (July 2026)</option>
            <option value="LAST_QUARTER">Last Quarter (Q2 2026)</option>
            <option value="LAST_YEAR">Last 1 Year</option>
            <option value="CUSTOM">Custom Date Range...</option>
          </select>
        </div>
      </div>

      {/* Active Filter Pill Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '2px' }}>
        {selectedDepts.filter(v => v !== 'NONE' && v !== 'ALL').length > 0 && (
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            Depts: {selectedDepts.filter(v => v !== 'NONE' && v !== 'ALL').join(', ')}
            <X size={11} style={{ cursor: 'pointer' }} onClick={onSelectAllDepts} />
          </span>
        )}
        {selectedGroups.filter(v => v !== 'NONE' && v !== 'ALL').length > 0 && (
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            Units: {selectedGroups.filter(v => v !== 'NONE' && v !== 'ALL').join(', ')}
            <X size={11} style={{ cursor: 'pointer' }} onClick={onSelectAllGroups} />
          </span>
        )}
        {selectedOwners.filter(v => v !== 'NONE' && v !== 'ALL').length > 0 && (
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            Owners: {selectedOwners.filter(v => v !== 'NONE' && v !== 'ALL').join(', ')}
            <X size={11} style={{ cursor: 'pointer' }} onClick={onSelectAllOwners} />
          </span>
        )}
        {selectedTypes.filter(v => v !== 'NONE' && v !== 'ALL').length > 0 && (
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            Types: {selectedTypes.filter(v => v !== 'NONE' && v !== 'ALL').length} selected
            <X size={11} style={{ cursor: 'pointer' }} onClick={onSelectAllTypes} />
          </span>
        )}
      </div>

      {/* Custom Date Pickers when CUSTOM date preset selected */}
      {datePreset === 'CUSTOM' && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date</label>
            <input 
              type="date" 
              className="text-input" 
              value={customStartDate} 
              onChange={(e) => onCustomStartDateChange(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">End Date</label>
            <input 
              type="date" 
              className="text-input" 
              value={customEndDate} 
              onChange={(e) => onCustomEndDateChange(e.target.value)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
