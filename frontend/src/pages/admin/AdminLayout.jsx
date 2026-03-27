import { useState, useEffect } from "react";
import AdminSidebar from "./components/Sidebar";
import AdminHeader from "./components/Header";
import { Outlet, useLocation } from "react-router-dom";

const routeTitles = {
  '/admin/dashboard': { title: 'Admin Dashboard', subtitle: 'Overview of system status' },
  '/admin/books': { title: 'Manage Books', subtitle: 'Global book catalog management' },
  '/admin/students': { title: 'Manage Students', subtitle: 'Student directory and activities' },
  '/admin/faculties': { title: 'Manage Faculties', subtitle: 'Faculty directory and permissions' },
  '/admin/issues': { title: 'Manage Issues', subtitle: 'Monitor borrow/return transactions' },
  '/admin/attendance': { title: 'User Attendance', subtitle: 'Daily library visit logs' },
  '/admin/fines': { title: 'Manage Records', subtitle: 'Track and collect overdue fines' },
};

export default function AdminLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const currentRoute = routeTitles[location.pathname] || { title: 'Admin Portal', subtitle: '' };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        user={user}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className="main-content admin-main-content"
        style={{
          marginLeft: collapsed ? 0 : '',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <main className="page-body admin-page-body">
          <Outlet context={{ setCollapsed }} />
        </main>
      </div>
    </div>
  );
}