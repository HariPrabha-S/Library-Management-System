import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BookMarked,
  BadgeDollarSign,
  ClipboardList,
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
  { name: 'Library Selection', path: '/student/selection', icon: Library },
  { name: 'Search Books', path: '/student/search', icon: Search },
  { name: 'My Borrowed Books', path: '/student/issued', icon: BookMarked },
  { name: 'Department Library', path: '/student/department', icon: BookOpen },
  { name: 'Digital Resources', path: '/student/resources', icon: Globe },
  { name: 'Reservations', path: '/student/requests', icon: ClipboardList },
  { name: 'Profile', path: '/student/profile', icon: User },
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
        <div className="sidebar-brand">
          <div className="brand-logo">
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <div className="brand-name">LMS</div>
            <div className="brand-tagline">Student Portal</div>
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
