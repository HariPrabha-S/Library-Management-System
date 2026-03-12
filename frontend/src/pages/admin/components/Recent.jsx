export default function AdminRecent({ recentTransactions, getStatusStyle }) {
    return (
        <>

            {/* ================= RECENT TRANSACTIONS ================= */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="font-heading text-xl mb-6 text-[var(--color-primary)] font-bold">
                    Recent Transactions
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-gray-500 text-sm">
                                <th className="py-3">Student Name</th>
                                <th className="py-3">Book Name</th>
                                <th className="py-3">Issue Date</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-400">
                                        No recent transactions
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b last:border-none hover:bg-gray-50 transition"
                                    >
                                        <td className="py-3">{item.studentName}</td>
                                        <td className="py-3">{item.bookName}</td>
                                        <td className="py-3">{item.issueDate}</td>
                                        <td
                                            className={`py-3 font-medium ${getStatusStyle(item.status)}`}
                                        >
                                            {item.status}
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