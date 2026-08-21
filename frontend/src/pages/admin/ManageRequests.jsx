import { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiSearch, FiCalendar, FiClock, FiPlusCircle, FiArrowRight } from "react-icons/fi";
import adminService from "./services/adminService";

export default function ManageRequests() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await adminService.getRequests(); // Use full requests endpoint
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setLoading(true);
            if (action === "approve") {
                await adminService.approveRequest(id);
                alert("Request approved successfully!");
            } else if (action === "delete") {
                if (window.confirm("Delete this request permanently?")) {
                    await adminService.deleteRequest(id);
                    alert("Request deleted.");
                } else return;
            } else {
                await adminService.rejectRequest(id);
                alert("Request rejected.");
            }
            fetchRequests();
        } catch (error) {
            alert("Action failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.student || "").toLowerCase().includes(search.toLowerCase()) ||
            (req.book || "").toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" ||
            (filter === "pending" && req.status === "Pending") ||
            (filter === "processed" && req.status !== "Pending");
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-(--color-primary)">
                        Support & Requests
                    </h1>
                    <p className="text-gray-500 text-sm">Manage student and faculty waitlists for book issuance.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {['all', 'pending', 'processed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${filter === f ? 'bg-(--color-primary) text-white' : 'text-gray-500 hover:text-(--color-primary)'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requester or book title..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Requester Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Book Requested</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Date Requested</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                        No pending requests found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                    {req.student.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{req.student}</p>
                                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{req.rollNo || req.facultyId || "Student"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-semibold text-(--color-secondary) mb-1">{req.book}</p>
                                            <div className="flex items-center gap-2 text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full w-fit font-bold uppercase">
                                                Available for Issue
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {req.status === 'Pending' ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-sm font-bold text-gray-700">{new Date(req.date).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-gray-400 font-semibold">{new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                {req.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req.id, "approve")}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1"
                                                            title="Approve Request"
                                                        >
                                                            <FiCheckCircle size={18} /> <span className="text-[10px] font-bold uppercase">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, "reject")}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-1"
                                                            title="Reject Request"
                                                        >
                                                            <FiXCircle size={18} /> <span className="text-[10px] font-bold uppercase">Reject</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAction(req.id, "delete")}
                                                        className="p-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded ml-2"
                                                        title="Delete Permanently"
                                                    >
                                                        <FiXCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
