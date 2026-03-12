import { useState, useEffect } from "react";
import StudentTable from "../../components/admin/StudentTable";
import StudentFilters from "../../components/admin/StudentFilters";
import AddStudentModal from "../../components/admin/AddStudentModal";

export default function ManageStudents() {

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {

        const dummyStudents = [
            {
                _id: "1",
                name: "Arun Kumar",
                rollNo: "CSE001",
                department: "CSE",
                year: "2",
                email: "arun@college.edu",
                createdAt: new Date()
            },
            {
                _id: "2",
                name: "Priya Sharma",
                rollNo: "ECE015",
                department: "ECE",
                year: "3",
                email: "priya@college.edu",
                createdAt: new Date()
            },
            {
                _id: "3",
                name: "Rahul Verma",
                rollNo: "ME010",
                department: "ME",
                year: "1",
                email: "rahul@college.edu",
                createdAt: new Date()
            }
        ];

        setStudents(dummyStudents);

    }, []);

    const handleSelect = (id) => {

        setSelectedStudents((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );

    };

    const handleBulkDelete = () => {

        setStudents((prev) =>
            prev.filter((student) => !selectedStudents.includes(student._id))
        );

        setSelectedStudents([]);

    };

    const handleDelete = (id) => {

        setStudents((prev) =>
            prev.filter((student) => student._id !== id)
        );

    };

    // Processed students
    const processedStudents = [...students]

        .filter((student) => {

            const matchName = student.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchDepartment =
                departmentFilter === "" ||
                student.department === departmentFilter;

            return matchName && matchDepartment;

        })

        .sort((a, b) => {

            switch (sortOption) {

                case "name":
                    return a.name.localeCompare(b.name);

                case "roll":
                    return a.rollNo.localeCompare(b.rollNo);

                case "department":
                    return a.department.localeCompare(b.department);

                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);

                default:
                    return 0;

            }

        });

    return (

        <>
            <div className="flex justify-between items-center mb-6">

                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                    Manage Students
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
                >
                    + Add Student
                </button>

            </div>

            <StudentFilters
                search={search}
                setSearch={setSearch}
                sortOption={sortOption}
                setSortOption={setSortOption}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
            />

            <StudentTable
                students={processedStudents}
                selectedStudents={selectedStudents}
                onSelect={handleSelect}
                onDelete={handleDelete}
            />

            {selectedStudents.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4"
                >
                    Delete Selected
                </button>
            )}

            {showModal && (
                <AddStudentModal
                    setShowModal={setShowModal}
                    setStudents={setStudents}
                />
            )}
        </>

    );

}