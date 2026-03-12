import { FiTrash } from "react-icons/fi";

export default function FacultyTable({ faculties, selectedFaculties, onSelect, onDelete }) {

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

            <div className="overflow-x-auto">

                <table className="w-full text-left">

                    <thead>
                        <tr className="border-b text-gray-700 text-sm font-semibold">
                            <th className="py-3">Name</th>
                            <th className="py-3">Employee ID</th>
                            <th className="py-3">Department</th>
                            <th className="py-3">Designation</th>
                            <th className="py-3">Email</th>
                            <th className="py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {faculties.length === 0 ? (

                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-400">
                                    No faculty found
                                </td>
                            </tr>

                        ) : (

                            faculties.map(faculty => (

                                <tr
                                    key={faculty._id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="py-3 font-medium">{faculty.name}</td>
                                    <td className="py-3">{faculty.employeeId}</td>
                                    <td className="py-3">{faculty.department}</td>
                                    <td className="py-3">{faculty.designation}</td>
                                    <td className="py-3">{faculty.email}</td>

                                    <td className="py-3 flex gap-4 items-center">

                                        <input
                                            type="checkbox"
                                            checked={selectedFaculties.includes(faculty._id)}
                                            onChange={() => onSelect(faculty._id)}
                                        />

                                        <button
                                            onClick={() => onDelete(faculty._id)}
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
