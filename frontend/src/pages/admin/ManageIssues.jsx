import { useState } from "react";
import { FiPlus } from "react-icons/fi";

import IssueFilters from "./components/IssueFilters";
import IssueTable from "./components/IssueTable";
import IssueBookModal from "./components/IssueBookModal";

export default function ManageIssues() {

    const [issues, setIssues] = useState([
        {
            _id: "1",
            student: "Arun",
            book: "Data Structures",
            department: "CSE",
            issueDate: "2026-03-01",
            returnDate: "2026-03-10",
            status: "Issued"
        },
        {
            _id: "2",
            student: "Kumar",
            book: "Operating Systems",
            department: "CSE",
            issueDate: "2026-03-02",
            returnDate: "2026-03-12",
            status: "Issued"
        }
    ]);

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("all");
    const [showModal, setShowModal] = useState(false);

    const markReturned = (id) => {
        if (!window.confirm("Mark this book as returned?")) return;
        setIssues(
            issues.map((issue) =>
                issue._id === id ? { ...issue, status: "Returned" } : issue
            )
        );
    };

    const revertReturn = (id) => {
        if (!window.confirm("Revert this return?")) return;
        setIssues(
            issues.map((issue) =>
                issue._id === id ? { ...issue, status: "Issued" } : issue
            )
        );
    };

    const addIssue = (issue) => {
        setIssues([
            ...issues,
            { ...issue, _id: Date.now().toString(), status: "Issued" }
        ]);
    };

    const filteredIssues = issues.filter((i) => {

        const matchSearch =
            i.student.toLowerCase().includes(search.toLowerCase()) ||
            i.book.toLowerCase().includes(search.toLowerCase());

        const matchDept =
            department === "all" || i.department === department;

        return matchSearch && matchDept;
    });

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                    Manage Issues
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition font-medium shadow-sm"
                >
                    <FiPlus /> Issue Book
                </button>

            </div>

            {/* FILTERS */}
            <IssueFilters
                search={search}
                setSearch={setSearch}
                department={department}
                setDepartment={setDepartment}
            />

            {/* TABLE */}
            <IssueTable
                issues={filteredIssues}
                markReturned={markReturned}
                revertReturn={revertReturn}
            />

            {/* ISSUE MODAL */}
            {showModal && (
                <IssueBookModal
                    onClose={() => setShowModal(false)}
                    onAdd={addIssue}
                />
            )}

        </div>
    );
}
