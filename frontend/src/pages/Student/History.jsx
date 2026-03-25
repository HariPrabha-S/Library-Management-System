import React, { useState } from 'react';
import { BookOpen, Clock, CheckCircle, DollarSign } from 'lucide-react';


const tabs = [
  { key: 'issued', label: 'Issued History', icon: BookOpen },
  { key: 'returned', label: 'Returned Books', icon: CheckCircle },
  { key: 'reservation', label: 'Reservation History', icon: Clock },
  { key: 'fines', label: 'Fine History', icon: DollarSign },
];

const History = ({ user }) => {
  const [activeTab, setActiveTab] = useState('issued');
  const [data, setData] = useState({ issued: [], returned: [], reservation: [], fines: [] });
  const [loading, setLoading] = useState(true);

  // ----- DUMMY DATA FOR FRONTEND TESTING -----
  React.useEffect(() => {
    // if (!user?.studentId) return;
    // setLoading(true);
    // fetch(`http://localhost:5000/api/history/${user.studentId}`)
    //   .then(r => r.json())
    //   .then(d => { 
    //     const formatted = {
    //       issued: (d.issued || []).map(r => ({ ...r, issueDate: r.issueDate ? new Date(r.issueDate).toISOString().split('T')[0] : '', dueDate: r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : '' })),
    //       returned: (d.returned || []).map(r => ({ ...r, issueDate: r.issueDate ? new Date(r.issueDate).toISOString().split('T')[0] : '', returnDate: r.returnDate ? new Date(r.returnDate).toISOString().split('T')[0] : '' })),
    //       reservation: (d.reservation || []).map(r => ({ ...r, requestDate: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : '', resolvedDate: r.resolvedDate ? new Date(r.resolvedDate).toISOString().split('T')[0] : '' })),
    //       fines: (d.fines || []).map(r => ({ ...r, paidDate: r.paidDate ? new Date(r.paidDate).toISOString().split('T')[0] : '' })),
    //     };
    //     setData(formatted); 
    //     setLoading(false); 
    //   })
    //   .catch((err) => {
    //     console.error('History fetch error:', err);
    //     setLoading(false);
    //   });

    const dummyData = {
      issued: [
        { id: 1, title: 'Code Complete', author: 'Steve McConnell', issueDate: '2025-03-12', dueDate: '2025-03-26', library: 'Main' }
      ],
      returned: [
        { id: 2, title: 'Clean Code', author: 'Robert C. Martin', issueDate: '2025-02-15', returnDate: '2025-03-08', fineAmount: 0, status: 'On Time' }
      ],
      reservation: [
        { id: 3, bookName: 'The Pragmatic Programmer', requestDate: '2025-03-15', resolvedDate: '', status: 'Pending' }
      ],
      fines: [
        { id: 4, title: 'Database Systems', daysOverdue: 2, totalFine: 10, paidDate: '2025-01-20', status: 'Paid' }
      ]
    };
    setData(dummyData);
    setLoading(false);
  }, [user?.studentId]);

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
        {/* ===== ISSUED HISTORY ===== */}
        {activeTab === 'issued' && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">Issued History</h3>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{historyDisplay.issued.length} records</span>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>Book Title</th><th>Author</th><th>Issue Date</th><th>Return Date</th><th>Library</th></tr></thead>
                <tbody>
                  {historyDisplay.issued.map(r => (
                    <tr key={r._id || r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BookOpen size={15} color="var(--text-muted)" />
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.author}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.issueDate}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{r.dueDate || r.returnDate}</td>
                      <td><span className={r.library === 'Main' ? 'badge badge-primary' : 'badge badge-secondary'}>{r.library}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

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
                          : <span className="badge badge-warning"><Clock size={11} /> Unpaid</span>
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
