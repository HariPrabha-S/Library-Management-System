import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, BookOpen, CreditCard } from 'lucide-react';


const FineManagement = ({ user }) => {
  const [data, setData]   = useState({ details: [], history: [], totalFine: 0, paidFine: 0, unpaidFine: 0 });
  const [loading, setLoading] = useState(true);
  const [paidIds, setPaidIds] = useState([]);

  const fetchFines = () => {
    if (!user?.studentId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/fines/${user.studentId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchFines();
  }, [user?.studentId]);

  const handlePay = (fineId, amount) => {
    fetch('http://localhost:5000/api/fines/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fineId }),
    })
    .then(r => r.json())
    .then(() => {
      setPaidIds(prev => [...prev, fineId]);
      alert('Payment successful!');
      fetchFines(); // Refresh to update summary cards
    })
    .catch(() => alert('Payment failed.'));
  };

  const unpaidFines = data.details?.filter(f => f.status === 'Unpaid' && !paidIds.includes(f.id)) || [];
  const effectiveTotal = unpaidFines.reduce((sum, f) => sum + parseFloat(f.totalFine), 0);

  return (
    <div className="animate-fade-in">
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Fine',    value: `₹${data.totalFine}`, icon: DollarSign, color: 'var(--danger)',   bg: 'var(--danger-light)' },
          { label: 'Unpaid',        value: `₹${effectiveTotal}`,  icon: AlertCircle, color: '#f59e0b',       bg: 'rgba(245,158,11,0.1)' },
          { label: 'Paid',          value: `₹${data.paidFine}`,  icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Overdue Books', value: data.details?.filter(f => f.status === 'Unpaid').length || 0, icon: BookOpen, color: 'var(--primary-color)', bg: 'var(--primary-light)' },
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

      {/* Pay all banner */}
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
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', fontSize: '0.95rem', padding: '12px 28px' }}
            onClick={() => alert('Redirecting to payment gateway...')}
            id="pay-all-fines-btn"
          >
            <CreditCard size={18} /> Pay All Fines
          </button>
        </div>
      )}

      {/* Overdue Details Table */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h3 className="panel-title">Overdue Fine Details</h3>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Days Overdue</th>
                <th>Fine / Day</th>
                <th>Total Fine</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.details?.map((fine) => {
                const isPaid = paidIds.includes(fine.id) || fine.status === 'Paid';
                return (
                  <tr key={fine.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookOpen size={15} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{fine.title}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {fine.daysOverdue} days
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>₹{fine.finePerDay || '5.00'}/day</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>₹{fine.totalFine}</span>
                    </td>
                    <td>
                      {isPaid ? (
                        <span className="badge badge-success"><CheckCircle size={12} /> Paid</span>
                      ) : (
                        <span className="badge badge-warning"><Clock size={12} /> Unpaid</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={isPaid}
                        style={{ opacity: isPaid ? 0.5 : 1, cursor: isPaid ? 'not-allowed' : 'pointer' }}
                        onClick={() => handlePay(fine.id, fine.totalFine)}
                        id={`pay-fine-btn-${fine.id}`}
                      >
                        {isPaid ? '✓ Paid' : `Pay ₹${fine.totalFine}`}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!data.details || data.details.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                <tr><th>Book</th><th>Amount</th><th>Paid Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{h.title}</td>
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
