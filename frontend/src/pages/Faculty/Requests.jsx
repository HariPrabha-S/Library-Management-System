import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, BookOpen, CalendarDays } from 'lucide-react';


const statusConfig = {
  Pending:  { class: 'badge-warning',   icon: Clock,        label: 'Pending',  color: '#b45309' },
  Approved: { class: 'badge-success',   icon: CheckCircle,  label: 'Approved', color: 'var(--success)' },
  Rejected: { class: 'badge-danger',    icon: XCircle,      label: 'Rejected', color: 'var(--danger)' },
};

const Requests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');

  useEffect(() => {
    if (!user?.facultyId) return;
    setLoading(true);
    fetch(`http://localhost:5001/api/requests/${user.facultyId}`)
      .then(r => r.json())
      .then(data => { 
        const formatted = data.map(r => ({
          ...r,
          requestDate: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : ''
        }));
        setRequests(formatted); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error('Requests fetch error:', err);
        setLoading(false);
      });
  }, [user?.facultyId]);

  const counts = {
    Pending:  requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="animate-fade-in">
      {/* Status Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pending',  count: counts.Pending,  icon: Clock,       bg: 'rgba(245,158,11,0.1)',   color: '#d97706' },
          { label: 'Approved', count: counts.Approved, icon: CheckCircle, bg: 'var(--success-light)',   color: 'var(--success)' },
          { label: 'Rejected', count: counts.Rejected, icon: XCircle,     bg: 'var(--danger-light)',    color: 'var(--danger)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setFilter(s.label)}
            >
              <div style={{ width: 46, height: 46, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: "'Inter',sans-serif", color: 'var(--text-primary)' }}>{s.count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Book Requests &amp; Reservations</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button
                key={f}
                className="btn btn-sm"
                onClick={() => setFilter(f)}
                id={`req-filter-${f.toLowerCase()}`}
                style={{
                  background: filter === f ? 'var(--primary-color)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${filter === f ? 'var(--primary-color)' : 'var(--border)'}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book Name</th>
                  <th>Library</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
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
                        <span className={req.library === 'Main' ? 'badge badge-primary' : 'badge badge-secondary'}>
                          {req.library} Library
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                          <CalendarDays size={13} color="var(--text-muted)" />
                          {req.requestDate}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cfg.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
