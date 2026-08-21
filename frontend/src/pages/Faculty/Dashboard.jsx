import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, DollarSign, Bookmark, MapPin,
  TrendingUp, ArrowRight, AlertCircle, CheckCircle, RefreshCw, Calendar
} from 'lucide-react';


const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const facultyId = user?.facultyId || loggedInUser.facultyId || 'NSCIT001';

    setLoading(true);
    Promise.all([
      fetch(`/api/dashboard/${facultyId}`).then(r => r.json()),
      fetch(`/api/activity/${facultyId}`).then(r => r.json())
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
  }, [user?.facultyId]);

  const activityIconMap = {
    issue: { icon: BookOpen, color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
    request: { icon: Bookmark, color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.06)' },
    overdue: { icon: AlertCircle, color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.06)' },
    return: { icon: CheckCircle, color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
        {[1, 2, 3].map(i => (
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
  const displayName = user?.name || d.name || 'Faculty';

  const statsCards = [
    {
      title: 'Books Borrowed',
      value: d.totalIssued || 0,
      sub: 'ACTIVE BORROWINGS',
      icon: BookOpen,
      iconColor: 'var(--secondary-color)',
      iconBg: 'rgba(1, 137, 141, 0.08)',
      border: 'var(--secondary-color)',
    },
    {
      title: 'Overdue Books',
      value: d.dueSoon || 0,
      sub: 'IMMEDIATE ATTENTION',
      icon: AlertCircle,
      iconColor: 'var(--primary-color)',
      iconBg: 'rgba(121, 12, 12, 0.08)',
      border: 'var(--primary-color)',
    },
    {
      title: 'TOTAL FINE (₹)',
      value: d.totalFine || 0,
      sub: 'OUTSTANDING DUES',
      icon: DollarSign,
      iconColor: 'var(--primary-color)',
      iconBg: 'rgba(121, 12, 12, 0.08)',
      border: 'var(--primary-color)',
      isCurrency: true
    },
    {
      title: 'PENDING REQUESTS',
      value: d.pendingReqs || 0,
      sub: 'AWAITING APPROVAL',
      icon: Bookmark,
      iconColor: 'var(--secondary-color)',
      iconBg: 'rgba(1, 137, 141, 0.08)',
      border: 'var(--secondary-color)',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Section with Date/Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
            Library Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Welcome back, {displayName.split(' ')[0]}! Here's your LMS overview.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 600 }}>
            <Calendar size={18} color="var(--primary-color)" />
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '')}</span>
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border-light)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 600 }}>
            <Clock size={18} color="var(--secondary-color)" />
            <span>{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </div>



      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 40 }}>
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              background: 'white',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid var(--border-light)',
              borderLeft: `5px solid ${card.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#790c0c', lineHeight: 1, marginBottom: 12 }}>
                  {card.isCurrency && '₹'} {card.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.sub}
                </div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={26} color={card.iconColor} />
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
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/faculty/issued')}>
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
              { label: 'Search for a Book', icon: BookOpen, path: '/faculty/search', color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
              { label: 'View Issued Books', icon: Clock, path: '/faculty/issued', color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.08)' },
              { label: 'Pay Outstanding Fine', icon: DollarSign, path: '/faculty/fines', color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.08)' },
              { label: 'Track Requests', icon: Bookmark, path: '/faculty/requests', color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
              { label: 'Renew Books', icon: RefreshCw, path: '/faculty/issued', color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.08)' },
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
