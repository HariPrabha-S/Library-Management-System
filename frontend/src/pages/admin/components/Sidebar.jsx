import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    BookMarked,
    UserCheck,
    AlertCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Books', path: '/admin/books', icon: BookOpen },
    { name: 'Manage Students', path: '/admin/students', icon: Users },
    { name: 'Manage Faculties', path: '/admin/faculties', icon: GraduationCap },
    { name: 'Manage Records', path: '/admin/issues', icon: BookMarked },
    { name: 'Attendance', path: '/admin/attendance', icon: UserCheck },
    { name: 'Manage Fines', path: '/admin/fines', icon: AlertCircle },
];

const AdminSidebar = ({ onLogout, collapsed, setCollapsed, mobileOpen = false, setMobileOpen = () => { } }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        if (onLogout) onLogout();
        navigate('/', { replace: true });
    };

    return (
        <>
            {/* Sidebar panel */}
            <div
                className={`no-scrollbar sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <BookOpen size={22} color="white" />
                    </div>
                    <div>
                        <div className="brand-name">LMS</div>
                        <div className="brand-tagline">Admin Portal</div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="nav-menu">
                    {navItems.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            onClick={() => {
                                if (window.innerWidth <= 1024) setMobileOpen(false);
                            }}
                        >
                            <span className="nav-icon"><Icon size={18} /></span>
                            <span className="nav-link-text">{name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        style={{ justifyContent: 'center' }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>

                    {/* Collapse button */}
                    <button
                        onClick={() => {
                            if (window.innerWidth <= 1024) setMobileOpen(false);
                            else setCollapsed(true);
                        }}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 10, marginTop: 8,
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.75)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 10,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.82rem', fontWeight: 600,
                            letterSpacing: '0.5px', textTransform: 'uppercase',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-color)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--secondary-color)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    >
                        <ChevronLeft size={16} />
                        <span>Collapse</span>
                    </button>
                </div>
            </div>

            {/* Floating arrow - Appearance managed by CSS using the .floating-reopen-btn class */}
            <button
                className="floating-reopen-btn"
                onClick={() => {
                    if (window.innerWidth <= 1024) setMobileOpen(true);
                    else setCollapsed(false);
                }}
                aria-label="Open sidebar"
            >
                <ChevronRight size={16} />
            </button>
        </>
    );
};

export default AdminSidebar;