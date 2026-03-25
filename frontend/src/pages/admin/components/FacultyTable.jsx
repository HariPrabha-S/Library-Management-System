import { FiTrash } from "react-icons/fi";

export default function FacultyTable({ faculties, selectedFaculties, onSelect, onDelete, selectedColumns, isPrintable }) {

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
                                            <span className={`font-semibold ${isPrintable ? "text-black" : "text-gray-900 group-hover:text-[var(--color-primary)] transition-colors"}`}>{faculty.name}</span>
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
        </div>
    );
}
