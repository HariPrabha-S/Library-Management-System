import { FiDollarSign, FiSearch, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { User, Mail, GraduationCap, XCircle, BadgeCheck, Phone, Briefcase, BookOpen, AlertOctagon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ManageFines() {
    const [fines, setFines] = useState([]);
    const [search, setSearch] = useState("");
    const [viewedFine, setViewedFine] = useState(null);

    useEffect(() => {
        const dummyFines = [
            { id: 1, name: "Arun Kumar", type: "Student", amount: 150, reason: "Late Return - React JS Guide", status: "Unpaid" },
            { id: 2, name: "Priya Sharma", type: "Student", amount: 50, reason: "Late Return - Mathematics", status: "Unpaid" },
            { id: 3, name: "Dr. Rajesh Kumar", type: "Faculty", amount: 200, reason: "Lost Book - Physics Vol 1", status: "Unpaid" },
        ];
        setFines(dummyFines);
    }, []);

    const handleClearFine = (id) => {
        setFines(prev => prev.map(f => f.id === id ? { ...f, status: "Paid" } : f));
    }

    const filteredFines = fines.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                    <FiAlertCircle /> Manage Fines
                </h1>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-50 text-gray-700 text-sm font-semibold leading-tight">
                                <th className="py-4 px-3 whitespace-nowrap">Name</th>
                                <th className="py-4 px-3 whitespace-nowrap">Type</th>
                                <th className="py-4 px-3 whitespace-nowrap">Reason</th>
                                <th className="py-4 px-3 whitespace-nowrap">Amount (₹)</th>
                                <th className="py-4 px-3 whitespace-nowrap">Status</th>
                                <th className="py-4 px-3 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                        No fines found.
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
                                            {fine.status === 'Unpaid' ? (
                                                <button
                                                    onClick={() => handleClearFine(fine.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <FiCheckCircle size={14} /> Clear Fine
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs font-medium italic">Cleared</span>
                                            )}
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
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Fine Details</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ref: #FN-{viewedFine.id}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Imposed On</label>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{viewedFine.name} ({viewedFine.type})</p>
                                </div>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Reason for Fine</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedFine.reason}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Outstanding Amount</label>
                                    <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800 }}>₹{viewedFine.amount}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Payment Status</label>
                                    <p style={{ fontSize: '0.9rem', color: viewedFine.status === 'Paid' ? 'var(--success)' : 'var(--color-primary)', fontWeight: 700 }}>{viewedFine.status}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                                <button
                                    className="px-6 py-2 bg-(--color-primary) hover:bg-[#610a0a] text-white rounded-lg transition-colors font-medium text-sm shadow-md"
                                    onClick={() => setViewedFine(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
