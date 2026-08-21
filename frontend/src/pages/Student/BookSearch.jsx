import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, MapPin, Hash, CheckCircle, XCircle, SlidersHorizontal } from 'lucide-react';



const safeText = (value, fallback = '') => {
  if (value == null) return fallback;
  return String(value);
};

const truncateText = (value, maxLength = 10) => {
  const text = safeText(value, '');
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const BookSearch = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [filterSubject, setFilterSubject] = useState('All');
  const [subjects, setSubjects] = useState([]);
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [requestedIds, setRequestedIds] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = () => {
    setLoading(true);
    const params = new URLSearchParams({ term: searchTerm, by: searchBy, subject: filterSubject, availability: filterAvailability });
    const token = localStorage.getItem('token');
    fetch(`/api/books/search?${params}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then(r => r.json())
      .then(data => { setBooks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => {
        console.error('Search error:', err);
        setBooks([]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchBooks(); }, [filterSubject, filterAvailability]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subjects', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const data = await response.json();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch subjects', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleReserve = async (book) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user?.id || loggedInUser.id || user?.studentId || loggedInUser.studentId || 1;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          memberId: studentId,
          memberType: 'Student',
          bookId: book.id
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setRequestedIds(prev => [...prev, book.id]);
        alert(`Book reserved successfully! Your queue position is #${data.data.queuePosition}.`);
        if (selectedBook?.id === book.id) {
          setSelectedBook(null);
        }
      } else {
        alert(data.message || 'Reservation failed');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      alert('Could not submit reservation. Check your connection.');
    }
  };

  const handleRequest = async (book) => {
    if (!book.available) {
      return handleReserve(book);
    }

    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user?.studentId || loggedInUser.studentId || '921021205001';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/books/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          studentId: studentId,
          bookId: book.id,
          bookName: book.title,
          library: book.library || 'Main'
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setRequestedIds(prev => [...prev, book.id]);
        alert(data.message);
        if (selectedBook?.id === book.id) {
          setSelectedBook(null);
        }
      } else {
        alert(data.message || 'Request failed');
      }
    } catch (err) {
      console.error('Request error:', err);
      alert('Could not submit request. Check your connection.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Search Panel */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ padding: '24px 24px 0' }}>
          {/* Main Search Row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <select
              className="form-input form-select"
              style={{ flex: '0 0 140px' }}
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              id="search-by-select"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="keyword">Keyword</option>
            </select>

            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="book-search-input"
                className="form-input"
                placeholder={`Search by ${searchBy}...`}
                style={{ paddingLeft: 44, width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
              />
            </div>

            <button className="btn btn-primary" onClick={fetchBooks} style={{ flexShrink: 0 }} id="search-books-btn">
              <Search size={16} /> Search
            </button>

            <button
              className="btn btn-ghost"
              style={{ flexShrink: 0, gap: 6, color: showFilters ? 'var(--primary-color)' : undefined }}
              onClick={() => setShowFilters(!showFilters)}
              id="toggle-filters-btn"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {/* Filters Row */}
          {showFilters && (
            <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                <Filter size={15} /> Filter by:
              </div>
              <select
                className="form-input form-select"
                style={{ flex: '0 0 180px' }}
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                id="filter-subject-select"
              >
                <option value="All">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select
                className="form-input form-select"
                style={{ flex: '0 0 180px' }}
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                id="filter-availability-select"
              >
                <option value="All">All Availability</option>
                <option value="Available">Available Only</option>
                <option value="Unavailable">Unavailable</option>
              </select>
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterSubject('All'); setFilterAvailability('All'); setSearchTerm(''); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-light)', marginTop: 16 }}>
          <BookOpen size={16} color="var(--secondary-color)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {loading ? 'Searching...' : `${books.length} result${books.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Searching library catalog...</div>
      ) : books.length === 0 ? (
        <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No books found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Try a different search term or adjust your filters.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const requested = requestedIds.includes(book.id);
                  return (
                    <tr key={book.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setSelectedBook(book)}>
                          <div style={{ width: 36, height: 36, background: book.available ? 'rgba(1,137,141,0.08)' : 'rgba(239,68,68,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BookOpen size={16} color={book.available ? 'var(--secondary-color)' : 'var(--danger)'} />
                          </div>
                          <div>
                            <div title={safeText(book.title)} style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {truncateText(book.title)}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 500 }}>View Details</div>
                          </div>
                        </div>
                      </td>
                      <td title={safeText(book.author)} style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                        {truncateText(book.author)}
                      </td>
                      <td title={safeText(book.isbn)} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {truncateText(book.isbn)}
                      </td>
                      <td title={safeText(book.subject)}>
                        <span className="badge badge-neutral">
                          {truncateText(book.subject)}
                        </span>
                      </td>
                      <td>
                        {book.available ? (
                          <span className="badge badge-success"><CheckCircle size={12} /> Available</span>
                        ) : (
                          <span className="badge badge-danger"><XCircle size={12} /> Issued</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${requested ? 'btn-ghost' : book.available ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ cursor: requested ? 'default' : 'pointer' }}
                          disabled={requested}
                          onClick={() => handleRequest(book)}
                          id={`request-btn-${book.id}`}
                        >
                          {requested ? '✓ Requested' : book.available ? 'Request' : 'Reserve'}
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

      {/* Book Details Modal */}
      {selectedBook && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setSelectedBook(null)}>
          <div className="panel animate-slide-up" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, var(--secondary-color), #015e61)', position: 'relative' }}>
              <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setSelectedBook(null)}>
                <XCircle size={20} color="var(--text-secondary)" />
              </button>
              <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 110, background: 'white', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                <BookOpen size={40} color="var(--secondary-color)" />
              </div>
            </div>

            <div style={{ padding: '50px 30px 30px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedBook.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>by {selectedBook.author}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Title</label>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedBook.title}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Subtitle</label>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedBook.subtitle || '—'}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Edition</label>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedBook.edition || '—'}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Library Location</label>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedBook.location || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                <div>
                  {selectedBook.available ? (
                    <span className="badge badge-success"><CheckCircle size={12} /> Available for pickup</span>
                  ) : (
                    <span className="badge badge-danger"><XCircle size={12} /> Currently issued</span>
                  )}
                </div>
                <button
                  className={`btn ${requestedIds.includes(selectedBook.id) ? 'btn-ghost' : selectedBook.available ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={requestedIds.includes(selectedBook.id)}
                  onClick={() => handleRequest(selectedBook)}
                >
                  {requestedIds.includes(selectedBook.id) ? '✓ Requested' : selectedBook.available ? 'Request' : 'Reserve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
