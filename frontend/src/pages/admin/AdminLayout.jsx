import { useState, useEffect } from "react";
import AdminSidebar from "./components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/books")) setActive("books");
    else if (path.includes("/admin/students")) setActive("students");
    else if (path.includes("/admin/faculties")) setActive("faculties");
    else if (path.includes("/admin/issues")) setActive("issues");
    else if (path.includes("/admin/attendance")) setActive("attendance");
    else if (path.includes("/admin/fines")) setActive("fines");
    else setActive("dashboard");
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      <div className="no-print">
        <AdminSidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      <div
        style={{
          marginLeft: collapsed ? 72 : 248,
          padding: 32,
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Outlet context={{ setCollapsed }} />
      </div>
    </div>
  );
}