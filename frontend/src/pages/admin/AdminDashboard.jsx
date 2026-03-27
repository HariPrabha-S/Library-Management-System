import { useEffect, useState } from "react";
import AdminActivity from "./components/Activity";
import AdminRecent from "./components/Recent";
import { FiCalendar, FiClock, FiBook, FiBookOpen, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiPlusCircle, FiRotateCcw } from "react-icons/fi";

/* ── Dummy overdue data ── */
const overdueRecords = [
    { id: 1, student: "Arjun Mehta", rollNo: "CSE045", book: "Data Structures & Algorithms", issuedDate: "2026-02-01", dueDate: "2026-02-15", days: 38, fine: 380 },
    { id: 2, student: "Kavya Reddy", rollNo: "ECE022", book: "Operating System Concepts", issuedDate: "2026-02-05", dueDate: "2026-02-20", days: 33, fine: 330 },
    { id: 3, student: "Rahul Sharma", rollNo: "IT010", book: "Computer Networks", issuedDate: "2026-02-10", dueDate: "2026-02-25", days: 28, fine: 280 },
    { id: 4, student: "Sneha Patel", rollNo: "ME031", book: "Fluid Mechanics", issuedDate: "2026-02-18", dueDate: "2026-03-04", days: 21, fine: 210 },
    { id: 5, student: "Vikram Singh", rollNo: "CSE067", book: "Theory of Computation", issuedDate: "2026-02-22", dueDate: "2026-03-08", days: 17, fine: 170 },
    { id: 6, student: "Priya Nair", rollNo: "AIDS014", book: "Deep Learning", issuedDate: "2026-03-01", dueDate: "2026-03-15", days: 10, fine: 100 },
    { id: 7, student: "Aarav Joshi", rollNo: "EEE009", book: "Power System Engineering", issuedDate: "2026-03-05", dueDate: "2026-03-19", days: 6, fine: 60 },
];

/* ── Dummy book requests data ── */
const bookRequests = [
    { id: 1, requester: "Arjun Mehta", rollNo: "CSE045", book: "Advanced Calculus", author: "Gerald B. Folland", date: "2026-03-25", urgency: "High" },
    { id: 2, requester: "Kavya Reddy", rollNo: "ECE022", book: "Clean Code", author: "Robert C. Martin", date: "2026-03-24", urgency: "Medium" },
    { id: 3, requester: "Sneha Patel", rollNo: "ME031", book: "Machine Design", author: "R.S. Khurmi", date: "2026-03-22", urgency: "Low" },
    { id: 4, requester: "Vikram Singh", rollNo: "CSE067", book: "The Pragmatic Programmer", author: "Andy Hunt", date: "2026-03-21", urgency: "Medium" },
];

