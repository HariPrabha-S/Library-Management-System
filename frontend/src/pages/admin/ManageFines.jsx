import { useState, useEffect } from "react";
import { FiDollarSign, FiSearch, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ManageFines() {
    const [fines, setFines] = useState([]);
    const [search, setSearch] = useState("");

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
                                            <span className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{fine.name}</span>
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
        </>
    );
}
