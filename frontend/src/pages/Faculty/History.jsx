import React, { useState } from 'react';
import { BookOpen, Clock, CheckCircle, DollarSign } from 'lucide-react';


const tabs = [
  { key: 'returned', label: 'Returned Books', icon: CheckCircle },
  { key: 'reservation', label: 'Reservation History', icon: Clock },
  { key: 'fines', label: 'Fine History', icon: DollarSign },
];

const History = ({ user }) => {
  const [activeTab, setActiveTab] = useState('returned');
  const [data, setData] = useState({ issued: [], returned: [], reservation: [], fines: [] });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!user?.facultyId) {
      setData({ issued: [], returned: [], reservation: [], fines: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/history/${encodeURIComponent(user.facultyId)}`)
      .then(r => {
        if (!r.ok) throw new Error('Unable to load history');
        return r.json();
      })
      .then((issues) => {
        const formattedIssued = issues.filter(i => i.status !== 'Returned').map(i => ({
          id: i.id,
          title: i.title || i.Book?.title || 'Unknown Book',
          author: i.Book?.author || 'Unknown Author',
          issueDate: i.issueDate ? new Date(i.issueDate).toISOString().split('T')[0] : '',
          dueDate: i.returnDate ? new Date(i.returnDate).toISOString().split('T')[0] : '',
          library: 'Main'
        }));

        const formattedReturned = issues.filter(i => i.status === 'Returned').map(i => ({
          id: i.id,
          title: i.title || i.Book?.title || 'Unknown Book',
          author: i.Book?.author || 'Unknown Author',
          issueDate: i.issueDate ? new Date(i.issueDate).toISOString().split('T')[0] : '',
          returnDate: i.actualReturnDate ? new Date(i.actualReturnDate).toISOString().split('T')[0] : '',
          fineAmount: i.fineAmount || 0,
          status: 'On Time'
        }));

        setData({ issued: formattedIssued, returned: formattedReturned, reservation: [], fines: [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error('History fetch error:', err);
        setData({ issued: [], returned: [], reservation: [], fines: [] });
        setLoading(false);
      });
  }, [user?.facultyId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>;

  const historyDisplay = data;

  return (
    <div className="animate-fade-in">
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'white',
        borderRadius: 12,
        padding: 6,
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)',
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              id={`history-tab-${tab.key}`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 8,
                background: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="panel">


        {/* ===== RETURNED BOOKS ===== */}
        {activeTab === 'returned' && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">Returned Books</h3>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{historyDisplay.returned.length} records</span>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>Book Title</th><th>Author</th><th>Issue Date</th><th>Return Date</th><th>Fine</th><th>Status</th></tr></thead>
                <tbody>
                  {historyDisplay.returned.map(r => (
                    <tr key={r._id || r.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.author}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.issueDate}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.dueDate || r.returnDate}</td>
                      <td style={{ fontWeight: 600, color: (r.fineAmount || 0) === 0 ? 'var(--success)' : 'var(--danger)' }}>₹{r.fineAmount || 0}</td>
                      <td>
                        {r.status !== 'Overdue'
                          ? <span className="badge badge-success"><CheckCircle size={11} /> On Time</span>
                          : <span className="badge badge-warning"><Clock size={11} /> Late</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== RESERVATION HISTORY ===== */}
        {activeTab === 'reservation' && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">Reservation History</h3>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{historyDisplay.reservation.length} records</span>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>Book Title</th><th>Request Date</th><th>Resolved Date</th><th>Status</th></tr></thead>
                <tbody>
                  {historyDisplay.reservation.map(r => (
                    <tr key={r._id || r.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.bookName || r.title}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.requestDate}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.resolvedDate || '—'}</td>
                      <td>
                        {r.status === 'Approved'
                          ? <span className="badge badge-success"><CheckCircle size={11} /> Approved</span>
                          : r.status === 'Rejected'
                            ? <span className="badge badge-danger"><Clock size={11} /> Rejected</span>
                            : <span className="badge badge-warning"><Clock size={11} /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== FINE HISTORY ===== */}
        {activeTab === 'fines' && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">Fine History</h3>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{historyDisplay.fines.length} records</span>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>Book Title</th><th>Days Overdue</th><th>Total Fine</th><th>Paid Date</th><th>Status</th></tr></thead>
                <tbody>
                  {historyDisplay.fines.map(r => (
                    <tr key={r._id || r.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</td>
                      <td style={{ color: r.daysOverdue > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{r.daysOverdue} days</td>
                      <td style={{ fontWeight: 700, color: (r.totalFine || 0) === 0 ? 'var(--success)' : 'var(--danger)' }}>₹{r.totalFine || 0}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.paidDate || '—'}</td>
                      <td>
                        {r.status === 'Paid'
                          ? <span className="badge badge-success"><CheckCircle size={11} /> Paid</span>
                          : <span className="badge badge-warning"><Clock size={11} /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
