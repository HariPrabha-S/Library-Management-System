import React from 'react';
import { Menu } from 'lucide-react';

const AdminHeader = ({ title, subtitle, user, onMenuClick }) => {
    const initials = user?.name
        ? user.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'AD';

    return (
        <header className="app-header">
            {/* Hamburger – mobile only */}
            <button
                className="mobile-menu-btn header-icon-btn"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Page Title */}
            <div className="header-page-info">
                <h1 className="header-title">{title}</h1>
                {subtitle && (
                    <p className="header-subtitle">{subtitle}</p>
                )}
            </div>

            {/* Right Controls */}
            <div className="header-controls">
                {/* User Avatar */}
                <div
                    className="header-user"
                    style={{ cursor: 'default' }}
                >
                    <div className="header-avatar">{initials}</div>

                    <div className="header-user-info">
                        <span className="header-user-name">
                            {user?.name || 'Administrator'}
                        </span>
                        <span className="header-user-role">
                            System Admin
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;