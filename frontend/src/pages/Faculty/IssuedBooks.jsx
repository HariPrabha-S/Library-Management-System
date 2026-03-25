import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Upload, AlertCircle, CalendarDays } from 'lucide-react';


const IssuedBooks = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // ----- DUMMY DATA FOR FRONTEND TESTING -----
  useEffect(() => {
    // if (!user?.facultyId) return;
    // setLoading(true);
    // fetch(`http://localhost:5001/api/records/${user.facultyId}`)
    //   .then(r => r.json())
    //   .then(data => { 
    //     const formattedData = data.map(b => ({
    //       ...b,
    //       issueDate: b.issueDate ? new Date(b.issueDate).toISOString().split('T')[0] : '',
    //       dueDate: b.dueDate ? new Date(b.dueDate).toISOString().split('T')[0] : ''
    //     }));
    //     setBooks(formattedData); 
    //     setLoading(false); 
    //   })
    //   .catch((err) => {
    //     console.error('Records fetch error:', err);
    //     setLoading(false);
    //   });

    const dummyBooks = [
      { id: 101, title: 'Artificial Intelligence', author: 'Stuart Russell', issueDate: '2025-03-24', dueDate: '2025-04-24', library: 'Main', status: 'Active', renewAllowed: true },
      { id: 102, title: 'Deep Learning', author: 'Ian Goodfellow', issueDate: '2025-02-01', dueDate: '2025-03-01', library: 'Main', status: 'Overdue', renewAllowed: false },
    ];
    setBooks(dummyBooks);
    setLoading(false);
  }, [user?.facultyId]);

  const handleRenew = (id) => {
    // fetch(`http://localhost:5001/api/books/renew/${id}`, { method: 'POST' })
    //   .then(r => {
    //     if (!r.ok) return r.json().then(e => { throw new Error(e.message); });
    //     return r.json();
    //   })
    //   .then(d => {
    //     alert(d.message);
    //     setBooks(prev => prev.map(b => b.id === id ? { ...b, dueDate: d.newDueDate, status: 'Active' } : b));
    //   })
    //   .catch((err) => {
    //     alert(err.message || 'Renewal failed');
    //   });

    alert('Book renewed successfully (Dummy)');
    setBooks(prev => prev.map(b => b.id === id ? { ...b, dueDate: '2025-05-24', status: 'Active' } : b));
  };

  const summary = {
    total: books.length,
    active: books.filter(b => b.status === 'Active').length,
    overdue: books.filter(b => b.status === 'Overdue').length,
  };

  const filtered = filter === 'All' ? books : books.filter(b => b.status === filter);

  return (
    <div className="animate-fade-in">
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Issued', value: summary.total, color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
          { label: 'Active', value: summary.active, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Overdue', value: summary.overdue, color: 'var(--danger)', bg: 'var(--danger-light)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 22px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Inter',sans-serif", color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {summary.overdue > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 20 }}>
          <AlertCircle size={18} color="var(--danger)" />
          <p style={{ color: '#b91c1c', fontSize: '0.88rem', fontWeight: 500 }}>
            You have <strong>{summary.overdue}</strong> overdue book{summary.overdue > 1 ? 's' : ''}. Please return or renew immediately to avoid further fines.
          </p>
        </div>
      )}

      {/* Filter Tabs + Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Borrowed Books</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Active', 'Overdue'].map(f => (
              <button
                key={f}
                className="btn btn-sm"
                onClick={() => setFilter(f)}
                id={`filter-tab-${f.toLowerCase()}`}
                style={{
                  background: filter === f ? (f === 'Overdue' ? 'var(--danger)' : 'var(--primary-color)') : 'transparent',
                  color: filter === f ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${filter === f ? (f === 'Overdue' ? 'var(--danger)' : 'var(--primary-color)') : 'var(--border)'}`,
                }}
              >
                {f} {f !== 'All' && <span style={{ opacity: 0.8 }}>({f === 'Active' ? summary.active : summary.overdue})</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your books...</div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Book Info</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Library</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => (
                  <tr key={book.id} className={book.status === 'Overdue' ? 'overdue-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: book.status === 'Overdue' ? 'var(--danger-light)' : 'rgba(1,137,141,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} color={book.status === 'Overdue' ? 'var(--danger)' : 'var(--secondary-color)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{book.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={13} color="var(--text-muted)" />
                        {book.issueDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {book.status === 'Overdue' && <AlertCircle size={14} color="var(--danger)" />}
                        <span style={{ color: book.status === 'Overdue' ? 'var(--danger)' : 'var(--text-primary)', fontWeight: book.status === 'Overdue' ? 600 : 400, fontSize: '0.87rem' }}>
                          {book.dueDate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={book.library === 'Main' ? 'badge badge-primary' : 'badge badge-secondary'}>
                        {book.library} Library
                      </span>
                    </td>
                    <td>
                      <span className={book.status === 'Active' ? 'badge badge-success' : 'badge badge-danger'}>
                        {book.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleRenew(book.id)}
                          disabled={!book.renewAllowed}
                          style={{ opacity: book.renewAllowed ? 1 : 0.4, cursor: book.renewAllowed ? 'pointer' : 'not-allowed' }}
                          title={book.renewAllowed ? 'Renew this book' : 'Renewal not allowed'}
                          id={`renew-btn-${book.id}`}
                        >
                          <RefreshCw size={13} /> Renew
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => alert('Return request submitted. Please return the book to the library desk.')}
                          id={`return-btn-${book.id}`}
                        >
                          <Upload size={13} /> Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuedBooks;
