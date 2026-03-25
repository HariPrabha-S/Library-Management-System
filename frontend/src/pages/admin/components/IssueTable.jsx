import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { User, Book, XCircle, Calendar, Clock, Bookmark, Hash } from "lucide-react";

export default function IssueTable({ issues, markReturned }) {
    const [viewedIssue, setViewedIssue] = useState(null);

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="border-b text-gray-700 text-sm font-semibold leading-tight">
                                <th className="py-4 px-3">Student</th>
                                <th className="py-4 px-3">Book</th>
                                <th className="py-4 px-3">Department</th>
                                <th className="py-4 px-3">Issue Date</th>
                                <th className="py-4 px-3">Return Date</th>
                                <th className="py-4 px-3">Status</th>
                                <th className="py-4 px-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6 text-gray-400">
                                        No issue records
                                    </td>
                                </tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr
                                        key={issue._id}
                                        className="border-b last:border-none hover:bg-gray-50 transition text-sm cursor-pointer leading-tight group"
                                    >
                                        <td className="py-4 px-3">
                                            <span
                                                className="font-semibold text-gray-900 hover:text-(--color-primary) transition-colors cursor-pointer"
                                                onClick={() => setViewedIssue(issue)}
                                            >
                                                {issue.student}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 text-gray-600">{issue.book}</td>
                                        <td className="py-4 px-3 text-gray-600">{issue.department}</td>
                                        <td className="py-4 px-3 text-gray-600">{issue.issueDate}</td>
                                        <td className="py-4 px-3 text-gray-600">{issue.returnDate}</td>

                                        <td className="py-4 px-3">
                                            {issue.status === "Returned" ? (
                                                <span className="text-emerald-600 font-semibold">
                                                    Returned
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-semibold">
                                                    Issued
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-4 px-3">
                                            {issue.status === "Issued" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markReturned(issue._id);
                                                    }}
                                                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition font-semibold"
                                                >
                                                    <FiCheckCircle size={16} /> Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Details Modal */}
            {viewedIssue && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setViewedIssue(null)}>
                    <div className="bg-white rounded-2xl animate-fade-in shadow-2xl relative" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), #5a0808)', position: 'relative' }}>
                            <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setViewedIssue(null)}>
                                <XCircle size={20} color="var(--text-secondary)" />
                            </button>
                            <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 80, background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bookmark size={40} color="var(--color-primary)" />
                            </div>
                        </div>

                        <div style={{ padding: '50px 30px 30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Issue Details</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ref: #{viewedIssue._id.slice(-6).toUpperCase()}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Book Issued</label>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{viewedIssue.book}</p>
                                </div>
                                <div className="col-span-2">
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Issued To</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedIssue.student} ({viewedIssue.department})</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Issue Date</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedIssue.issueDate}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Due Date</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700 }}>{viewedIssue.returnDate}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                                <div>
                                    {viewedIssue.status === "Returned" ? (
                                        <span className="badge badge-success">Returned</span>
                                    ) : (
                                        <span className="badge badge-warning">Active Issue</span>
                                    )}
                                </div>
                                <button
                                    className="px-6 py-2 bg-(--color-primary) hover:bg-[#610a0a] text-white rounded-lg transition-colors font-medium text-sm shadow-md"
                                    onClick={() => setViewedIssue(null)}
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
