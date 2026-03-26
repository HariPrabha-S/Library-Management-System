import React, { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRoute = routeTitles[location.pathname] || { title: 'Library Portal', subtitle: '' };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className="main-content"
        style={{
          marginLeft: collapsed ? 0 : '',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          title={currentRoute.title}
          subtitle={currentRoute.subtitle}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
