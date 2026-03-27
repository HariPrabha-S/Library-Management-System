import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';


const DepartmentLibrary = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState([]);
  const [searchSem, setSearchSem] = useState('All');

  useEffect(() => {
    // const dept = user?.dept || user?.department || '';
    // setLoading(true);
    // fetch(`http://localhost:5000/api/books/department?dept=${dept}`)
    //   .then(r => r.json())
    //   .then(data => { setBooks(data); setLoading(false); })
    //   .catch((err) => { 
    //     console.error('Dept fetch error:', err);
    //     setLoading(false); 
    //   });

    setTimeout(() => {
      const dummyDeptBooks = [
        { _id: 'd1', subject: 'Operating Systems', semester: 'Semester IV', title: 'Silberschatz OS Concepts', available: true },
        { _id: 'd2', subject: 'Database Management', semester: 'Semester IV', title: 'Korth Database Systems', available: false, status: 'On Loan' },
        { _id: 'd3', subject: 'Cloud Computing', semester: 'Semester VI', title: 'AWS Architect Guide', available: true },
        { _id: 'd4', subject: 'Web Development', semester: 'Semester VI', title: 'React JS Mastery', available: true },
      ];
      setBooks(dummyDeptBooks);
      setLoading(false);
    }, 500);
  }, [user]);

  const handleRequest = async (book) => {
    if (!user?.studentId) return alert('Please login again');

    try {
      const response = await fetch('http://localhost:5000/api/books/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.studentId,
          bookId: book.id,
          bookName: book.title,
          library: book.library || 'Department'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRequestedIds(prev => [...prev, book.id]);
        alert(data.message);
      } else {
        alert(data.message || 'Request failed');
      }
    } catch (err) {
      console.error('Dept request error:', err);
      alert('Could not submit request.');
    }
  };

  const semesters = ['All', ...Array.from(new Set(books.map(b => b.semester)))];
  const filtered = searchSem === 'All' ? books : books.filter(b => b.semester === searchSem);

  return (
    <div className="animate-fade-in">
      {/* Info Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        background: 'rgba(1,137,141,0.07)',
        border: '1px solid rgba(1,137,141,0.2)',
        borderRadius: 12,
        marginBottom: 24,
      }}>
        <div style={{ width: 44, height: 44, background: 'var(--secondary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BookOpen size={20} color="var(--secondary-color)" />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--secondary-color)', fontSize: '0.9rem' }}>Department Library — Computer Science</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: 2 }}>
            Showing semester-specific books for your department. Short-term issues available for most titles.
          </p>
        </div>
      </div>

      {/* Sem Filter + Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {semesters.map(sem => (
            <button
              key={sem}
              onClick={() => setSearchSem(sem)}
              className="btn btn-sm"
              style={{
                background: searchSem === sem ? 'var(--secondary-color)' : 'white',
                color: searchSem === sem ? 'white' : 'var(--text-secondary)',
                border: `1.5px solid ${searchSem === sem ? 'var(--secondary-color)' : 'var(--border)'}`,
              }}
              id={`sem-filter-${sem.replace(' ', '-')}`}
            >
              {sem}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
          {filtered.length} books available
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>Loading department books...</div>
      ) : (
        <div className="panel">
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Semester</th>
                  <th>Book Title</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => {
                  const requested = requestedIds.includes(book._id);
                  return (
                    <tr key={book._id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{book.subject}</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{book.semester}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BookOpen size={15} color="var(--text-muted)" />
                          {book.title}
                        </div>
                      </td>
                      <td>
                        {book.available ? (
                          <span className="badge badge-success"><CheckCircle size={12} /> In Stock</span>
                        ) : (
                          <span className="badge badge-danger">Out of Stock</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.83rem' }}>
                        {requested ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                            <Clock size={14} />
                            <span>Waiting for Librarian Approval</span>
                          </div>
                        ) : book.status ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                            <Clock size={14} />
                            <span>{book.status}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${requested || book.status ? 'btn-ghost' : book.available ? '' : 'btn-ghost'}`}
                          style={{
                            background: requested || book.status ? '#f3f4f6' : book.available ? 'var(--secondary-color)' : '#f3f4f6',
                            color: requested || book.status ? 'var(--text-muted)' : book.available ? 'white' : 'var(--text-muted)',
                            cursor: (!book.available || requested || book.status) ? 'not-allowed' : 'pointer',
                            opacity: (!book.available || requested || book.status) ? 0.65 : 1,
                          }}
                          disabled={!book.available || !!requested || !!book.status}
                          onClick={() => handleRequest(book)}
                          id={`dept-request-btn-${book._id}`}
                        >
                          {requested || book.status ? '⏳ Pending' : 'Request Short-Term'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertCircle size={16} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong>Short-term issues</strong> are typically 1–3 days. After requesting, a librarian will review and approve. Your request will appear as "Waiting for Librarian Approval" until processed.
        </p>
      </div>
    </div>
  );
};

export default DepartmentLibrary;
