import React, { useState } from 'react';
import { UploadCloud, RefreshCw, Database, FileSpreadsheet, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { readFileAsText, parseRawCSVText } from '../services/dataParser';

export default function DropZoneHeader({ isDemoData, requestCount, surveyCount, onDataLoaded, onResetDemo }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processUploadedFiles(files);
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    await processUploadedFiles(files);
  };

  const processUploadedFiles = async (files) => {
    setLoading(true);
    setUploadStatus(null);

    let requestsData = null;
    let surveysData = null;

    try {
      for (const file of files) {
        const text = await readFileAsText(file);
        const parsed = parseRawCSVText(text);
        const fileName = file.name.toLowerCase();
        
        // Flexible column check
        const firstRow = parsed[0] || {};
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());

        const isSurvey = fileName.includes('survey') || 
                         keys.includes('question') || 
                         keys.includes('answer') || 
                         keys.includes('response') || 
                         keys.includes('rating');

        const isRequest = fileName.includes('request') || 
                          keys.includes('service request type') || 
                          keys.includes('service_request_type') || 
                          keys.includes('service status') || 
                          keys.includes('due date');

        if (isSurvey) {
          surveysData = parsed;
        } else if (isRequest || !isSurvey) {
          requestsData = parsed;
        }
      }

      if (!requestsData && !surveysData) {
        setUploadStatus({ 
          type: 'error', 
          message: 'Could not recognize CSV structure. Please drop Service Requests.csv and/or Service Request Surveys.csv.' 
        });
      } else {
        onDataLoaded(requestsData, surveysData);
        setUploadStatus({ 
          type: 'success', 
          message: `Loaded: ${requestsData ? requestsData.length + ' Service Requests ' : ''}${surveysData ? surveysData.length + ' Survey Entries' : ''}`
        });
      }
    } catch (err) {
      console.error(err);
      setUploadStatus({ type: 'error', message: 'Failed to process uploaded CSV files: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Service Request Analytics</h1>
            {isDemoData ? (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={13} /> Demo Dataset Active
              </span>
            ) : (
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={13} /> Custom Data Loaded
              </span>
            )}

            {/* Counts Badge */}
            <span style={{ fontSize: '0.8rem', color: 'var(--rva-navy)', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
              📊 {requestCount} Requests • 💬 {surveyCount} Surveys
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Root-cause driver diagnostics for Customer Satisfaction (CSAT), SLA compliance breaches, and active backlog.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isDemoData && (
            <button className="btn btn-outline" onClick={onResetDemo} title="Reset to interactive demo dataset">
              <RefreshCw size={15} /> Reset to Demo
            </button>
          )}
        </div>
      </div>

      {/* Interactive Drop Zone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed var(--rva-navy)' : '2px dashed #cbd5e1',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          background: isDragging ? 'rgba(38, 70, 119, 0.08)' : '#f8fafc',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: '16px',
          transition: 'var(--transition-smooth)',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('csv-file-input').click()}
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv,.tsv,.txt"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(38, 70, 119, 0.08)',
            padding: '10px',
            borderRadius: '10px',
            color: 'var(--rva-navy)'
          }}>
            <UploadCloud size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {loading ? 'Processing UTF-16 / UTF-8 CSV Files...' : 'Drop Service Requests.csv and/or Service Request Surveys.csv here'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select both files at once or drop individually. Auto-detects UTF-16/UTF-8 & tab/comma delimiters.
            </div>
          </div>
        </div>

        <button className="btn btn-outline" style={{ pointerEvents: 'none', fontSize: '0.8rem' }}>
          <FileSpreadsheet size={14} /> Select Files
        </button>
      </div>

      {uploadStatus && (
        <div className={`badge ${uploadStatus.type === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          {uploadStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {uploadStatus.message}
        </div>
      )}
    </header>
  );
}
