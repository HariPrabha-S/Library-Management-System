import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, BookOpen, Globe, Video, 
  Trash2, ExternalLink, Calendar, User, CheckCircle, 
  AlertCircle, Upload, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyJournals = ({ user }) => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Research Paper',
    subject: user?.dept || 'Computer Science',
    link: '',
    thumbnail: '',
    author: user?.name || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMyWorks();
    fetchMySubmissions();
  }, [user]);

  const normalizeResource = (resource) => ({
    id: resource.id || resource.digital_resource_id,
    title: resource.title || '',
    type: resource.type || resource.resource_type || 'Research Paper',
    subject: resource.description || '',
    link: resource.file_url || resource.fileUrl || resource.file_path || resource.filePath || '',
    author: resource.author || resource.uploaded_by?.name || user?.name || '',
    addedDate: resource.created_at || resource.createdAt || new Date().toISOString(),
    approvalStatus: resource.approval_status || resource.approvalStatus || 'Pending'
  });

  // Fetch published works (only approved)
  const fetchMyWorks = async () => {
    if (!user?.facultyId) {
      setWorks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/resources?uploadedBy=${encodeURIComponent(user.facultyId)}`);
      const data = await res.json();
      setWorks(data.map(normalizeResource).filter(work => work.approvalStatus === 'Approved'));
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    if (!user?.facultyId) return;
    try {
      const res = await fetch(`/api/resources?uploadedBy=${user.facultyId}`);
      const data = await res.json();
      setPendingSubmissions(data.map(normalizeResource));
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/resources/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.subject || '',
            resource_type: formData.type,
            file_url: formData.link,
            uploadedByFacultyEmployeeId: user.facultyId,
            author: formData.author
          })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Resource submitted for admin approval.', type: 'success' });
        setFormData({
          title: '',
          type: 'Research Paper',
          subject: user?.dept || 'Computer Science',
          link: '',
          thumbnail: '',
          author: user?.name || ''
        });
        setTimeout(() => setShowModal(false), 1500);
        fetchMyWorks();
        fetchMySubmissions();
      } else {
        setMessage({ text: data.message || 'Failed to add work', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error connecting to server', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'E-Book': return <BookOpen size={18} />;
      case 'Research Paper': return <FileText size={18} />;
      case 'Journal': return <Globe size={18} />;
      case 'Video Lecture': return <Video size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const filteredWorks = works.filter((work) =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const approvalQueue = pendingSubmissions.filter((item) => item.approvalStatus === 'Pending');

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Faculty Journals & Research</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage and showcase your published works in the digital library.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} /> Add New Work
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid-cards" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
          <div className="stat-icon" style={{ background: 'rgba(121, 12, 12, 0.1)', width: 44, height: 44 }}>
            <FileText color="var(--primary-color)" size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{pendingSubmissions.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>My Submissions</div>
          </div>
        </div>
        <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
          <div className="stat-icon" style={{ background: 'rgba(1, 137, 141, 0.1)', width: 44, height: 44 }}>
            <Globe color="var(--secondary-color)" size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{works.filter(w => w.type === 'Journal').length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>Journal Papers</div>
          </div>
        </div>
        <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
          <div className="stat-icon" style={{ background: '#fef3c7', width: 44, height: 44 }}>
            <CheckCircle color="#d97706" size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{pendingSubmissions.filter(w => w.approvalStatus === 'Pending').length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>Pending Approval</div>
          </div>
        </div>
      </div>

      {/* Works List */}
      <div className="panel">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>My Publications</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter your works..." 
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 34, height: 36, fontSize: '0.85rem', width: 220 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading your works...</div>
        ) : filteredWorks.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={32} color="var(--text-muted)" />
            </div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No works uploaded yet</h4>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto 20px' }}>Start by adding your research papers or journals to the digital library.</p>
            <button className="btn btn-outline" onClick={() => setShowModal(true)}>Upload First Paper</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title & Type</th>
                  <th>Subject</th>
                  <th>Author</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map((work) => (
                  <tr key={work.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                          {getTypeIcon(work.type)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{work.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{work.type}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-secondary">{work.subject}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{work.author}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(work.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-icon" onClick={() => work.link && window.open(work.link, '_blank', 'noopener,noreferrer')} title="View Work" disabled={!work.link}>
                          <ExternalLink size={16} />
                        </button>
                        <button className="btn btn-icon" style={{ color: '#ef4444' }} title="Delete">
                          <Trash2 size={16} />
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


      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="panel animate-scale-in" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Add Research Paper / Journal</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {message.text && (
                <div style={{ 
                  padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                  background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: message.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span style={{ fontSize: '0.9rem' }}>{message.text}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Title of the Work*</label>
                <input 
                  type="text" name="title" required
                  className="form-control" placeholder="e.g., Deep Learning in Healthcare"
                  value={formData.title} onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Type*</label>
                  <select 
                    name="type" className="form-control"
                    value={formData.type} onChange={handleInputChange}
                  >
                    <option>Research Paper</option>
                    <option>Journal</option>
                    <option>E-Book</option>
                    <option>Video Lecture</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Subject Area</label>
                  <input 
                    type="text" name="subject"
                    className="form-control" placeholder="e.g., AI / ML"
                    value={formData.subject} onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Author(s)*</label>
                <input 
                  type="text" name="author" required
                  className="form-control" placeholder="Your name or co-authors"
                  value={formData.author} onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>External Link (PDF/URL)*</label>
                <input 
                  type="url" name="link" required
                  className="form-control" placeholder="https://doi.org/..."
                  value={formData.link} onChange={handleInputChange}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Provide a DOI, PDF, or hosted resource link for admin review.</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Submit Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div style={{ 
        marginTop: 32, padding: 24, borderRadius: 16, 
        background: 'linear-gradient(135deg, var(--secondary-color) 0%, #016a6d 100%)',
        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ maxWidth: '70%' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Impact the Next Generation</h3>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Your contributions help build our institution's digital knowledge hub. 
            Uploaded works are reviewed by the library admin before they appear in the Digital Resources section.
          </p>
        </div>
        <button 
          className="btn" 
          style={{ background: 'white', color: 'var(--secondary-color)', fontWeight: 600 }}
          onClick={() => navigate('/faculty/resources')}
        >
          View Public Resources <ArrowRight size={18} style={{ marginLeft: 8 }} />
        </button>
      </div>
    </div>
  );
};

export default FacultyJournals;
