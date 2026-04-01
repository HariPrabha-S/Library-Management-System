import { useState, useEffect } from "react";
import adminService from "./services/adminService";
import FineReports from "./components/FineReports";
import { generateReport } from "./utils/reportGenerator";
import { FiDollarSign, FiSearch, FiCheckCircle, FiAlertCircle, FiRotateCcw, FiFileText } from "react-icons/fi";

export default function ManageFines() {
    const [fines, setFines] = useState([]);
    const [search, setSearch] = useState("");
    const [viewedFine, setViewedFine] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const res = await adminService.getFines();
            if (res.success) {
                // Backend already sorts by amount DESC
                setFines(res.data);
            }
        } catch (error) {
            console.error("Error fetching fines:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, []);

    const handleClearFine = async (id) => {
        if (!window.confirm("Mark this record as settled?")) return;
        try {
            setLoading(true);
            const res = await adminService.clearFine(id);
            if (res.success) {
                alert("Fine cleared successfully!");
                fetchFines();
            } else {
                alert(res.message || "Failed to clear fine");
            }
        } catch (error) {
            console.error(error);
            alert("Network error while clearing fine");
        } finally {
            setLoading(false);
        }
    }

    const handleRevertFine = async (id) => {
        if (!window.confirm("Revert this settlement back to unpaid?")) return;
        try {
            setLoading(true);
            const res = await adminService.revertFine(id);
            if (res.success) {
                alert("Settlement reverted successfully!");
                fetchFines();
            } else {
                alert(res.message || "Failed to revert");
            }
        } catch (error) {
            console.error(error);
            alert("Network error while reverting");
        } finally {
            setLoading(false);
        }
    }

    const filteredFines = fines.filter(f =>
        (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.reason || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                    <FiAlertCircle /> Manage Records
                </h1>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 bg-(--color-primary) text-white px-5 py-2 rounded-xl hover:opacity-90 font-medium shadow-sm transition-all"
                >
                    <FiFileText /> Generate Report
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or reason..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${loading ? 'opacity-50' : ''}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-50 text-gray-700 text-sm font-semibold leading-tight">
                                <th className="py-4 px-3 whitespace-nowrap">Name</th>
                                <th className="py-4 px-3 whitespace-nowrap">Type</th>
                                <th className="py-4 px-3 whitespace-nowrap">Reason</th>
                                <th className="py-4 px-3 whitespace-nowrap">Amount (₹)</th>
                                <th className="py-4 px-3 whitespace-nowrap">Status</th>
                                <th className="py-4 px-3 whitespace-nowrap text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                        {loading ? "Loading fines..." : "No fines found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine.id} className="border-b border-gray-200 last:border-none hover:bg-gray-50 transition cursor-pointer text-sm leading-tight text-gray-600 group">
                                        <td className="py-4 px-3 whitespace-nowrap align-middle">
                                            <span
                                                className="font-semibold text-gray-900 hover:text-(--color-primary) transition-colors cursor-pointer"
                                                onClick={() => setViewedFine(fine)}
                                            >
                                                {fine.name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 whitespace-nowrap align-middle">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${fine.type === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {fine.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 whitespace-nowrap align-middle text-gray-600">{fine.reason}</td>
                                        <td className="py-4 px-3 whitespace-nowrap align-middle font-bold text-red-600">₹{fine.amount}</td>
                                        <td className="py-4 px-3 whitespace-nowrap align-middle">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${fine.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {fine.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 whitespace-nowrap align-middle">
                                            <div className="flex items-center gap-3">
                                                {fine.status === 'Unpaid' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClearFine(fine.id);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm border border-emerald-100"
                                                    >
                                                        <FiCheckCircle size={14} /> Clear Fine
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRevertFine(fine.id);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm border border-amber-100"
                                                    >
                                                        <FiRotateCcw size={14} /> Revert
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

            {/* Fine Details Modal */}
            {viewedFine && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setViewedFine(null)}>
                    <div className="bg-white rounded-2xl animate-fade-in shadow-2xl relative" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), #5a0808)', position: 'relative' }}>
                            <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setViewedFine(null)}>
                                <XCircle size={20} color="var(--text-secondary)" />
                            </button>
                            <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 80, background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertOctagon size={40} color="var(--color-primary)" />
                            </div>
                        </div>

                        <div style={{ padding: '50px 30px 30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Record Details</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ref: #FN-{viewedFine.id}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Imposed On</label>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{viewedFine.name} ({viewedFine.type})</p>
                                </div>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Reason</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedFine.reason}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Amount</label>
                                    <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800 }}>₹{viewedFine.amount}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Status</label>
                                    <p style={{ fontSize: '0.9rem', color: viewedFine.status === 'Paid' ? 'var(--success)' : 'var(--color-primary)', fontWeight: 700 }}>{viewedFine.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FineReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                filters={{ search }}
                onPreview={async (columns, printOption, orientation, passedFilters, reportName) => {
                    try {
                        setLoading(true);
                        const res = await adminService.getFines({ ...passedFilters, limit: 1000 });
                        if (res.success) {
                            const reportData = res.data;
                            generateReport({
                                title: "Financial Audit",
                                reportName: reportName,
                                orientation: orientation,
                                columns: columns,
                                data: reportData,
                                summaryFields: [
                                    { label: "Total Fine Count", value: reportData.length },
                                    { label: "Total Outstanding", value: `₹${reportData.filter(r => r.status === 'Unpaid').reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString('en-IN')}` },
                                    { label: "Total Collected", value: `₹${reportData.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString('en-IN')}` }
                                ]
                            });
                            setShowReportModal(false);
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </>
    );
}
