import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  Search,
  BookMarked,
  BadgeDollarSign,
  ClipboardList,
  History,
  User,
  LogOut,
  Globe,
  FileEdit,
  BookOpen
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { name: 'Dashboard',          path: '/dashboard',    icon: LayoutDashboard },
  { name: 'Library Selection',  path: '/selection',    icon: Library },
  { name: 'Search Books',       path: '/search',       icon: Search },
  { name: 'My Issued Books',    path: '/issued',       icon: BookMarked },
  { name: 'Faculty Journals',   path: '/journals',     icon: FileEdit },
  { name: 'Digital Resources',  path: '/resources',    icon: Globe },
  { name: 'Fine Management',    path: '/fines',        icon: BadgeDollarSign },
  { name: 'Reservations',       path: '/requests',     icon: ClipboardList },
  { name: 'History',            path: '/history',      icon: History },
  { name: 'Profile',            path: '/profile',      icon: User },
];

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <BookOpen size={22} color="white" />
        </div>
        <div>
          <div className="brand-name">LMS</div>
          <div className="brand-tagline">Faculty Portal</div>
        </div>
      </div>

      {/* Nav Section Label */}
      <div className="nav-section-label">Main Menu</div>

      {/* Nav Links */}
      <nav className="nav-menu">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><Icon size={18} /></span>
            <span className="nav-link-text">{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
