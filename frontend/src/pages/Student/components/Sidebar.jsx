import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BookMarked,
  BadgeDollarSign,
  ClipboardList,
  History,
  User,
  LogOut,
  Globe,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Library
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Profile', path: '/student/profile', icon: User },
  { name: 'Search Books', path: '/student/search', icon: Search },
  { name: 'My Accessed Books', path: '/student/issued', icon: BookMarked },
  { name: 'Digital Resources', path: '/student/resources', icon: Globe },
  { name: 'Fine Management', path: '/student/fines', icon: BadgeDollarSign },
  { name: 'Reservations', path: '/student/requests', icon: ClipboardList },
  { name: 'History', path: '/student/history', icon: History },
];

const Sidebar = ({ onLogout, collapsed, setCollapsed, mobileOpen = false, setMobileOpen = () => { } }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    if (onLogout) onLogout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className={`no-scrollbar sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: '30px 24px' }}>
          <div className="brand-logo" style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="var(--primary-color)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="brand-name" style={{ fontSize: '1.4rem', marginBottom: 0 }}>LMS</div>
            <div className="brand-tagline" style={{ marginTop: -2, color: 'rgba(255,255,255,0.7)' }}>Student Portal</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 1024) setMobileOpen(false);
              }}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              <span className="nav-link-text">{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} style={{ justifyContent: 'center' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <button
            onClick={() => {
              if (window.innerWidth <= 1024) setMobileOpen(false);
              else setCollapsed(true);
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, marginTop: 8,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem', fontWeight: 600,
              letterSpacing: '0.5px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-color)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--secondary-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </button>
        </div>
      </div>

      <button
        className="floating-reopen-btn"
        onClick={() => {
          if (window.innerWidth <= 1024) setMobileOpen(true);
          else setCollapsed(false);
        }}
        aria-label="Open sidebar"
      >
        <ChevronRight size={16} />
      </button>
    </>
  );
};

export default Sidebar;
