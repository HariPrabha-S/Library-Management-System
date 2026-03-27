import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, subtitle, user, onMenuClick }) => {
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

  return (
    <header className="app-header">
      {/* Hamburger – mobile only */}
      <button
        className="mobile-menu-btn header-icon-btn lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{ marginRight: 12 }}
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="header-page-info">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="header-controls">
        {/* Quick Search */}
        <div className="header-search-wrap">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            className="header-search"
            placeholder="Quick search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            id="header-quick-search"
          />
        </div>

        {/* Notification Bell */}
        <button className="header-icon-btn" id="notification-bell" aria-label="Notifications">
          <Bell size={20} />
          <span className="notif-dot"></span>
        </button>

        {/* User Avatar */}
        <div
          className="header-user"
          onClick={() => navigate('/student/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name || 'Student'}</span>
            <span className="header-user-role">Student</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
