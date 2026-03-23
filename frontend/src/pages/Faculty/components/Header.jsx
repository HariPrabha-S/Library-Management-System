import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import './Header.css';

const Header = ({ title, subtitle, user }) => {
  const [searchVal, setSearchVal] = useState('');
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'FC';

  return (
    <header className="app-header">
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
        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name || 'Faculty'}</span>
            <span className="header-user-role">Faculty</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
