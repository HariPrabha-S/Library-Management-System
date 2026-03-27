import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import FacultyTable from "./components/FacultyTable";
import FacultyFilters from "./components/FacultyFilters";
import AddFacultyModal from "./components/AddFacultyModal";
import FacultyReports from "./components/FacultyReports";
import BulkUploadModal from "./components/BulkUploadModal";
import { FiFileText, FiArrowLeft, FiUploadCloud } from "react-icons/fi";

export default function ManageFaculty() {

    const [faculty, setFaculty] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    // Report states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState(null);

    useEffect(() => {

        const dummyFaculty = [
            {
                _id: "1",
                name: "Dr. Rajesh Kumar",
                facultyId: "FAC001",
                employeeId: "EMP001",
                department: "CSE",
                designation: "Professor",
                email: "rajesh@college.edu",
                totalBooks: 12,
                issuedBooks: 4,
                returnedBooks: 8,
                fine: 200,
                createdAt: new Date()
            },
            {
                _id: "2",
                name: "Dr. Meena Sharma",
                facultyId: "FAC002",
                employeeId: "EMP002",
                department: "ECE",
                designation: "Associate Professor",
                email: "meena@college.edu",
                totalBooks: 8,
                issuedBooks: 2,
                returnedBooks: 6,
                fine: 0,
                createdAt: new Date()
            },
            {
                _id: "3",
                name: "Dr. Arvind Singh",
                facultyId: "FAC003",
                employeeId: "EMP003",
                department: "ME",
                designation: "Assistant Professor",
                email: "arvind@college.edu",
                totalBooks: 3,
                issuedBooks: 3,
                returnedBooks: 0,
                fine: 0,
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
            <div className={`flex justify-between items-center mb-6 ${reportConfig ? "no-print" : ""}`}>

                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                    Manage Faculty
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-white text-[var(--color-secondary)] border border-[var(--color-secondary)] px-5 py-2 rounded-xl hover:bg-[var(--color-secondary)]/5 transition flex items-center gap-2 font-semibold"
                    >
                        <FiFileText />
                        Generate Report
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="bg-white text-[var(--color-secondary)] border border-[var(--color-secondary)] px-5 py-2 rounded-xl hover:bg-[var(--color-secondary)]/5 transition flex items-center gap-2 font-semibold"
                    >
                        <FiUploadCloud />
                        Upload Excel
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2 font-semibold"
                    >
                        + Add Faculty
                    </button>
                </div>

            </div>

            {reportConfig && (
                <div className="bg-[var(--color-secondary)]/10 border-l-4 border-[var(--color-secondary)] p-4 mb-6 flex justify-between items-center rounded-r-lg no-print">
                    <div className="flex items-center gap-3">
                        <FiFileText className="text-[var(--color-secondary)] text-xl" />
                        <div>
                            <h3 className="font-bold text-gray-900">Report Preview Mode</h3>
                            <p className="text-xs text-gray-600">Displaying selected columns for printing/export.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setReportConfig(null)}
                        className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:underline transition"
                    >
                        <FiArrowLeft />
                        Exit Preview
                    </button>
                </div>
            )}

            <div className={reportConfig ? "no-print" : ""}>
                <FacultyFilters
                    search={search}
                    setSearch={setSearch}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter}
                />
            </div>

            <FacultyTable
                faculties={processedFaculty}
                selectedFaculties={selectedFaculty}
                onSelect={handleSelect}
                onDelete={handleDelete}
                selectedColumns={reportConfig?.columns}
                isPrintable={!!reportConfig}
            />

            {selectedFaculty.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 no-print"
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

            {showBulkModal && (
                <BulkUploadModal
                    type="faculty"
                    onUpload={(rows) => setFaculty(prev => [...prev, ...rows])}
                    onClose={() => setShowBulkModal(false)}
                />
            )}

            <FacultyReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                search={search}
                setSearch={setSearch}
                onPreview={(columns, printOption, paperOrientation, passedSearch, reportName) => {
                    if (passedSearch !== undefined) {
                        setSearch(passedSearch);
                    }
                    setReportConfig({
                        columns,
                        printOption,
                        paperOrientation,
                        name: reportName
                    });
                    setShowReportModal(false);

                    const styleId = "print-orientation-style";
                    let styleElement = document.getElementById(styleId);
                    if (!styleElement) {
                        styleElement = document.createElement("style");
                        styleElement.id = styleId;
                        document.head.appendChild(styleElement);
                    }
                    styleElement.innerHTML = `@media print { @page { size: ${paperOrientation.toLowerCase()}; } }`;

                    if (printOption === "Printer") {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    }
                }}
            />
        </>
    );

}
