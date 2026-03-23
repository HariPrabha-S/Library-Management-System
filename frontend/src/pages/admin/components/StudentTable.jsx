import { FiTrash } from "react-icons/fi";

export default function StudentTable({ students, selectedStudents, onSelect, onDelete, selectedColumns, isPrintable }) {

  const isColVisible = (colName) => {
    if (!selectedColumns) return true;
    return selectedColumns.includes(colName);
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${isPrintable ? "print-table-container !p-0 !shadow-none !border-none" : ""}`}>
      <div className="overflow-x-auto">
        <table className={`w-full text-left ${isPrintable ? "print-table" : ""}`}>
          <thead>
            <tr className="border-b text-gray-700 text-sm font-semibold">
              {isColVisible('name') && <th className="py-3 px-4 whitespace-nowrap">Name</th>}
              {isColVisible('rollNo') && <th className="py-3 px-4 whitespace-nowrap">Roll No</th>}
              {isColVisible('department') && <th className="py-3 px-4 whitespace-nowrap">Department</th>}
              {isColVisible('year') && <th className="py-3 px-4 whitespace-nowrap">Year</th>}
              {isColVisible('email') && <th className="py-3 px-4 whitespace-nowrap">Email</th>}
              {isColVisible('totalBooks') && <th className="py-3 px-4 whitespace-nowrap text-center">Total Books</th>}
              {isColVisible('issuedBooks') && <th className="py-3 px-4 whitespace-nowrap text-center">Issued</th>}
              {isColVisible('returnedBooks') && <th className="py-3 px-4 whitespace-nowrap text-center">Returned</th>}
              {isColVisible('fine') && <th className="py-3 px-4 whitespace-nowrap">Fine (₹)</th>}
              {!isPrintable && <th className="py-3 px-4 whitespace-nowrap">Actions</th>}
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
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  {isColVisible('name') && <td className="py-3 px-4 whitespace-nowrap font-medium">{student.name}</td>}
                  {isColVisible('rollNo') && <td className="py-3 px-4 whitespace-nowrap">{student.rollNo}</td>}
                  {isColVisible('department') && <td className="py-3 px-4 whitespace-nowrap">{student.department}</td>}
                  {isColVisible('year') && <td className="py-3 px-4 whitespace-nowrap">{student.year}</td>}
                  {isColVisible('email') && <td className="py-3 px-4 whitespace-nowrap">{student.email}</td>}

                  {isColVisible('totalBooks') && <td className="py-3 px-4 whitespace-nowrap text-center">{student.totalBooks}</td>}
                  {isColVisible('issuedBooks') && <td className="py-3 px-4 whitespace-nowrap text-center">{student.issuedBooks}</td>}
                  {isColVisible('returnedBooks') && <td className="py-3 px-4 whitespace-nowrap text-center">{student.returnedBooks}</td>}
                  {isColVisible('fine') && <td className={`py-3 px-4 whitespace-nowrap font-bold ${student.fine > 0 ? "text-red-500" : "text-green-600"}`}>₹{student.fine}</td>}

                  {!isPrintable && (
                    <td className="py-3 px-4 whitespace-nowrap flex gap-4 items-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents?.includes(student._id)}
                        onChange={() => onSelect(student._id)}
                      />
                      <button
                        onClick={() => onDelete(student._id)}
                        className="text-red-600 hover:text-red-800 text-lg"
                      >
                        <FiTrash />
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
