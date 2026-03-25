import { useEffect, useState } from "react";
import AdminActivity from "./components/Activity";
import AdminRecent from "./components/Recent";
import { FiCalendar, FiClock, FiBook, FiBookOpen, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function AdminDashboard() {
    const [dateTime, setDateTime] = useState(new Date());


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

    const [recentTransactions, setRecentTransactions] = useState([]);

    // Live Date & Time
    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Backend Fetch (Ready for API)
    useEffect(() => {
        // Example:
        // fetch("/api/dashboard")
        //   .then(res => res.json())
        //   .then(data => {
        //     setStats(data.stats);
        //     setRecentTransactions(data.transactions);
        //   });
    }, []);

    const getStatusStyle = (status) => {
        if (status === "Issued") return "text-yellow-600";
        if (status === "Returned") return "text-green-600";
        if (status === "Overdue") return "text-red-600";
        return "";
    };

    return (
        <>
            <div className="min-h-screen ">

                <div>

                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] ">
                                Library Dashboard
                            </h1>
                            <p className="text-gray-600 opacity-80">
                                Welcome back! Here’s your LMS overview.
                            </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                <FiCalendar className="text-[var(--color-primary)]" />
                                <span>{dateTime.toDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                <FiClock className="text-[var(--color-secondary)]" />
                                <span>{dateTime.toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* ================= TOP CARDS (REDESIGNED) ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                        {/* Total Books */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[var(--color-primary)] hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Total Books</p>
                                <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                                    {stats.totalBooks}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">In library collection</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-primary)] border border-red-100 group-hover:scale-110 transition-transform">
                                <FiBook size={24} />
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-(--color-primary) opacity-[0.05] rounded-full z-0"></div>
                        </div>

                        {/* Currently Issued */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[var(--color-secondary)] hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Currently Issued</p>
                                <h3 className="text-3xl font-bold text-[var(--color-secondary)] mb-2">
                                    {stats.issuedBooks}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active borrowings</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[var(--color-secondary)] border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiBookOpen size={24} />
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-12 right-12 w-32 h-32 bg-(--color-secondary) opacity-[0.05] rounded-full z-0"></div>
                        </div>

                        {/* Available Books */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[var(--color-secondary)] hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Available Books</p>
                                <h3 className="text-3xl font-bold text-[var(--color-secondary)] mb-2">
                                    {stats.availableBooks}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Ready for issue</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[var(--color-secondary)] border border-teal-100 group-hover:scale-110 transition-transform">
                                <FiCheckCircle size={24} />
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute top-4 -left-12 w-32 h-32 bg-(--color-secondary) opacity-[0.05] rounded-full z-0"></div>
                        </div>

                        {/* Overdue Books */}
                        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[var(--color-primary)] hover:shadow-xl transition group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium opacity-80 mb-1">Overdue Books</p>
                                <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                                    {stats.overdueBooks}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Immediate attention</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-primary)] border border-red-100 group-hover:scale-110 transition-transform">
                                <FiAlertCircle size={24} />
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-(--color-primary) opacity-[0.05] rounded-full z-0"></div>
                        </div>
                    </div>

                    <AdminActivity stats={stats} />
                    <AdminRecent recentTransactions={recentTransactions} getStatusStyle={getStatusStyle} />
                </div>
            </div>
        </>
    );
}