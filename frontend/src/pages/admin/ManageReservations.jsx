import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Ban, Filter, Search, Calendar, RefreshCw, Eye, BookOpen, User, Layers, CheckSquare } from 'lucide-react';

const statusConfig = {
  Waiting: { class: 'badge-warning', icon: Clock, label: 'Waiting in Queue', color: '#d97706' },
  'Ready for Pickup': { class: 'badge-success', icon: CheckCircle, label: 'Ready for Pickup', color: '#059669' },
  Completed: { class: 'badge-neutral', icon: CheckSquare, label: 'Completed (Issued)', color: '#2563eb' },
  Expired: { class: 'badge-danger', icon: AlertCircle, label: 'Expired', color: '#dc2626' },
  Cancelled: { class: 'badge-neutral', icon: Ban, label: 'Cancelled', color: '#6b7280' }
};

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMemberType, setFilterMemberType] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Queue View Modal
  const [queueModalBook, setQueueModalBook] = useState(null);

  const fetchAdminReservations = useCallback((showLoader = false) => {
    if (showLoader) setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'All') params.append('status', filterStatus);
    if (filterMemberType !== 'All') params.append('memberType', filterMemberType);
    if (filterDepartment !== 'All') params.append('department', filterDepartment);
    if (searchTerm) params.append('search', searchTerm);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    fetch(`/api/admin/reservations/admin-list?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setReservations(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Admin reservations fetch error:', err);
        setLoading(false);
      });
  }, [filterStatus, filterMemberType, filterDepartment, searchTerm, fromDate, toDate]);

  useEffect(() => {
    fetchAdminReservations(true);
  }, [fetchAdminReservations]);

  const handleMarkCollected = async (resvId) => {
    if (!window.confirm('Mark this reserved book as collected and issue it to the member?')) return;
    try {
      const res = await fetch(`/api/admin/reservations/collect/${resvId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Book collected and issued successfully!');
        fetchAdminReservations(true);
      } else {
        alert(data.message || 'Failed to complete collection.');
      }
    } catch (err) {
      console.error('Collection error:', err);
      alert('Could not complete collection.');
    }
  };

  const handleCancelReservation = async (resvId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await fetch(`/api/admin/reservations/cancel/${resvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Reservation cancelled and queue advanced successfully.');
        fetchAdminReservations(true);
      } else {
        alert(data.message || 'Failed to cancel reservation.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Could not cancel reservation.');
    }
  };

  const counts = {
    Waiting: reservations.filter(r => r.status === 'Waiting').length,
    Ready: reservations.filter(r => r.status === 'Ready for Pickup').length,
    Completed: reservations.filter(r => r.status === 'Completed').length,
    Expired: reservations.filter(r => r.status === 'Expired').length,
  };

  // Queue View Modal Data
  const queueBookReservations = queueModalBook
    ? reservations.filter(r => r.bookId === queueModalBook.id && r.status === 'Waiting')
        .sort((a, b) => a.queuePosition - b.queuePosition)
    : [];

  return (
    <div className="animate-fade-in">
      {/* Metric Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Waiting in Queue', count: counts.Waiting, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
          { label: 'Ready for Pickup', count: counts.Ready, icon: CheckCircle, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Completed (Issued)', count: counts.Completed, icon: CheckSquare, bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
          { label: 'Expired Reservations', count: counts.Expired, icon: AlertCircle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Action Panel */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search member, roll no, or book..."
                style={{ paddingLeft: 38, width: '100%' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select className="form-input form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Member Type Filter */}
            <select className="form-input form-select" style={{ width: 140 }} value={filterMemberType} onChange={e => setFilterMemberType(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>

            {/* Department Filter */}
            <select className="form-input form-select" style={{ width: 140 }} value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
              <option value="All">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => fetchAdminReservations(true)} style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>
      </div>

      {/* Main Reservations Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Book Reservations Queue Management</h3>
        </div>

        {loading ? (
          <div style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>Loading reservations list...</div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Resv ID</th>
                  <th>Member Name</th>
                  <th>Type</th>
                  <th>Book Title</th>
                  <th>Queue Pos</th>
                  <th>Resv Date</th>
                  <th>Pickup Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => {
                  const cfg = statusConfig[resv.status] || statusConfig.Waiting;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={resv.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>#RESV-{resv.id}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{resv.memberName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{resv.memberIdentifier} ({resv.department || 'N/A'})</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${resv.memberType === 'Faculty' ? 'badge-primary' : 'badge-neutral'}`}>
                          {resv.memberType}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{resv.bookTitle}</div>
                        {resv.accessionNo !== '-' && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Copy: {resv.accessionNo}</div>}
                      </td>
                      <td>
                        {resv.status === 'Waiting' ? (
                          <span style={{ fontWeight: 700, color: 'var(--primary-color)', background: 'rgba(1,137,141,0.1)', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem' }}>
                            #{resv.queuePosition}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {resv.reservationDate ? new Date(resv.reservationDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: resv.status === 'Ready for Pickup' ? 'var(--success)' : 'var(--text-muted)', fontWeight: resv.status === 'Ready for Pickup' ? 600 : 400 }}>
                        {resv.pickupExpiry ? new Date(resv.pickupExpiry).toLocaleString() : '-'}
                      </td>
                      <td>
                        <span className={`badge ${cfg.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon size={12} />
                          {resv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {resv.status === 'Ready for Pickup' && (
                            <button
                              onClick={() => handleMarkCollected(resv.id)}
                              style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                              title="Mark as Collected (Issue Book)"
                            >
                              Issue Book
                            </button>
                          )}
                          <button
                            onClick={() => setQueueModalBook({ id: resv.bookId, title: resv.bookTitle })}
                            style={{ background: '#f0f2f5', color: 'var(--text-secondary)', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            title="View Queue"
                          >
                            <Eye size={13} /> Queue
                          </button>
                          {(resv.status === 'Waiting' || resv.status === 'Ready for Pickup') && (
                            <button
                              onClick={() => handleCancelReservation(resv.id)}
                              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                              title="Cancel Reservation"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No book reservations match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FIFO Queue View Modal */}
      {queueModalBook && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setQueueModalBook(null)}>
          <div className="panel animate-slide-up" style={{ maxWidth: 600, width: '90%', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                FIFO Waiting Queue: {queueModalBook.title}
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setQueueModalBook(null)}>✕</button>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Queue Pos</th>
                    <th>Member Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Reservation Date</th>
                  </tr>
                </thead>
                <tbody>
                  {queueBookReservations.map(q => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>#{q.queuePosition}</td>
                      <td style={{ fontWeight: 600 }}>{q.memberName} ({q.memberIdentifier})</td>
                      <td><span className="badge badge-neutral">{q.memberType}</span></td>
                      <td>{q.department || 'N/A'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(q.reservationDate).toLocaleString()}</td>
                    </tr>
                  ))}
                  {queueBookReservations.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No members currently waiting in queue for this book.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservations;
