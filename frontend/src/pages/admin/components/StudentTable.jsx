import { FiTrash } from "react-icons/fi";

export default function StudentTable({ students, selectedStudents, onSelect, onDelete, selectedColumns, isPrintable }) {

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
              {isColVisible('rollNo') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Roll No</th>}
              {isColVisible('department') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Department</th>}
              {isColVisible('year') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Year</th>}
              {isColVisible('email') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Email</th>}
              {isColVisible('totalBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Total Books</th>}
              {isColVisible('issuedBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Issued</th>}
              {isColVisible('returnedBooks') && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300" : ""}`}>Returned</th>}
              {isColVisible('fine') && <th className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>Fine (₹)</th>}
              {!isPrintable && <th className="py-4 px-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={isPrintable ? (selectedColumns?.length || 5) : 10} className="text-center py-6 text-gray-400">
                  No students found
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student._id} className={`${isPrintable ? "border-b border-gray-300" : "border-b last:border-none hover:bg-gray-50 transition"} text-sm cursor-pointer leading-tight group`}>
                  {isColVisible('name') && (
                    <td className={`py-4 px-3 ${isPrintable ? "border border-gray-300" : ""}`}>
                      <span className={`font-semibold ${isPrintable ? "text-black" : "text-gray-900 group-hover:text-[var(--color-primary)] transition-colors"}`}>{student.name}</span>
                    </td>
                  )}
                  {isColVisible('rollNo') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.rollNo}</td>}
                  {isColVisible('department') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.department}</td>}
                  {isColVisible('year') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.year}</td>}
                  {isColVisible('email') && <td className={`py-4 px-3 text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.email}</td>}

                  {isColVisible('totalBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.totalBooks}</td>}
                  {isColVisible('issuedBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.issuedBooks}</td>}
                  {isColVisible('returnedBooks') && <td className={`py-4 px-3 text-center text-gray-600 ${isPrintable ? "border border-gray-300 text-black" : ""}`}>{student.returnedBooks}</td>}
                  {isColVisible('fine') && <td className={`py-4 px-3 font-semibold ${isPrintable ? "border border-gray-300 text-black" : student.fine > 0 ? "text-red-500" : "text-emerald-600"}`}>₹{student.fine}</td>}

                  {!isPrintable && (
                    <td className="py-4 px-3 flex gap-4 items-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents?.includes(student._id)}
                        onChange={() => onSelect(student._id)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                      <button
                        onClick={() => onDelete(student._id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete student"
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