function fineSeverity(fine) {
    if (fine >= 300) return { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "#ef4444" };
    if (fine >= 150) return { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "#f59e0b" };
    return { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", dot: "#eab308" };
}

export default function AdminDashboard() {
    const [dateTime, setDateTime] = useState(new Date());
    const [processedRequests, setProcessedRequests] = useState({});

    const [stats, setStats] = useState({
        totalBooks: "100",
        issuedBooks: "10",
        availableBooks: "90",
        overdueBooks: "5",
        issuedToday: "2",
        issuedMonth: "20",
        returnedToday: "0",
        returnedMonth: "0",
    });

    /* Sort overdue by fine descending (highest first) and take top 5 */
    const sortedOverdue = [...overdueRecords].sort((a, b) => b.fine - a.fine);
    const topOverdue = sortedOverdue.slice(0, 5);
    const totalOverdueFine = sortedOverdue.reduce((s, r) => s + r.fine, 0);

    /* Live clock */
    useEffect(() => {
        const t = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const getStatusStyle = (status) => {
        if (status === "Issued") return "text-yellow-600";
        if (status === "Returned") return "text-green-600";
        if (status === "Overdue") return "text-red-600";
        return "";
    };

    return (
        <>
            <div className="min-h-screen">
                <div>

                    {/* ── HEADER ── */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 dashboard-header">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="font-heading text-2xl md:text-3xl font-bold text-(--color-primary)">
                                    Library Dashboard
                                </h1>
                                <p className="text-gray-600 opacity-80 text-sm md:text-base">
                                    Welcome back! Here's your LMS overview.
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
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-(--color-primary) opacity-[0.05] rounded-full z-0" />
                        </div>

                        {/* Currently Issued */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-(--color-secondary) hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Currently Issued</p>
                                <h3 className="text-3xl font-bold text-(--color-secondary) mb-2">{stats.issuedBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active borrowings</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-(--color-secondary) border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiBookOpen size={24} />
                            </div>
                            <div className="absolute -bottom-12 right-12 w-32 h-32 bg-(--color-secondary) opacity-[0.05] rounded-full z-0" />
                        </div>

                        {/* Available Books */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-(--color-secondary) hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Available Books</p>
                                <h3 className="text-3xl font-bold text-(--color-secondary) mb-2">{stats.availableBooks}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Ready for issue</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-(--color-secondary) border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiCheckCircle size={24} />
                            </div>
                            <div className="absolute top-4 -left-12 w-32 h-32 bg-(--color-secondary) opacity-[0.05] rounded-full z-0" />
                        </div>

                        {/* Overdue Books */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Overdue Books</p>
                                <h3 className="text-3xl font-bold text-red-600 mb-2">{sortedOverdue.length}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Immediate attention</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 group-hover:scale-110 transition-transform">
                                <FiAlertCircle size={24} />
                            </div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-red-500 opacity-[0.05] rounded-full z-0" />
                        </div>

                    </div>

                    {/* ── OVERDUE PRIORITY SECTION ── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                        {/* Section header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <FiTrendingUp className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[1.3rem] font-bold text-(--color-primary) font-heading">Overdue Books — Priority Queue</h2>
                                    <p className="text-xs text-gray-500">Top 5 highest fines · {sortedOverdue.length} total overdues</p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overdue-table-wrap overflow-x-auto">
                            <table className="w-full text-sm" style={{ minWidth: 700 }}>
                                <thead className="border-b border-gray-100">
                                    <tr className="bg-gray-50/50 text-gray-700 text-sm font-semibold leading-tight">
                                        <th className="px-6 py-4 text-left">#</th>
                                        <th className="px-4 py-4 text-left">Student</th>
                                        <th className="px-4 py-4 text-left">Book</th>
                                        <th className="px-4 py-4 text-center">Due Date</th>
                                        <th className="px-4 py-4 text-center">Days Overdue</th>
                                        <th className="px-4 py-4 text-right">Fine (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topOverdue.map((rec, idx) => {
                                        const sev = fineSeverity(rec.fine);
                                        return (
                                            <tr
                                                key={rec.id}
                                                className={`border-t border-gray-100 ${sev.bg} hover:brightness-[0.98] transition-all`}
                                            >
                                                {/* Rank badge */}
                                                <td className="px-6 py-3.5">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${sev.badge}`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>

                                                {/* Student */}
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-gray-900">{rec.student}</p>
                                                    <p className="text-xs text-gray-400">{rec.rollNo}</p>
                                                </td>

                                                {/* Book */}
                                                <td className="px-4 py-3.5">
                                                    <p className="text-gray-700 font-medium max-w-[200px] truncate" title={rec.book}>
                                                        {rec.book}
                                                    </p>
                                                </td>

                                                {/* Due date */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-gray-600">{rec.dueDate}</span>
                                                </td>

                                                {/* Days overdue */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sev.badge}`}>
                                                        <span
                                                            style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot, display: "inline-block" }}
                                                        />
                                                        {rec.days} days
                                                    </span>
                                                </td>

                                                {/* Fine */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className={`text-base font-bold ${sev.text}`}>
                                                        ₹{rec.fine}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── BOOK REQUESTS SECTION ── */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                <FiPlusCircle className="text-teal-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-[1.3rem] font-bold text-(--color-primary) font-heading">Requests</h2>
                                <p className="text-xs text-gray-500">Requests from Students & Faculty · {bookRequests.length} pending</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" style={{ minWidth: 700 }}>
                                <thead className="border-b border-gray-100">
                                    <tr className="bg-gray-50/50 text-gray-700 font-semibold leading-tight">
                                        <th className="px-6 py-4 text-left">Requester</th>
                                        <th className="px-4 py-4 text-left">Book Title / Author</th>
                                        <th className="px-4 py-4 text-center">Request Date</th>
                                        <th className="px-4 py-4 text-center">Urgency</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookRequests.map((req) => (
                                        <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{req.requester}</p>
                                                <p className="text-xs text-gray-400">{req.rollNo}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-gray-700 font-medium">{req.book}</p>
                                                <p className="text-xs text-gray-400 italic">{req.author}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-600">
                                                {req.date}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${req.urgency === 'High' ? 'bg-red-100 text-red-700' :
                                                    req.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-4">
                                                    {processedRequests[req.id] ? (
                                                        <button
                                                            onClick={() => {
                                                                setProcessedRequests((prev) => ({
                                                                    ...prev,
                                                                    [req.id]: false,
                                                                }));
                                                                alert(`Reverting request for ${req.requester}`);
                                                            }}
                                                            className="flex items-center gap-2 text-amber-600 hover:text-amber-800 transition font-bold"
                                                        >
                                                            <FiRotateCcw size={16} /> Revert
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setProcessedRequests((prev) => ({
                                                                    ...prev,
                                                                    [req.id]: true,
                                                                }));
                                                                // In a real app, actually remove/move the request
                                                                alert(`Processing request for ${req.requester}`);
                                                            }}
                                                            className="flex items-center gap-2 text-(--color-secondary) hover:text-teal-700 transition font-bold"
                                                        >
                                                            <FiCheckCircle size={16} /> Process
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <AdminActivity stats={stats} />
                    <AdminRecent recentTransactions={[]} getStatusStyle={getStatusStyle} />
                </div>
            </div>
        </>
    );
}
