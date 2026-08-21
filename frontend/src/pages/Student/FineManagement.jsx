import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, BookOpen, Info } from 'lucide-react';


const FineManagement = ({ user }) => {
  const [data, setData] = useState({ details: [], history: [], totalFine: 0, paidFine: 0, unpaidFine: 0 });
  const [loading, setLoading] = useState(true);

  const fetchFines = () => {
    if (!user?.studentId) {
      setData({ details: [], history: [], totalFine: 0, paidFine: 0, unpaidFine: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/borrowing-info/${encodeURIComponent(user.studentId)}`)
      .then(r => {
        if (!r.ok) throw new Error('Unable to load fine information');
        return r.json();
      })
      .then((result) => {
        const fineRecords = Array.isArray(result.fines) ? result.fines : [];
        const details = fineRecords.filter(f => f.status !== 'Paid').map(f => {
          const reason = f.reason || '';
          const isLost = reason.toLowerCase().startsWith('lost book');
          // Extract overdue days from reason like "Late Return - 5 days"
          let daysOverdue = 0;
          if (!isLost) {
            const match = reason.match(/(\d+)\s*days?/i);
            if (match) daysOverdue = parseInt(match[1], 10);
          }
          return {
            id: f.id,
            title: f.Issue?.Book?.title || f.title || 'Unknown Book',
            reason,
            isLost,
            daysOverdue,
            finePerDay: isLost ? null : 1,
            totalFine: parseFloat(f.amount || 0),
            status: f.status || 'Pending'
          };
        });
        const history = fineRecords.filter(f => f.status === 'Paid').map(f => ({
          id: f.id,
          title: f.Issue?.Book?.title || f.title || 'Unknown Book',
          reason: f.reason || '',
          totalFine: parseFloat(f.amount || 0),
          paidDate: f.updatedAt ? new Date(f.updatedAt).toISOString().split('T')[0] : '',
          status: 'Paid'
        }));

        const totalFine = details.reduce((sum, fine) => sum + fine.totalFine, 0);
        const paidFine = history.reduce((sum, fine) => sum + fine.totalFine, 0);

        setData({ totalFine, paidFine, unpaidFine: totalFine, details, history });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fine fetch error:', err);
        setData({ details: [], history: [], totalFine: 0, paidFine: 0, unpaidFine: 0 });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFines();
  }, [user?.studentId]);

  const unpaidFines = data.details?.filter(f => f.status === 'Pending') || [];
  const effectiveTotal = unpaidFines.reduce((sum, f) => sum + parseFloat(f.totalFine), 0);

  return (
    <div className="animate-fade-in">
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Fine', value: `₹${data.totalFine}`, icon: DollarSign, color: 'var(--danger)', bg: 'var(--danger-light)' },
          { label: 'Pending', value: `₹${effectiveTotal}`, icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Paid', value: `₹${data.paidFine}`, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending Fines', value: unpaidFines.length, icon: BookOpen, color: 'var(--primary-color)', bg: 'var(--primary-light)' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, background: c.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={c.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Inter',sans-serif" }}>{c.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outstanding balance info banner (view-only, no pay button) */}
      {unpaidFines.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #790c0c, #a01010)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(121,12,12,0.2)',
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Outstanding Balance</p>
            <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>₹{effectiveTotal}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
            <Info size={16} color="rgba(255,255,255,0.8)" />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>Contact library admin to clear fines</span>
          </div>
        </div>
      )}

      {/* Fine Details Table (view-only) */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h3 className="panel-title">Fine Details</h3>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Reason</th>
                <th>Total Fine</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.details?.map((fine) => (
                <tr key={fine.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BookOpen size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{fine.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                    {fine.isLost ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Lost Book (3× price)</span>
                    ) : (
                      <span>{fine.daysOverdue} day{fine.daysOverdue !== 1 ? 's' : ''} overdue × ₹1/day</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>₹{fine.totalFine}</span>
                  </td>
                  <td>
                    <span className="badge badge-warning"><Clock size={12} /> Pending</span>
                  </td>
                </tr>
              ))}
              {(!data.details || data.details.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={28} color="var(--success)" style={{ margin: '0 auto 8px', display: 'block' }} />
                    No outstanding fines!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fine History */}
      {data.history && data.history.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Payment History</h3>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr><th>Book</th><th>Reason</th><th>Amount</th><th>Paid Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{h.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{h.reason}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{h.totalFine}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{h.paidDate}</td>
                    <td><span className="badge badge-success"><CheckCircle size={11} /> Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;
