import { FiCheckCircle } from "react-icons/fi";

export default function IssueTable({ issues, markReturned }) {

    return (

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

            <div className="overflow-x-auto">

                <table className="w-full text-left">

                    <thead>
                        <tr className="border-b text-gray-600 text-sm font-bold">
                            <th className="py-3">Student</th>
                            <th className="py-3">Book</th>
                            <th className="py-3">Department</th>
                            <th className="py-3">Issue Date</th>
                            <th className="py-3">Return Date</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Action</th>
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
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="py-3 font-medium">{issue.student}</td>
                                    <td className="py-3">{issue.book}</td>
                                    <td className="py-3">{issue.department}</td>
                                    <td className="py-3">{issue.issueDate}</td>
                                    <td className="py-3">{issue.returnDate}</td>

                                    <td className="py-3">
                                        {issue.status === "Returned" ? (
                                            <span className="text-green-600 font-medium">
                                                Returned
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium">
                                                Issued
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3">

                                        {issue.status === "Issued" && (
                                            <button
                                                onClick={() => markReturned(issue._id)}
                                                className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
                                            >
                                                <FiCheckCircle /> Return
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
