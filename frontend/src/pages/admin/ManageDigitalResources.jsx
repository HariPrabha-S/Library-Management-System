import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ExternalLink, Eye, FileText, Search, XCircle } from 'lucide-react';
import { FiFileText } from 'react-icons/fi';
import DigitalResourceReports from './components/DigitalResourceReports';

const statuses = ['Pending', 'Approved', 'Rejected', 'All'];
const resourceTypes = ['All', 'Journal', 'E-Book', 'Research Paper', 'Video Lecture', 'Other'];

const ManageDigitalResources = () => {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [type, setType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('status', status);
      if (type !== 'All') params.set('type', type);
      if (searchTerm.trim()) params.set('q', searchTerm.trim());

      const res = await fetch(`/api/admin/resources?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'Failed to fetch digital resources');
      }
      const data = await res.json();
      setResources(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch every resource (no status/type filter) once for the report modal
  const fetchAllResources = async () => {
    try {
      const params = new URLSearchParams();
      params.set('status', 'All');
      const res = await fetch(`/api/admin/resources?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setAllResources(data);
    } catch (_) {
      // non-critical — report modal will fall back to filtered list
    }
  };

  useEffect(() => {
    fetchResources();
  }, [status, type]);

  // Load full list once on mount for the report modal
  useEffect(() => {
    fetchAllResources();
  }, []);

  const filteredResources = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return resources.filter(resource =>
      (resource.title || '').toLowerCase().includes(term) ||
      (resource.resource_type || resource.type || '').toLowerCase().includes(term)
    );
  }, [resources, searchTerm]);

  const doAction = async (id, action) => {
    try {
      setActionMessage('');
      const admin = JSON.parse(localStorage.getItem('user') || 'null');
      const res = await fetch(`/api/admin/resources/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin?.id || null })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Action failed');
      setActionMessage(payload.message || `Resource ${action}d`);
      setSelectedResource(null);
      await fetchResources();
    } catch (e) {
      setError(e.message || 'Action failed');
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this digital resource?')) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Delete failed');
      setActionMessage('Resource deleted');
      setSelectedResource(null);
      await fetchResources();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  const getResourceId = (resource) => resource.digital_resource_id || resource.id;
  const getResourceUrl = (resource) => resource.file_url || resource.fileUrl || resource.file_path || resource.filePath;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Digital Resources</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Review faculty submissions before they appear to students and faculty.</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-semibold text-xs cursor-pointer shadow-sm active:scale-95"
          style={{ whiteSpace: 'nowrap' }}
        >
          <FiFileText size={14} /> Generate Report
        </button>
      </div>

      <div className="panel" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 180px 200px', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 34 }}
              placeholder="Search by title or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            {resourceTypes.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          {actionMessage}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No digital resources found.</div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map(resource => {
                  const resourceId = getResourceId(resource);
                  const resourceUrl = getResourceUrl(resource);
                  return (
                    <tr key={resourceId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={18} color="var(--primary-color)" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{resource.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{resource.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{resource.resource_type || resource.type}</td>
                      <td>{resource.uploaded_by?.name || resource.uploaded_by_faculty_id || 'Library'}</td>
                      <td><span className="badge badge-secondary">{resource.approval_status}</span></td>
                      <td>{resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn btn-icon" title="View details" onClick={() => setSelectedResource(resource)}>
                            <Eye size={16} />
                          </button>
                          {resourceUrl && (
                            <button className="btn btn-icon" title="Open resource" onClick={() => window.open(resourceUrl, '_blank', 'noopener,noreferrer')}>
                              <ExternalLink size={16} />
                            </button>
                          )}
                          {resource.approval_status !== 'Approved' && (
                            <button className="btn btn-primary" onClick={() => doAction(resourceId, 'approve')}>
                              <CheckCircle size={16} /> Approve
                            </button>
                          )}
                          {resource.approval_status !== 'Rejected' && (
                            <button className="btn btn-outline" onClick={() => doAction(resourceId, 'reject')}>
                              <XCircle size={16} /> Reject
                            </button>
                          )}
                          <button className="btn btn-danger" onClick={() => deleteResource(resourceId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResource && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 560, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedResource.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{selectedResource.resource_type || selectedResource.type}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedResource(null)}>Close</button>
            </div>
            <div style={{ display: 'grid', gap: 12, color: 'var(--text-secondary)' }}>
              <p><strong>Description:</strong> {selectedResource.description || 'No description provided'}</p>
              <p><strong>Status:</strong> {selectedResource.approval_status}</p>
              <p><strong>Uploaded by:</strong> {selectedResource.uploaded_by?.name || selectedResource.uploaded_by_faculty_id || 'Library'}</p>
              <p><strong>Resource:</strong> {getResourceUrl(selectedResource) || 'No link provided'}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              {getResourceUrl(selectedResource) && (
                <button className="btn btn-outline" onClick={() => window.open(getResourceUrl(selectedResource), '_blank', 'noopener,noreferrer')}>
                  <ExternalLink size={16} /> Open
                </button>
              )}
              {selectedResource.approval_status !== 'Approved' && (
                <button className="btn btn-primary" onClick={() => doAction(getResourceId(selectedResource), 'approve')}>Approve</button>
              )}
              {selectedResource.approval_status !== 'Rejected' && (
                <button className="btn btn-outline" onClick={() => doAction(getResourceId(selectedResource), 'reject')}>Reject</button>
              )}
            </div>
          </div>
        </div>
      )}

      <DigitalResourceReports
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        resources={allResources.length > 0 ? allResources : resources}
      />
    </div>
  );
};

export default ManageDigitalResources;
