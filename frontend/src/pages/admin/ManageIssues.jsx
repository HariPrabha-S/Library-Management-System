import { useState, useEffect } from "react";
import { FiPlus, FiFileText } from "react-icons/fi";
import adminService from "./services/adminService";
import IssueFilters from "./components/IssueFilters";
import IssueTable from "./components/IssueTable";
import IssueBookModal from "./components/IssueBookModal";
import RecordReports from "./components/RecordReports";
import { generateReport } from "./utils/reportGenerator";

export default function ManageIssues() {
    const [issues, setIssues] = useState([]);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const res = await adminService.getIssues({ search, department });
            if (res.success) {
                setIssues(res.data);
            }
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [search, department]);

    const markReturned = async (id) => {
        if (!window.confirm("Mark this book as returned?")) return;
        try {
            const res = await adminService.returnBook(id);
            if (res.success) fetchIssues();
            else alert(res.message || "Failed to return book");
        } catch (e) {
            alert("Network error while returning book");
        }
    };

    const revertReturn = async (id) => {
        if (!window.confirm("Revert this return?")) return;
        try {
            const res = await adminService.revertReturn(id);
            if (res.success) fetchIssues();
            else alert(res.message || "Failed to revert return");
        } catch (e) {
            alert("Network error while reverting");
        }
    };

    const handleIssueBook = async (formData) => {
        try {
            const res = await adminService.issueBook(formData);
            if (res.success) {
                alert("Book issued successfully!");
                fetchIssues();
                setShowModal(false);
            } else {
                alert(res.message || "Failed to issue book");
            }
        } catch (e) {
            alert("Network error while issuing book");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading text-3xl font-bold text-(--color-primary)">
                    Manage Issues
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center gap-2 bg-white text-(--color-secondary) border border-(--color-secondary) px-5 py-2 rounded-xl hover:bg-(--color-secondary)/5 transition font-semibold"
                    >
                        <FiFileText /> Generate Report
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-(--color-primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition font-medium shadow-sm"
                    >
                        <FiPlus /> Issue Book
                    </button>
                </div>
            </div>

            <IssueFilters
                search={search}
                setSearch={setSearch}
                department={department}
                setDepartment={setDepartment}
            />

            <div className={loading ? "opacity-50 pointer-events-none" : ""}>
                <IssueTable
                    issues={issues}
                    markReturned={markReturned}
                    revertReturn={revertReturn}
                />
            </div>

            {showModal && (
                <IssueBookModal
                    onClose={() => setShowModal(false)}
                    onAdd={handleIssueBook}
                />
            )}

            <RecordReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                filters={{ search, department }}
                onPreview={async (columns, printOption, orientation, passedFilters, reportName) => {
                    try {
                        setLoading(true);
                        const res = await adminService.getIssues({ ...passedFilters, limit: 1000 });
                        if (res.success) {
                            const reportData = res.data; // Already flattened by backend controller

                            generateReport({
                                title: "Library Circulation",
                                reportName: reportName,
                                orientation: orientation,
                                columns: columns,
                                data: reportData,
                                summaryFields: [
                                    { label: "Total Transactions", value: reportData.length },
                                    { label: "Active Issues", value: reportData.filter(r => r.status === 'Issued' || r.status === 'Overdue').length }
                                ]
                            });
                            setShowReportModal(false);
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </div>
    );
}
