import { useState, useEffect } from "react";
import FacultyTable from "../../components/admin/FacultyTable";
import FacultyFilters from "../../components/admin/FacultyFilters";
import AddFacultyModal from "../../components/admin/AddFacultyModal";

export default function ManageFaculty() {

    const [faculty, setFaculty] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {

        const dummyFaculty = [
            {
                _id: "1",
                name: "Dr. Rajesh Kumar",
                facultyId: "FAC001",
                department: "CSE",
                email: "rajesh@college.edu",
                createdAt: new Date()
            },
            {
                _id: "2",
                name: "Dr. Meena Sharma",
                facultyId: "FAC002",
                department: "ECE",
                email: "meena@college.edu",
                createdAt: new Date()
            },
            {
                _id: "3",
                name: "Dr. Arvind Singh",
                facultyId: "FAC003",
                department: "ME",
                email: "arvind@college.edu",
                createdAt: new Date()
            }
        ];

        setFaculty(dummyFaculty);

    }, []);

    const handleSelect = (id) => {

        setSelectedFaculty((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );

    };

    const handleBulkDelete = () => {

        setFaculty((prev) =>
            prev.filter((f) => !selectedFaculty.includes(f._id))
        );

        setSelectedFaculty([]);

    };

    const handleDelete = (id) => {

        setFaculty((prev) =>
            prev.filter((f) => f._id !== id)
        );

    };

    // processed faculty list
    const processedFaculty = [...faculty]

        .filter((f) => {

            const matchName = f.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchDepartment =
                departmentFilter === "" ||
                f.department === departmentFilter;

            return matchName && matchDepartment;

        })

        .sort((a, b) => {

            switch (sortOption) {

                case "name":
                    return a.name.localeCompare(b.name);

                case "facultyId":
                    return a.facultyId.localeCompare(b.facultyId);

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
                    Manage Faculty
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
                >
                    + Add Faculty
                </button>

            </div>

            <FacultyFilters
                search={search}
                setSearch={setSearch}
                sortOption={sortOption}
                setSortOption={setSortOption}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
            />

            <FacultyTable
                faculties={processedFaculty}
                selectedFaculties={selectedFaculty}
                onSelect={handleSelect}
                onDelete={handleDelete}
            />

            {selectedFaculty.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4"
                >
                    Delete Selected
                </button>
            )}

            {showModal && (
                <AddFacultyModal
                    setShowModal={setShowModal}
                    setFaculties={setFaculty}
                />
            )}
        </>
    );

}