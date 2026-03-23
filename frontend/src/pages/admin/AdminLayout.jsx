import { useState, useEffect } from "react";
import AdminSidebar from "./components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    return stored ? JSON.parse(stored) : false;
  });

  const [active, setActive] = useState(() => {
    return localStorage.getItem("sidebar_active") || 'dashboard';
  });

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
    localStorage.setItem("sidebar_collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("sidebar_active", active);
  }, [active]);

  return (
    <div className="bg-gray-100 min-h-screen">

      <div className="no-print">
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          active={active}
          setActive={setActive}
        />
      </div>

      <div
        className={`transition-all duration-300 ease-in-out
        ${collapsed ? "ml-20" : "ml-64"} p-8`}
      >
        <Outlet />
      </div>

    </div>
  );
}