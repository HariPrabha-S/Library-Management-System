import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Books', to: '/admin/books', icon: BookOpen },
    { name: 'Manage Students', to: '/admin/students', icon: Users },
    { name: 'Manage Faculties', to: '/admin/faculties', icon: GraduationCap },
    { name: 'Issues', to: '/admin/issues', icon: BookMarked },
    { name: 'Attendance', to: '/admin/attendance', icon: UserCheck },
    { name: 'Manage Fines', to: '/admin/fines', icon: AlertCircle },
];

export default function AdminSidebar({ active, setActive, collapsed, setCollapsed }) {
    const navigate = useNavigate();

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth < 768) setCollapsed(true); };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setCollapsed]);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const sidebarWidth = collapsed ? 72 : 248;

    return (
        <div
            className={`no-scrollbar sidebar ${!collapsed ? 'active' : ''}`}
            style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
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
            <div style={{
                padding: collapsed ? '26px 0 20px' : '26px 24px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 13,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
            }}>
                <div style={{
                    width: 42, height: 42,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                    <BookOpen size={22} color="white" />
                </div>
                {!collapsed && (
                    <div>
                        <div style={{
                            color: 'white',
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            lineHeight: 1.1,
                        }}>LMS</div>
                        <div style={{
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: '0.7rem',
                            fontWeight: 400,
                            letterSpacing: '0.3px',
                        }}>Admin Portal</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 12px', flex: 1 }}>
                {navItems.map(({ name, to, icon: Icon }) => {
                    const key = to.split('/').pop();
                    const isActive = active === key;
                    return (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setActive(key)}
                            title={collapsed ? name : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: 12,
                                padding: '11px 14px',
                                borderRadius: 10,
                                color: isActive ? 'white' : 'rgba(255,255,255,0.72)',
                                textDecoration: 'none',
                                fontSize: '0.88rem',
                                fontWeight: isActive ? 600 : 500,
                                fontFamily: "'Inter', sans-serif",
                                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                                }
                            }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <span style={{
                                    position: 'absolute',
                                    left: 0, top: '20%', bottom: '20%',
                                    width: 3,
                                    background: '#4dd8dc',
                                    borderRadius: '0 3px 3px 0',
                                }} />
                            )}
                            <span style={{
                                width: 20, height: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                color: isActive ? '#4dd8dc' : undefined,
                            }}>
                                <Icon size={18} />
                            </span>
                            {!collapsed && <span style={{ flex: 1 }}>{name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{
                padding: '12px 12px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}>
                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '13px 14px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.opacity = '0.65';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
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
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--secondary-color)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--secondary-color)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
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
}