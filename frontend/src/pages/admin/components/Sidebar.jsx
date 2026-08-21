import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    BookMarked,
    AlertCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    FolderTree,
    Building2,
    Languages,
    Store,
    BookText,
    CalendarDays,
    Library,
} from 'lucide-react';

const navItems = [
    { name: 'Master', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Books', path: '/admin/books', icon: BookOpen },
    {
        name: 'Members',
        icon: Users,
        children: [
            { name: 'Students', path: '/admin/students', icon: Users },
            { name: 'Faculties', path: '/admin/faculties', icon: GraduationCap },
        ],
    },
    {
        name: 'Sub Entries',
        icon: FolderTree,
        children: [
            { name: 'Department', path: '/admin/subentries/department', icon: Building2 },
            { name: 'Language', path: '/admin/subentries/language', icon: Languages },
            { name: 'Vendors', path: '/admin/subentries/vendors', icon: Store },
            { name: 'Subject', path: '/admin/subentries/subject', icon: BookText },
            { name: 'Holiday', path: '/admin/subentries/holiday', icon: CalendarDays },
            { name: 'Publisher', path: '/admin/subentries/publisher', icon: Library },
            { name: 'Students by Academic Year', path: '/admin/subentries/academic-year-students', icon: GraduationCap },
        ],
    },
    { name: 'Circulation', path: '/admin/issues', icon: BookMarked },
    { name: 'Reservations', path: '/admin/reservations', icon: BookMarked },
    { name: 'Fine Amount', path: '/admin/fines', icon: AlertCircle },
    { name: 'Digital Resources', path: '/admin/resources', icon: BookMarked },
    { name: 'Requests', path: '/admin/requests', icon: BookMarked },
];

const AdminSidebar = ({
    onLogout,
    collapsed,
    setCollapsed,
    mobileOpen = false,
    setMobileOpen = () => { },
}) => {
    const navigate = useNavigate();
    const [membersOpen, setMembersOpen] = useState(true);
    const [subEntriesOpen, setSubEntriesOpen] = useState(true);

    // Lock body scroll while the mobile drawer is open, so the
    // page behind it can't scroll and show its own scrollbar.
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

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
                className={`no-scrollbar sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''
                    }`}
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
                    {navItems.map((item) => {
                        // Dropdown menus
                        if (item.children) {
                            const Icon = item.icon;
                            const isOpen = item.name === 'Members' ? membersOpen : subEntriesOpen;
                            const toggleOpen = item.name === 'Members' ? () => setMembersOpen(!membersOpen) : () => setSubEntriesOpen(!subEntriesOpen);

                            return (
                                <div key={item.name} className="nav-group">
                                    <button
                                        className="nav-link"
                                        onClick={toggleOpen}
                                        style={{
                                            width: '100%',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span className="nav-icon">
                                                <Icon size={18} />
                                            </span>
                                            <span className="nav-link-text">
                                                {item.name}
                                            </span>
                                        </div>

                                        {isOpen ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </button>

                                    {isOpen &&
                                        item.children.map(
                                            ({ name, path, icon: ChildIcon }) => (
                                                <NavLink
                                                    key={path}
                                                    to={path}
                                                    className={({ isActive }) =>
                                                        `nav-link${isActive ? ' active' : ''
                                                        }`
                                                    }
                                                    style={{ paddingLeft: '48px' }}
                                                    onClick={() => {
                                                        if (
                                                            window.innerWidth <= 1024
                                                        )
                                                            setMobileOpen(false);
                                                    }}
                                                >
                                                    <span className="nav-icon">
                                                        <ChildIcon size={18} />
                                                    </span>
                                                    <span className="nav-link-text">
                                                        {name}
                                                    </span>
                                                </NavLink>
                                            )
                                        )}
                                </div>
                            );
                        }

                        // Normal menu items
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link${isActive ? ' active' : ''}`
                                }
                                onClick={() => {
                                    if (window.innerWidth <= 1024)
                                        setMobileOpen(false);
                                }}
                            >
                                <span className="nav-icon">
                                    <Icon size={18} />
                                </span>
                                <span className="nav-link-text">
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}
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
                            if (window.innerWidth <= 1024)
                                setMobileOpen(false);
                            else setCollapsed(true);
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                'var(--secondary-color)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor =
                                'var(--secondary-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                                'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color =
                                'rgba(255,255,255,0.75)';
                            e.currentTarget.style.borderColor =
                                'rgba(255,255,255,0.15)';
                        }}
                    >
                        <ChevronLeft size={16} />
                        <span>Collapse</span>
                    </button>
                </div>
            </div>

            {/* Floating arrow */}
            <button
                className="floating-reopen-btn"
                onClick={() => {
                    if (window.innerWidth <= 1024)
                        setMobileOpen(true);
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