import { useState,useEffect } from "react";
import { FiTrash } from "react-icons/fi";
import { User, Mail, GraduationCap, XCircle, BadgeCheck, Phone, Briefcase, BookOpen } from "lucide-react";

export default function FacultyTable({ faculties, selectedFaculties, onSelect, onDelete, selectedColumns, isPrintable }) {
    const [viewedFaculty, setViewedFaculty] = useState(null);

    useEffect(() => {
        const handleKeys = (e) => {
            if (!viewedFaculty) return;
            if (e.key === "Escape" || e.key === "Enter") {
                setViewedFaculty(null);
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [viewedFaculty]);

    const isColVisible = (colName) => {
        if (!selectedColumns) return true;
        return selectedColumns.includes(colName);
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${isPrintable ? "print-table-container !p-0 !shadow-none !border-none" : ""}`}>
            <div className="overflow-x-auto">
                <table className={`w-full text-left ${isPrintable ? "print-table border-collapse border border-gray-300" : "min-w-[1000px]"}`}>
                    <thead>
                        <tr className={`${isPrintable ? "bg-gray-50 border-b border-gray-300" : "border-b"} text-gray-700 text-sm font-semibold leading-tight`}>
                            {isColVisible('name') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Name</th>}
                            {isColVisible('facultyId') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Employee ID</th>}
                            {isColVisible('department') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Department</th>}
                            {isColVisible('designation') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Designation</th>}
                            {isColVisible('email') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Email</th>}
                            {isColVisible('totalBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Total Books</th>}
                            {isColVisible('issuedBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Issued</th>}
                            {isColVisible('returnedBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Returned</th>}
                            {isColVisible('fine') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Fine (₹)</th>}
                            {!isPrintable && <th className="py-4 px-3">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {faculties.length === 0 ? (
                            <tr>
                                <td colSpan={isPrintable ? (selectedColumns?.length || 5) : 10} className="text-center py-6 text-gray-400">
                                    No faculty found
                                </td>
                            </tr>
                        ) : (
                            faculties.map(faculty => (
                                <tr key={faculty._id} className={`${isPrintable ? "border-b border-gray-300" : "border-b last:border-none hover:bg-gray-50 transition"} text-sm cursor-pointer leading-tight group`}>
                                    {isColVisible('name') && (
                                        <td className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>
                                            <span
                                                className={`font-semibold cursor-pointer ${isPrintable ? "text-black" : "text-gray-900 hover:text-[var(--color-primary)] transition-colors"}`}
                                                onClick={() => !isPrintable && setViewedFaculty(faculty)}
                                            >
                                                {faculty.name}
                                            </span>
                                        </td>
                                    )}
                                    {isColVisible('facultyId') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.employeeId}</td>}
                                    {isColVisible('department') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.department}</td>}
                                    {isColVisible('designation') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.designation}</td>}
                                    {isColVisible('email') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.email}</td>}

                                    {isColVisible('totalBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.totalBooks}</td>}
                                    {isColVisible('issuedBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.issuedBooks}</td>}
                                    {isColVisible('returnedBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{faculty.returnedBooks}</td>}
                                    {isColVisible('fine') && <td className={`py-4 px-3 font-semibold ${isPrintable ? "border border-gray-300 text-black" : faculty.fine > 0 ? "text-red-500" : "text-emerald-600"}`}>₹{faculty.fine}</td>}

                                    {!isPrintable && (
                                        <td className="py-4 px-3 flex gap-4 items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedFaculties?.includes(faculty._id)}
                                                onChange={() => onSelect(faculty._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                            />
                                            <button
                                                onClick={() => onDelete(faculty._id)}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete faculty"
                                            >
                                                <FiTrash size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Faculty Details Modal */}
            {viewedFaculty && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setViewedFaculty(null)}>
                    <div className="bg-white rounded-2xl animate-fade-in shadow-2xl relative" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), #5a0808)', position: 'relative' }}>
                            <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setViewedFaculty(null)}>
                                <XCircle size={20} color="var(--text-secondary)" />
                            </button>
                            <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 80, background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={40} color="var(--color-primary)" />
                            </div>
                        </div>

                        <div style={{ padding: '50px 30px 30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{viewedFaculty.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{viewedFaculty.employeeId || viewedFaculty.facultyId} • {viewedFaculty.designation}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Department</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedFaculty.department}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Email Address</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedFaculty.email}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Library Usage</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedFaculty.totalBooks} Issued</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Fine Owed</label>
                                    <p style={{ fontSize: '0.9rem', color: viewedFaculty.fine > 0 ? 'var(--color-primary)' : 'var(--success)', fontWeight: 700 }}>₹{viewedFaculty.fine}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span className="badge badge-primary"><BookOpen size={11} /> {viewedFaculty.issuedBooks} Active</span>
                                    <span className="badge badge-neutral"><BadgeCheck size={11} /> {viewedFaculty.returnedBooks} Ret.</span>
                                </div>
                                <button
                                    className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[#610a0a] text-white rounded-lg transition-colors font-medium text-sm shadow-md"
                                    onClick={() => setViewedFaculty(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
