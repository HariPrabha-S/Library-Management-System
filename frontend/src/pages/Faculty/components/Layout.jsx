import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeTitles = {
  '/faculty/dashboard': { title: 'Dashboard', subtitle: 'Your library overview' },
  '/faculty/selection': { title: 'Library Selection', subtitle: 'Choose your library' },
  '/faculty/search': { title: 'Book Search (OPAC)', subtitle: 'Search the main library catalog' },
  '/faculty/dept-library': { title: 'Department Library', subtitle: 'Course-specific resources' },
  '/faculty/issued': { title: 'My Issued Books', subtitle: 'Track your borrowed materials' },
  '/faculty/fines': { title: 'Fine Management', subtitle: 'View and pay outstanding fines' },
  '/faculty/requests': { title: 'Reservation Status', subtitle: 'Track your book requests' },
  '/faculty/history': { title: 'History', subtitle: 'Your library activity log' },
  '/faculty/profile': { title: 'My Profile', subtitle: 'View and edit your information' },
  '/faculty/resources': { title: 'Digital Resources', subtitle: 'Access e-books and research papers' },
  '/faculty/journals': { title: 'Faculty Journals', subtitle: 'Manage your research publications' },
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
