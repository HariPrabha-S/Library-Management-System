import React, { useState, useEffect } from 'react';
import { Search, Globe, FileText, Video, BookOpen, Download, ExternalLink } from 'lucide-react';
import './DigitalResources.css';

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
      let url = 'http://localhost:5001/api/resources';
      if (filterType !== 'All') {
        url += `?type=${filterType}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.author.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="resources-container">
      <header className="resources-header">
        <div>
          <h1>Digital Resources</h1>
          <p>Access e-books, research papers, and video lectures</p>
        </div>
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="filter-tags">
        {['All', 'E-Book', 'Research Paper', 'Journal', 'Video Lecture'].map(type => (
          <button 
            key={type}
            className={`filter-tag ${filterType === type ? 'active' : ''}`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading resources...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-thumbnail">
                <img src={resource.thumbnail} alt={resource.title} />
                <div className="resource-type-badge">
                  {getTypeIcon(resource.type)}
                  <span>{resource.type}</span>
                </div>
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <p className="resource-author">{resource.author}</p>
                <p className="resource-subject">{resource.subject}</p>
                <div className="resource-actions">
                  <button className="action-btn download">
                    <Download size={16} />
                    <span>Access</span>
                  </button>
                  <button className="action-btn view">
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
