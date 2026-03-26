import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockNotifications = [
    { id: 1, text: '5 overdue book reports generated.', time: '1 hour ago', unread: true },
    { id: 2, text: 'New student registration pending approval.', time: '3 hours ago', unread: true },
    { id: 3, text: 'Library system backup completed successfully.', time: '1 day ago', unread: false }
];

const AdminHeader = ({ title, subtitle, user, onMenuClick }) => {
    const [searchVal, setSearchVal] = useState('');
    const [showNotif, setShowNotif] = useState(false);
    const navigate = useNavigate();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';

    return (
        <header className="app-header">
            {/* Hamburger – mobile only */}
            <button
                className="mobile-menu-btn header-icon-btn"
                onClick={onMenuClick}
                aria-label="Open menu"
                style={{ display: 'none' }} // Hidden by default, controlled by CSS
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
                        placeholder="Search books, students..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        id="admin-quick-search"
                    />
                </div>

                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="header-icon-btn"
                        id="notification-bell"
                        aria-label="Notifications"
                        onClick={() => setShowNotif(!showNotif)}
                    >
                        <Bell size={20} />
                        <span className="notif-dot"></span>
                    </button>

                    {showNotif && (
                        <div style={{
                            position: 'absolute', top: 50, right: 0, width: 300, background: 'white',
                            border: '1px solid var(--border-light)', borderRadius: 12, boxShadow: 'var(--shadow-md)',
                            zIndex: 1000, overflow: 'hidden'
                        }} className="animate-slide-up">
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Notifications</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }}>Mark all read</span>
                            </div>
                            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                {mockNotifications.map(n => (
                                    <div key={n.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f9f9f9', background: n.unread ? 'rgba(121,12,12,0.03)' : 'white' }}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.unread ? 'var(--primary-color)' : 'transparent', marginTop: 6 }} />
                                            <div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>{n.text}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }}>
                                View All Activity logs
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="header-user" style={{ cursor: 'default' }}>
                    <div className="header-avatar">{initials}</div>
                    <div className="header-user-info">
                        <span className="header-user-name">{user?.name || 'Administrator'}</span>
                        <span className="header-user-role">System Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
