import React, { useState, useEffect } from 'react';
import { Search, Globe, FileText, Video, BookOpen, Download, ExternalLink } from 'lucide-react';

const resourceTypes = ['All', 'E-Book', 'Research Paper', 'Journal', 'Video Lecture', 'NPTEL', 'OPAC', 'Other'];

const DigitalResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchResources();
  }, [filterType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterType !== 'All') params.set('type', filterType);
      const response = await fetch(`/api/resources${params.toString() ? `?${params.toString()}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data.map(resource => ({
        id: resource.id || resource.digital_resource_id,
        title: resource.title || '',
        description: resource.description || '',
        type: resource.type || resource.resource_type || 'Research Paper',
        fileUrl: resource.file_url || resource.fileUrl || resource.file_path || resource.filePath || '',
        author: resource.author || resource.uploaded_by?.name || 'Library'
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'E-Book': return <BookOpen size={20} />;
      case 'Research Paper': return <FileText size={20} />;
      case 'Journal': return <Globe size={20} />;
      case 'Video Lecture': return <Video size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const openResource = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="resources-container">
      <header className="resources-header">
        <div>
          <h1>Digital Resources</h1>
          <p>Access approved e-books, journals, research papers, and video lectures</p>
        </div>
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by title or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="filter-tags">
        {resourceTypes.map(type => (
          <button
            key={type}
            className={`filter-tag ${filterType === type ? 'active' : ''}`}
            onClick={() => {
              setFilterType(type);
              if (type === 'NPTEL') {
                window.open('https://nptel.ac.in/courses', '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading resources...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredResources.length === 0 ? (
        <div className="empty-state">No approved digital resources found.</div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-thumbnail">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--primary-color)' }}>
                  {getTypeIcon(resource.type)}
                </div>
                <div className="resource-type-badge">
                  {getTypeIcon(resource.type)}
                  <span>{resource.type}</span>
                </div>
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <p className="resource-author">{resource.author}</p>
                <p className="resource-subject">{resource.description}</p>
                <div className="resource-actions">
                  <button className="action-btn download" onClick={() => openResource(resource.fileUrl)} disabled={!resource.fileUrl}>
                    <Download size={16} />
                    <span>Access</span>
                  </button>
                  <button className="action-btn view" onClick={() => openResource(resource.fileUrl)} disabled={!resource.fileUrl}>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalResources;
