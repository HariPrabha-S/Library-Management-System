import { Link } from "react-router-dom";
import { FiLogOut, FiHome, FiUsers, FiBook, FiBookOpen, FiChevronLeft, FiChevronRight, FiUserCheck, FiAlertCircle } from "react-icons/fi";
import { useEffect } from "react";

export default function AdminSidebar({ active, setActive, collapsed, setCollapsed }) {


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);   // mobile
            } else {
                setCollapsed(false);  // desktop
            }
        };

        handleResize(); // run on first load
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [setCollapsed]);


    return (
        <>
            <div
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[var(--color-primary)] to-[#5a001a] text-white 
  flex flex-col justify-between py-6 transition-all duration-300 ease-in-out shadow-2xl z-50
  ${collapsed ? "w-20 px-2" : "w-64 px-6"}`}
            >

                <div className="flex flex-col flex-1 mb-6">
                    {/* PROFILE SECTION */}
                    <div className={`flex flex-col items-center mb-4 ${collapsed ? "px-0" : "px-2"}`}>
                        {!collapsed ? (
                            <div className="text-center animate-fade-in">
                                <h2 className="font-heading text-3xl font-bold tracking-tight text-white mb-0.5">
                                    ADMIN
                                </h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">System Librarian</p>
                            </div>
                        ) : (
                            <div className="text-center animate-fade-in">
                                <h2 className="font-heading text-xl font-bold tracking-tight text-white mb-0.5">
                                    A
                                </h2>
                            </div>
                        )}
                    </div>

                    {/* MENU */}
                    <ul className="flex flex-col justify-evenly flex-1 mt-2">

                        {/* DASHBOARD */}
                        <li>
                            <Link
                                to="/admin/dashboard"
                                onClick={() => setActive("dashboard")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "dashboard"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "dashboard" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "dashboard"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiHome />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "dashboard" ? "text-white" : "text-white/80"}`}>
                                        Dashboard
                                    </span>
                                )}
                            </Link>
                        </li>
                        {/* MANAGE BOOKS */}
                        <li>
                            <Link
                                to="/admin/books"
                                onClick={() => setActive("books")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "books"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "books" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "books"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiBook />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "books" ? "text-white" : "text-white/80"}`}>
                                        Manage Books
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* MANAGE STUDENTS */}
                        <li>
                            <Link
                                to="/admin/students"
                                onClick={() => setActive("students")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "students"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "students" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "students"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiUsers />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "students" ? "text-white" : "text-white/80"}`}>
                                        Manage Students
                                    </span>
                                )}
                            </Link>
                        </li>
                        {/* MANAGE FACULTIES */}
                        <li>
                            <Link
                                to="/admin/faculties"
                                onClick={() => setActive("faculties")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "faculties"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "faculties" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "faculties"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiUsers />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "faculties" ? "text-white" : "text-white/80"}`}>
                                        Manage Faculties
                                    </span>
                                )}
                            </Link>
                        </li>
                        {/* MANAGE ISSUES */}
                        <li>
                            <Link
                                to="/admin/issues"
                                onClick={() => setActive("issues")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "issues"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "issues" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "issues"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiBookOpen />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "issues" ? "text-white" : "text-white/80"}`}>
                                        Issues
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* ATTENDANCE */}
                        <li>
                            <Link
                                to="/admin/attendance"
                                onClick={() => setActive("attendance")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "attendance"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "attendance" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "attendance"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiUserCheck />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "attendance" ? "text-white" : "text-white/80"}`}>
                                        Attendance
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* MANAGE FINES */}
                        <li>
                            <Link
                                to="/admin/fines"
                                onClick={() => setActive("fines")}
                                className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"
                                    } px-4 py-3 rounded-2xl transition-all duration-300
      ${active === "fines"
                                        ? "bg-white/10 text-white translate-x-1"
                                        : "opacity-60 hover:opacity-100 hover:bg-white/5 hover:translate-x-1"
                                    }`}
                            >
                                {/* ACTIVE PILL */}
                                {active === "fines" && (
                                    <div className="absolute left-0 w-1 h-6 bg-[var(--color-secondary)] rounded-full -translate-x-2 animate-pulse" />
                                )}

                                <span
                                    className={`text-xl transition-all duration-300 ${active === "fines"
                                        ? "text-[var(--color-secondary)] scale-110"
                                        : "text-white/70 group-hover:text-white"
                                        }`}
                                >
                                    <FiAlertCircle />
                                </span>

                                {!collapsed && (
                                    <span className={`font-bold tracking-wide transition-all duration-300 ${active === "fines" ? "text-white" : "text-white/80"}`}>
                                        Manage Fines
                                    </span>
                                )}
                            </Link>
                        </li>

                    </ul>
                </div>


                <div className="flex flex-col gap-4 mt-6">
                    {/* LOGOUT */}
                    <button
                        className={`group flex items-center ${collapsed ? "justify-center" : "gap-3 justify-center"
                            } px-4 py-3 bg-white text-[var(--color-primary)] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/10`}
                    >
                        <FiLogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        {!collapsed && <span className="font-bold tracking-tight">Logout</span>}
                    </button>

                    {/* COLLAPSE BUTTON */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`flex items-center ${collapsed ? "justify-center" : "gap-3 justify-center"
                            } px-4 py-3 border border-white/20 rounded-2xl bg-white/10 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group`}
                    >
                        {collapsed ? <FiChevronRight size={20} className="group-hover:scale-110 transition-transform" /> : (
                            <>
                                <FiChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-[0.25em] transition-all">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </div >
        </>
    );
}