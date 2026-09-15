import React, { useState } from 'react';
import { Search, FileText, X, CheckCircle, AlertTriangle, Star, Calendar, User, Shield } from 'lucide-react';

export default function RequestDataTable({ requests }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredRequests = requests.filter(r => {
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Service Requests Explorer</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredRequests.length} total records down to individual service requests.
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="text-input"
            placeholder="Search request #, unit, type, owner..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Unit Group</th>
              <th>Request Type</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA Breach Status</th>
              <th>CSAT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No service requests matching current filters and search query.
                </td>
              </tr>
            ) : (
              paginatedRequests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>#{r.id}</td>
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
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '680px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-blue)' }}>Service Request #{selectedRecord.id}</h3>
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
                <strong style={{ color: 'var(--text-dim)' }}>Service Owner Group (Unit):</strong>
                <div>{selectedRecord.ownerGroup}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)' }}>Service Owner (Assignee):</strong>
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
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginTop: '4px', fontSize: '0.875rem' }}>
                  {selectedRecord.description}
                </div>
              </div>
            )}

            {/* Survey Details section */}
            <div style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--accent-purple)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} /> Survey Responses & Feedback
              </h4>

              {selectedRecord.csatScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Overall Rating: {selectedRecord.csatScore} / 5.0</span>
                  </div>
                  {selectedRecord.comments && selectedRecord.comments.length > 0 && (
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', borderLeft: '3px solid var(--accent-purple)', padding: '10px 14px', fontSize: '0.875rem', fontStyle: 'italic' }}>
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
