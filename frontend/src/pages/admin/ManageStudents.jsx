import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import StudentTable from "./components/StudentTable";
import StudentFilters from "./components/StudentFilters";
import AddStudentModal from "./components/AddStudentModal";
import StudentReports from "./components/StudentReports";
import { FiFileText, FiArrowLeft } from "react-icons/fi";

export default function ManageStudents() {

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Report states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState(null);

    useEffect(() => {

        const dummyStudents = [
            {
                _id: "1",
                name: "Arun Kumar",
                rollNo: "CSE001",
                department: "CSE",
                year: "2",
                email: "arun@college.edu",
                totalBooks: 5,
                issuedBooks: 2,
                returnedBooks: 3,
                fine: 150,
                createdAt: new Date()
            },
            {
                _id: "2",
                name: "Priya Sharma",
                rollNo: "ECE015",
                department: "ECE",
                year: "3",
                email: "priya@college.edu",
                totalBooks: 3,
                issuedBooks: 0,
                returnedBooks: 3,
                fine: 50,
                createdAt: new Date()
            },
            {
                _id: "3",
                name: "Rahul Verma",
                rollNo: "ME010",
                department: "ME",
                year: "1",
                email: "rahul@college.edu",
                totalBooks: 1,
                issuedBooks: 1,
                returnedBooks: 0,
                fine: 0,
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
            <div className={`flex justify-between items-center mb-6 ${reportConfig ? "no-print" : ""}`}>

                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                    Manage Students
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
                        onClick={() => setShowModal(true)}
                        className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
                    >
                        + Add Student
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
                <StudentFilters
                    search={search}
                    setSearch={setSearch}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter}
                />
            </div>

            <StudentTable
                students={processedStudents}
                selectedStudents={selectedStudents}
                onSelect={handleSelect}
                onDelete={handleDelete}
                selectedColumns={reportConfig?.columns}
                isPrintable={!!reportConfig}
            />

            {selectedStudents.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 no-print"
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

            <StudentReports
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