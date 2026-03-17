import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, DollarSign, Bookmark, MapPin,
  TrendingUp, ArrowRight, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';


const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.studentId) return;

    setLoading(true);
    // Fetch stats and activity in parallel
    Promise.all([
      fetch(`http://localhost:5000/api/dashboard/${user.studentId}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/activity/${user.studentId}`).then(r => r.json())
    ])
      .then(([stats, act]) => {
        setData(stats);
        setActivity(act);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [user?.studentId]);

  const activityIconMap = {
    issue: { icon: BookOpen, color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
    request: { icon: Bookmark, color: 'var(--success)', bg: 'var(--success-light)' },
    overdue: { icon: AlertCircle, color: 'var(--danger)', bg: 'var(--danger-light)' },
    return: { icon: CheckCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 80, background: '#f0f2f5', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)' }}>Error loading dashboard: {error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 20 }}>Retry</button>
      </div>
    );
  }

  const d = data || {};
  const displayName = user?.name || d.name || 'Student';

  const statsCards = [
    {
      label: 'Total Books Issued',
      value: d.totalIssued,
      icon: BookOpen,
      iconColor: 'white',
      iconBg: 'var(--secondary-color)',
      accent: 'var(--secondary-color)',
    },
    {
      label: 'Books Due Soon',
      value: d.dueSoon,
      icon: Clock,
      iconColor: 'white',
      iconBg: '#f59e0b',
      accent: '#f59e0b',
    },
    {
      label: 'Total Fine (₹)',
      value: `₹${d.totalFine}`,
      icon: DollarSign,
      iconColor: 'white',
      iconBg: 'var(--danger)',
      accent: 'var(--danger)',
    },
    {
      label: 'Pending Requests',
      value: d.pendingReqs,
      icon: Bookmark,
      iconColor: 'white',
      iconBg: '#8b5cf6',
      accent: '#8b5cf6',
    },
    {
      label: 'Selected Library',
      value: d.selectedLibrary || 'Main Library',
      valueSmall: true,
      icon: MapPin,
      iconColor: 'white',
      iconBg: 'var(--primary-color)',
      accent: 'var(--primary-color)',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {displayName.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.95rem' }}>
          {d.department} &bull; {d.semester} &bull; {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Library Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #a01010 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(121,12,12,0.25)',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={22} color="white" />
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 500, marginBottom: 4 }}>Currently Browsing</p>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
              {d.libraryFocus || 'Main Library'}
            </h3>
          </div>
        </div>
        <button
          className="btn"
          onClick={() => navigate('/selection')}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}
          id="switch-library-btn"
        >
          Switch Library <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-cards">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="stat-icon" style={{ background: card.iconBg }}>
                  <Icon size={20} color={card.iconColor} />
                </div>
                <TrendingUp size={16} color="var(--text-muted)" />
              </div>
              <div>
                <div className="stat-label">{card.label}</div>
                <div className={`stat-value`} style={{ fontSize: card.valueSmall ? '1.3rem' : '2rem', marginTop: 6 }}>
                  {card.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
        {/* Recent Activity */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Activity</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ padding: '8px 24px 24px' }}>
            {activity.length > 0 ? activity.map((act, i) => {
              const cfg = activityIconMap[act.type] || activityIconMap.issue;
              const Icon = cfg.icon;
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < activity.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    background: cfg.bg,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 3 }}>
                      {act.title}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {act.sub} • {act.date ? new Date(act.date).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No recent activity found.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Quick Actions</h3>
          </div>
          <div style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Search for a Book',  icon: BookOpen,     path: '/search',  color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
              { label: 'View Issued Books',  icon: Clock,        path: '/issued',   color: '#f59e0b',                bg: 'rgba(245,158,11,0.08)' },
              { label: 'Pay Outstanding Fine', icon: DollarSign, path: '/fines',    color: 'var(--danger)',           bg: 'rgba(239,68,68,0.08)' },
              { label: 'Track Requests',     icon: Bookmark,     path: '/requests', color: '#8b5cf6',                bg: 'rgba(139,92,246,0.08)' },
              { label: 'Renew Books',        icon: RefreshCw,    path: '/issued',   color: 'var(--primary-color)',   bg: 'rgba(121,12,12,0.08)' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 14px',
                    background: '#f8f9fb',
                    border: '1px solid var(--border-light)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = action.bg; e.currentTarget.style.borderColor = action.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fb'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, background: action.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={action.color} />
                  </div>
                  {action.label}
                  <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
