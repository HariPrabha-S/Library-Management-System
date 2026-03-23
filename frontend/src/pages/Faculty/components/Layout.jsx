import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeTitles = {
  '/dashboard':    { title: 'Dashboard',           subtitle: 'Your library overview' },
  '/selection':    { title: 'Library Selection',   subtitle: 'Choose your library' },
  '/search':       { title: 'Book Search (OPAC)',  subtitle: 'Search the main library catalog' },
  '/dept-library': { title: 'Department Library',  subtitle: 'Course-specific resources' },
  '/issued':       { title: 'My Issued Books',     subtitle: 'Track your borrowed materials' },
  '/fines':        { title: 'Fine Management',     subtitle: 'View and pay outstanding fines' },
  '/requests':     { title: 'Reservation Status',  subtitle: 'Track your book requests' },
  '/history':      { title: 'History',             subtitle: 'Your library activity log' },
  '/profile':      { title: 'My Profile',          subtitle: 'View and edit your information' },
  '/resources':    { title: 'Digital Resources',   subtitle: 'Access e-books and research papers' },
};

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const currentRoute = routeTitles[location.pathname] || { title: 'Library Portal', subtitle: '' };

  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <Header title={currentRoute.title} subtitle={currentRoute.subtitle} user={user} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
