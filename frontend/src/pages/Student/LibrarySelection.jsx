import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, School, ArrowRight, CheckCircle } from 'lucide-react';
import './LibrarySelection.css';

const libraries = [
  {
    id: 'main',
    name: 'Main Library',
    icon: Building2,
    tag: 'Central Resource',
    description: 'Access the full university catalog with 50,000+ books, journals, research papers, and multimedia resources across all disciplines.',
    features: ['50,000+ Books', 'All Departments', 'Research Journals', 'OPAC Search'],
    path: '/search',
    stats: { books: '50,000+', floors: 4, sections: 12 },
    accentColor: 'var(--primary-color)',
    bgGradient: 'linear-gradient(135deg, rgba(121,12,12,0.06) 0%, rgba(121,12,12,0.02) 100%)',
    bgHover: 'rgba(121,12,12,0.08)',
  },
  {
    id: 'dept',
    name: 'Department Library',
    icon: School,
    tag: 'Course Resources',
    description: 'Find subject-specific textbooks, semester-wise materials, and short-term issue books curated for your department.',
    features: ['Course Textbooks', 'Semester-wise', 'Short-term Issue', 'Department Only'],
    path: '/dept-library',
    stats: { books: '8,000+', floors: 1, sections: 6 },
    accentColor: 'var(--secondary-color)',
    bgGradient: 'linear-gradient(135deg, rgba(1,137,141,0.06) 0%, rgba(1,137,141,0.02) 100%)',
    bgHover: 'rgba(1,137,141,0.08)',
  },
];

const LibrarySelection = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="animate-fade-in library-selection-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="lib-sel-badge">Choose Your Library</div>
        <h2 className="lib-sel-heading">Select a Library to Browse</h2>
        <p className="lib-sel-desc">
          Select a library to explore its catalog, search for books, and manage your issues.
        </p>
      </div>

      <div className="library-cards-grid">
        {libraries.map((lib) => {
          const Icon = lib.icon;
          const isHovered = hoveredId === lib.id;
          return (
            <div
              key={lib.id}
              className="library-card"
              style={{
                '--lib-accent': lib.accentColor,
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? '0 20px 50px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)'
                  : '0 4px 16px rgba(0,0,0,0.07)',
              }}
              onMouseEnter={() => setHoveredId(lib.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(lib.path)}
              id={`library-card-${lib.id}`}
            >
              {/* Top accent bar */}
              <div className="library-card-accent" style={{ background: lib.accentColor }} />

              {/* Icon + Tag */}
              <div className="library-card-top">
                <div className="library-card-icon" style={{ background: isHovered ? lib.accentColor : `${lib.accentColor}15`, transition: 'background 0.25s ease' }}>
                  <Icon size={32} color={isHovered ? 'white' : lib.accentColor} style={{ transition: 'color 0.25s' }} />
                </div>
                <span className="library-card-tag" style={{ background: `${lib.accentColor}12`, color: lib.accentColor }}>
                  {lib.tag}
                </span>
              </div>

              {/* Info */}
              <h3 className="library-card-name" style={{ color: lib.accentColor }}>
                {lib.name}
              </h3>
              <p className="library-card-desc">{lib.description}</p>

              {/* Stats row */}
              <div className="library-card-stats">
                <div className="lib-stat">
                  <span className="lib-stat-value" style={{ color: lib.accentColor }}>{lib.stats.books}</span>
                  <span className="lib-stat-label">Books</span>
                </div>
                <div className="lib-stat">
                  <span className="lib-stat-value" style={{ color: lib.accentColor }}>{lib.stats.floors}</span>
                  <span className="lib-stat-label">Floors</span>
                </div>
                <div className="lib-stat">
                  <span className="lib-stat-value" style={{ color: lib.accentColor }}>{lib.stats.sections}</span>
                  <span className="lib-stat-label">Sections</span>
                </div>
              </div>

              {/* Features */}
              <div className="library-card-features">
                {lib.features.map((f, i) => (
                  <div key={i} className="lib-feature">
                    <CheckCircle size={14} color={lib.accentColor} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className="library-card-btn"
                style={{ background: lib.accentColor, boxShadow: `0 4px 14px ${lib.accentColor}40` }}
                onClick={(e) => { e.stopPropagation(); navigate(lib.path); }}
              >
                Browse {lib.name} <ArrowRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibrarySelection;
