import { useEffect, useState } from "react";
import AdminActivity from "./components/Activity";
import AdminRecent from "./components/Recent";
import { FiCalendar, FiClock, FiBook, FiBookOpen, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiPlusCircle, FiRotateCcw, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import adminService from "./services/adminService";

function fineSeverity(fine) {
    if (fine >= 300) return { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "#ef4444" };
    if (fine >= 150) return { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "#f59e0b" };
    return { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", dot: "#eab308" };
}

export default function AdminDashboard() {
    const [dateTime, setDateTime] = useState(new Date());
    const [stats, setStats] = useState({
        totalBooks: "0",
        issuedBooks: "0",
        availableBooks: "0",
        overdueBooks: "0",
        issuedToday: "0",
        issuedMonth: "0",
    });
    const [overdueRecords, setOverdueRecords] = useState([]);
    const [bookRequests, setBookRequests] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsRes = await adminService.getDashboardStats();
            const overdueRes = await adminService.getOverdueQueue();
            const requestsRes = await adminService.getDashboardRequests();
            const recentRes = await adminService.getDashboardRecent();

            if (statsRes.success) setStats(statsRes.data);
            if (overdueRes.success) setOverdueRecords(overdueRes.data);
            if (requestsRes.success) setBookRequests(requestsRes.data);
            if (recentRes.success) setRecentTransactions(recentRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    /* Live clock and Initial Fetch */
    useEffect(() => {
        fetchDashboardData();
        const t = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const getStatusStyle = (status) => {
        if (status === "Issued") return "text-yellow-600";
        if (status === "Returned") return "text-green-600";
        if (status === "Overdue") return "text-red-600";
        return "";
    };

    const handleProcessRequest = async (id, action) => {
        try {
            if (action === "approve") {
                await adminService.approveRequest(id);
                alert("Request approved and book issued.");
            } else {
                await adminService.rejectRequest(id);
                alert("Request rejected.");
            }
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error("Error processing request:", error);
            alert("Failed to process request");
        }
    };

    return (
        <>
            <div className="min-h-screen">
                <div className={loading ? "opacity-50 pointer-events-none" : ""}>

                    {/* ── HEADER ── */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 dashboard-header">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="font-heading text-2xl md:text-3xl font-bold text-(--color-primary)">
                                    Library Dashboard
                                </h1>
                                <p className="text-gray-600 opacity-80 text-sm md:text-base">
                                    Welcome back! Here's your real-time LMS overview.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:gap-6 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                <FiCalendar className="text-(--color-primary)" />
                                <span>{dateTime.toDateString()}</span>
                            </div>
                            <div className="hidden md:block w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                <FiClock className="text-(--color-secondary)" />
                                <span>{dateTime.toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── STAT CARDS ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-(--color-primary) hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Total Books</p>
                                <h3 className="text-3xl font-bold text-(--color-primary) mb-2">{stats.totalBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">In library collection</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-(--color-primary) border border-red-100 group-hover:scale-110 transition-transform">
                                <FiBook size={24} />
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-(--color-secondary) hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Currently Issued</p>
                                <h3 className="text-3xl font-bold text-(--color-secondary) mb-2">{stats.issuedBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active borrowings</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-(--color-secondary) border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiBookOpen size={24} />
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-(--color-secondary) hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Available Books</p>
                                <h3 className="text-3xl font-bold text-(--color-secondary) mb-2">{stats.availableBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Ready for issue</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-(--color-secondary) border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiCheckCircle size={24} />
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Overdue Books</p>
                                <h3 className="text-3xl font-bold text-red-600 mb-2">{stats.overdueBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Immediate attention</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 group-hover:scale-110 transition-transform">
                                <FiAlertCircle size={24} />
                            </div>
                        </div>

                    </div>

                    {/* ── OVERDUE PRIORITY SECTION ── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <FiTrendingUp className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[1.3rem] font-bold text-(--color-primary) font-heading">Overdue Books — Priority Queue</h2>
                                    <p className="text-xs text-gray-500">Highest fines first · {overdueRecords.length} overdues found</p>
                                </div>
                            </div>
                        </div>

                        <div className="overdue-table-wrap overflow-x-auto">
                            <table className="w-full text-sm" style={{ minWidth: 700 }}>
                                <thead className="border-b border-gray-100">
                                    <tr className="bg-gray-50/50 text-gray-700 text-sm font-semibold leading-tight">
                                        <th className="px-6 py-4 text-left">#</th>
                                        <th className="px-4 py-4 text-left">Borrower</th>
                                        <th className="px-4 py-4 text-left">Book</th>
                                        <th className="px-4 py-4 text-center">Due Date</th>
                                        <th className="px-4 py-4 text-center">Days Overdue</th>
                                        <th className="px-4 py-4 text-right">Fine (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueRecords.length === 0 ? (
                                        <tr><td colSpan="6" className="py-8 text-center text-gray-400">No overdue records found.</td></tr>
                                    ) : (
                                        overdueRecords.map((rec, idx) => {
                                            const sev = fineSeverity(parseFloat(rec.fine));
                                            return (
                                                <tr key={rec.id} className={`border-t border-gray-100 ${sev.bg} hover:brightness-[0.98] transition-all`}>
                                                    <td className="px-6 py-3.5">
                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${sev.badge}`}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="font-semibold text-gray-900">{rec.student}</p>
                                                        <p className="text-xs text-gray-400">{rec.rollNo}</p>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="text-gray-700 font-medium truncate max-w-[200px]" title={rec.book}>{rec.book}</p>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center text-gray-600">{rec.dueDate}</td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sev.badge}`}>
                                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot }} />
                                                            {rec.days} days
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-base text-gray-900">₹{rec.fine}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── COMPACT NOTIFICATIONS PANEL ── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                    <FiPlusCircle className="text-teal-600" size={16} />
                                </div>
                                <h2 className="text-sm font-bold text-(--color-primary) uppercase tracking-widest">Recent Activity & Notifications</h2>
                            </div>
                            <button
                                onClick={() => navigate('/admin/requests')}
                                className="text-[10px] font-bold text-teal-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                            >
                                View All Requests <FiArrowRight />
                            </button>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                            {bookRequests.length === 0 ? (
                                <div className="py-12 text-center text-gray-400 font-medium">No pending requests at the moment.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {bookRequests.slice(0, 5).map((req) => (
                                        <div key={req.id} className="p-4 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                                                    Req
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight">{req.student}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium truncate max-w-[250px]">
                                                        Requested: <span className="text-teal-600 font-semibold">{req.book}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-gray-400 font-bold">{new Date(req.date).toLocaleDateString()}</span>
                                                <button
                                                    onClick={() => handleProcessRequest(req.id, "approve")}
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <FiCheckCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <AdminActivity stats={stats} />
                    <AdminRecent recentTransactions={recentTransactions} getStatusStyle={getStatusStyle} />
                </div>
            </div>
        </>
    );
}
