import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, BookOpen, CalendarDays, RefreshCw, Layers, AlertCircle, Ban } from 'lucide-react';

const statusConfig = {
  Pending: { class: 'badge-warning', icon: Clock, label: 'Pending' },
  Approved: { class: 'badge-success', icon: CheckCircle, label: 'Approved' },
  Rejected: { class: 'badge-danger', icon: XCircle, label: 'Rejected' },
  Waiting: { class: 'badge-warning', icon: Clock, label: 'Waiting in Queue' },
  'Ready for Pickup': { class: 'badge-success', icon: CheckCircle, label: 'Ready for Pickup' },
  Completed: { class: 'badge-success', icon: CheckCircle, label: 'Completed' },
  Expired: { class: 'badge-danger', icon: AlertCircle, label: 'Expired' },
  Cancelled: { class: 'badge-neutral', icon: Ban, label: 'Cancelled' }
};

const Requests = ({ user }) => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [requests, setRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentRollNo = user?.studentId || loggedInUser.studentId || '921021205001';
  const memberId = user?.id || loggedInUser.id || 1;

  const fetchData = useCallback((showLoader = false) => {
    if (showLoader) setLoading(true);
    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch Book Requests
    fetch(`/api/requests/${studentRollNo}`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(r => ({
          ...r,
          requestDate: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : ''
        })) : [];
        setRequests(formatted);
      })
      .catch(err => console.error('Requests fetch error:', err));

    // 2. Fetch My Reservations
    fetch(`/api/reservations/my-reservations?memberId=${memberId}&memberType=Student`, { headers: authHeaders })
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setReservations(res.data);
        }
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        console.error('Reservations fetch error:', err);
        setLoading(false);
      });
  }, [studentRollNo, memberId]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reservations/cancel/${reservationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ memberId, memberType: 'Student' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Reservation cancelled successfully.');
        fetchData(true);
      } else {
        alert(data.message || 'Failed to cancel reservation.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Could not cancel reservation.');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('reservations')}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: activeTab === 'reservations' ? 'var(--primary-color)' : 'white',
              color: activeTab === 'reservations' ? 'white' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            My Reservations Queue ({reservations.filter(r => r.status === 'Waiting' || r.status === 'Ready for Pickup').length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: activeTab === 'requests' ? 'var(--primary-color)' : 'white',
              color: activeTab === 'requests' ? 'white' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            Book Requests ({requests.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated: {lastUpdated}</span>}
          <button
            onClick={() => fetchData(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {activeTab === 'reservations' ? (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">My Book Reservation Queue</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading reservations...</div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>Book Title</th>
                    <th>Reservation Date</th>
                    <th>Queue Position</th>
                    <th>Status</th>
                    <th>Pickup Expiry</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((resv, i) => {
                    const cfg = statusConfig[resv.status] || statusConfig.Waiting;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={resv.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, background: '#f0f2f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <BookOpen size={15} color="var(--primary-color)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{resv.bookTitle}</div>
                              {resv.author && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {resv.author}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <CalendarDays size={13} color="var(--text-muted)" />
                            {resv.reservationDate ? new Date(resv.reservationDate).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td>
                          {resv.status === 'Waiting' ? (
                            <span style={{ fontWeight: 700, color: 'var(--primary-color)', background: 'rgba(1,137,141,0.1)', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem' }}>
                              {resv.queuePosition}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${cfg.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <StatusIcon size={12} />
                            {resv.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: resv.status === 'Ready for Pickup' ? 'var(--success)' : 'var(--text-muted)', fontWeight: resv.status === 'Ready for Pickup' ? 600 : 400 }}>
                            {resv.pickupExpiry ? new Date(resv.pickupExpiry).toLocaleString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          {resv.canCancel ? (
                            <button
                              onClick={() => handleCancelReservation(resv.id)}
                              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active or past book reservations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Book Requests</h3>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Book Name</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => {
                  const cfg = statusConfig[req.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={req.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, background: '#f0f2f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BookOpen size={15} color="var(--text-muted)" />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{req.bookName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                          <CalendarDays size={13} color="var(--text-muted)" />
                          {req.requestDate}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cfg.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No book requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
