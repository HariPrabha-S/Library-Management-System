import { FiTrash } from "react-icons/fi";

export default function StudentTable({ students, selectedStudents, onSelect, onDelete }) {

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-gray-700 text-sm font-semibold">
              <th className="py-3">Name</th>
              <th className="py-3">Roll No</th>
              <th className="py-3">Department</th>
              <th className="py-3">Year</th>
              <th className="py-3">Email</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {students.length === 0 ? (

              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No students found
                </td>
              </tr>

            ) : (

              students.map(student => (

                <tr
                  key={student._id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-3 font-medium">{student.name}</td>
                  <td className="py-3">{student.rollNo}</td>
                  <td className="py-3">{student.department}</td>
                  <td className="py-3">{student.year}</td>
                  <td className="py-3">{student.email}</td>

                  <td className="py-3 flex gap-4 items-center">

                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => onSelect(student._id)}
                    />

                    <button
                      onClick={() => onDelete(student._id)}
                      className="text-red-600 hover:text-red-800 text-lg"
                    >
                      <FiTrash />
                    </button>

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
