import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeTitles = {
  '/student/dashboard': { title: 'Dashboard', subtitle: 'Your library overview' },
  '/student/selection': { title: 'Library Selection', subtitle: 'Choose your library' },
  '/student/search': { title: 'Book Search (OPAC)', subtitle: 'Search the main library catalog' },
  '/student/dept-library': { title: 'Department Library', subtitle: 'Course-specific resources' },
  '/student/issued': { title: 'My Issued Books', subtitle: 'Track your borrowed materials' },
  '/student/fines': { title: 'Fine Management', subtitle: 'View and pay outstanding fines' },
  '/student/requests': { title: 'Reservation Status', subtitle: 'Track your book requests' },
  '/student/history': { title: 'History', subtitle: 'Your library activity log' },
  '/student/profile': { title: 'My Profile', subtitle: 'View and edit your information' },
  '/student/resources': { title: 'Digital Resources', subtitle: 'Access e-books and research papers' },
};

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  const currentRoute = routeTitles[location.pathname] || { title: 'Library Portal', subtitle: '' };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className="main-content"
        style={{
          marginLeft: collapsed ? 72 : 'var(--sidebar-width)',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          title={currentRoute.title}
          subtitle={currentRoute.subtitle}
          user={user}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
