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
    BookOpen,
    Building2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Library Selection', path: '/student/selection', icon: Library },
    { name: 'Search Books', path: '/student/search', icon: Search },
    { name: 'Dept. Library', path: '/student/dept-library', icon: Building2 },
    { name: 'My Issued Books', path: '/student/issued', icon: BookMarked },
    { name: 'Digital Resources', path: '/student/resources', icon: Globe },
    { name: 'Fine Management', path: '/student/fines', icon: BadgeDollarSign },
    { name: 'Reservations', path: '/student/requests', icon: ClipboardList },
    { name: 'History', path: '/student/history', icon: History },
    { name: 'Profile', path: '/student/profile', icon: User },
];

const Sidebar = ({ onLogout, collapsed, setCollapsed }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        if (onLogout) onLogout();
        navigate('/', { replace: true });
    };

    return (
        <div
            className="no-scrollbar"
            style={{
                width: collapsed ? 72 : 248,
                minWidth: collapsed ? 72 : 248,
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100dvh',
                background: 'linear-gradient(180deg, #790c0c 0%, #5a0909 100%)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 200,
                overflowY: 'auto',
                overflowX: 'hidden',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '4px 0 24px rgba(121,12,12,0.2)',
            }}
        >
            {/* Brand */}
            <div className="sidebar-brand" style={{ justifyContent: collapsed ? 'center' : undefined }}>
                <div className="brand-logo">
                    <BookOpen size={22} color="white" />
                </div>
                {!collapsed && (
                    <div>
                        <div className="brand-name">LMS</div>
                        <div className="brand-tagline">Student Portal</div>
                    </div>
                )}
            </div>

            {/* Nav Links */}
            <nav className="nav-menu">
                {navItems.map(({ name, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        title={collapsed ? name : undefined}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        style={{ justifyContent: collapsed ? 'center' : undefined }}
                    >
                        <span className="nav-icon"><Icon size={18} /></span>
                        {!collapsed && <span className="nav-link-text">{name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {/* Logout */}
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                    style={{ justifyContent: 'center' }}
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Logout</span>}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: collapsed ? 0 : 10,
                        marginTop: 8,
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.75)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-color)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--secondary-color)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                    {collapsed ? <ChevronRight size={18} /> : (
                        <>
                            <ChevronLeft size={16} />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
