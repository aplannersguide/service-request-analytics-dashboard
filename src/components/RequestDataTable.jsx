import React, { useState } from 'react';
import { Search, FileText, X, CheckCircle, AlertTriangle, Star, ShieldAlert } from 'lucide-react';

export default function RequestDataTable({ requests }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'COMPLETED' && !r.isCompleted) return false;
    if (statusFilter === 'BACKLOG' && !r.isBacklog) return false;
    if (statusFilter === 'BREACHED' && !r.isSLABreached) return false;
    if (statusFilter === 'OPEN_BREACH' && r.breachType !== 'Open Breach') return false;
    if (statusFilter === 'HIGH_FOLLOWUP' && (r.followUps || 0) < 2) return false;

    const term = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.serviceType.toLowerCase().includes(term) ||
      r.ownerGroup.toLowerCase().includes(term) ||
      r.owner.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Service Requests Explorer</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--rva-navy)', background: 'rgba(38, 70, 119, 0.08)', padding: '2px 7px', borderRadius: '10px', border: '1px solid rgba(38, 70, 119, 0.2)', fontWeight: 600 }}>
              📅 Combined Dataset (Completed in Window + Standing Open Queue)
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Showing {filteredRequests.length} matching records across completed requests and standing backlog.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Local Status / Focus Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} style={{ color: 'var(--rva-navy)' }} />
            <select
              className="select-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: '6px 10px', fontSize: '0.825rem', cursor: 'pointer' }}
            >
              <option value="ALL">All Records ({requests.length})</option>
              <option value="COMPLETED">Completed Only</option>
              <option value="BACKLOG">Standing Backlog Only</option>
              <option value="BREACHED">All SLA Breaches (Closed + Open)</option>
              <option value="OPEN_BREACH">Open Overdue Breaches Only</option>
              <option value="HIGH_FOLLOWUP">High Follow-Ups (2+)</option>
            </select>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="text-input"
              placeholder="Search request #, owner group, type, owner..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Owner Group</th>
              <th>Service Request Type</th>
              <th>Service Owner</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Follow-Ups</th>
              <th>SLA Breach Status</th>
              <th>CSAT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No service requests matching current filters and search query.
                </td>
              </tr>
            ) : (
              paginatedRequests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--rva-navy)' }}>#{r.id}</td>
                  <td>{r.ownerGroup}</td>
                  <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.serviceType}>
                    {r.serviceType}
                  </td>
                  <td>{r.owner}</td>
                  <td>
                    <span className={`badge ${r.priority === 'Critical' ? 'badge-danger' : r.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${(r.followUps || 0) >= 2 ? 'badge-danger' : 'badge-info'}`}>
                      {r.followUps || 0}
                    </span>
                  </td>
                  <td>
                    {r.isSLABreached ? (
                      <span className="badge badge-danger">
                        <AlertTriangle size={12} /> {r.breachType}
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <CheckCircle size={12} /> {r.breachType}
                      </span>
                    )}
                  </td>
                  <td>
                    {r.csatScore ? (
                      <span className={`badge ${r.csatScore >= 4 ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={11} fill="currentColor" /> {r.csatScore}/5
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setSelectedRecord(r)}
                    >
                      <FileText size={13} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Page {currentPage} of {totalPages}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '680px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--rva-navy)' }}>Service Request #{selectedRecord.id}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedRecord.serviceType}</span>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Department:</strong>
                <div>{selectedRecord.department}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Owner Group:</strong>
                <div>{selectedRecord.ownerGroup}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Service Owner:</strong>
                <div>{selectedRecord.owner}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Priority:</strong>
                <div>{selectedRecord.priority}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Service Status:</strong>
                <div>{selectedRecord.status}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Follow-Up Count:</strong>
                <div style={{ fontWeight: 700, color: (selectedRecord.followUps || 0) >= 2 ? 'var(--rva-red)' : 'var(--rva-dark)' }}>
                  🔄 {selectedRecord.followUps || 0} Follow-up{(selectedRecord.followUps || 0) === 1 ? '' : 's'}
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Opened Date:</strong>
                <div>{selectedRecord.openedDate ? selectedRecord.openedDate.toLocaleString() : 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Due Date:</strong>
                <div>{selectedRecord.dueDate ? selectedRecord.dueDate.toLocaleString() : 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Closed Date:</strong>
                <div>{selectedRecord.closedDate ? selectedRecord.closedDate.toLocaleString() : 'Not Closed (Backlog)'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>SLA Compliance:</strong>
                <div style={{ color: selectedRecord.isSLABreached ? 'var(--status-danger)' : 'var(--status-success)', fontWeight: 700 }}>
                  {selectedRecord.breachType}
                </div>
              </div>
            </div>

            {selectedRecord.description && (
              <div>
                <strong style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Description:</strong>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginTop: '4px', fontSize: '0.875rem', color: 'var(--rva-dark)' }}>
                  {selectedRecord.description}
                </div>
              </div>
            )}

            {/* Survey Details section */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--rva-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} /> Survey Responses & Feedback
              </h4>

              {selectedRecord.csatScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rva-dark)' }}>
                      Composite CSAT: {selectedRecord.csatScore} / 5.0
                    </span>
                    {selectedRecord.csatDimensions && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                        <span className="badge badge-info">Overall: {selectedRecord.csatDimensions.overall ?? 'N/A'}/5</span>
                        <span className="badge badge-info">Process Explanation: {selectedRecord.csatDimensions.explanation ?? 'N/A'}/5</span>
                        <span className="badge badge-info">Service Quality: {selectedRecord.csatDimensions.quality ?? 'N/A'}/5</span>
                      </div>
                    )}
                  </div>
                  {selectedRecord.comments && selectedRecord.comments.length > 0 && (
                    <div style={{ background: '#f0f4f8', borderLeft: '3px solid var(--rva-navy)', padding: '10px 14px', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--rva-dark)' }}>
                      "{selectedRecord.comments.join(' ')}"
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No customer satisfaction survey submitted for this service request.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedRecord(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
