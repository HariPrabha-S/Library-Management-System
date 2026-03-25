import { FiCheckCircle } from "react-icons/fi";

export default function IssueTable({ issues, markReturned }) {

    return (

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
                                        <span className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{issue.student}</span>
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
                                                onClick={() => markReturned(issue._id)}
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
    );
}
