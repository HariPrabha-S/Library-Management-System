import { useState, useEffect } from "react";
import StudentTable from "./components/StudentTable";
import StudentFilters from "./components/StudentFilters";
import AddStudentModal from "./components/AddStudentModal";
import StudentReports from "./components/StudentReports";
import BulkUploadModal from "./components/BulkUploadModal";
import { FiFileText, FiArrowLeft, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import adminService from "./services/adminService";

export default function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await adminService.getStudents({ search, department: departmentFilter });
            if (res.success) {
                setStudents(res.data.map(s => ({ ...s, _id: s.id })));
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [search, departmentFilter]);

    const handleSelect = (id) => {
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        try {
            await adminService.deleteStudent(id);
            fetchStudents();
        } catch (error) {
            alert("Failed to delete student");
        }
    };

    const processedStudents = [...students].sort((a, b) => {
        switch (sortOption) {
            case "name": return a.name.localeCompare(b.name);
            case "roll": return (a.rollNo || "").localeCompare(b.rollNo || "");
            case "department": return (a.department || "").localeCompare(b.department || "");
            case "recent": return new Date(b.createdAt) - new Date(a.createdAt);
            default: return 0;
        }
    });

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading text-3xl font-bold text-(--color-primary)">
                    Manage Students
                </h1>

                <div className="flex gap-3">
                    <button onClick={() => setShowReportModal(true)} className="bg-white text-(--color-secondary) border border-(--color-secondary) px-5 py-2 rounded-xl hover:bg-(--color-secondary)/5 transition flex items-center gap-2 font-semibold">
                        <FiFileText /> Generate Report
                    </button>
                    <button onClick={() => setShowBulkModal(true)} className="bg-white text-(--color-secondary) border border-(--color-secondary) px-5 py-2 rounded-xl hover:bg-(--color-secondary)/5 transition flex items-center gap-2 font-semibold">
                        <FiUploadCloud /> Upload Excel
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-(--color-primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2 font-semibold shadow-lg shadow-(--color-primary)/10">
                        + Add Student
                    </button>
                </div>
            </div>

            <StudentFilters
                search={search} setSearch={setSearch}
                sortOption={sortOption} setSortOption={setSortOption}
                departmentFilter={departmentFilter} setDepartmentFilter={setDepartmentFilter}
            />

            <div className={`mt-6 transition-all duration-300 ${loading ? "opacity-60 grayscale-[0.5]" : "opacity-100"}`}>
                <StudentTable
                    students={processedStudents}
                    selectedStudents={selectedStudents}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                />
            </div>

            {selectedStudents.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom duration-300 z-50">
                    <span className="text-sm font-bold text-gray-600 tracking-tight">
                        <span className="text-(--color-primary)">{selectedStudents.length}</span> students selected
                    </span>
                    <button onClick={async () => {
                        if (window.confirm(`Delete ${selectedStudents.length} students?`)) {
                            try {
                                await adminService.deleteBulkStudents(selectedStudents);
                                setSelectedStudents([]);
                                fetchStudents();
                            } catch (e) { alert("Failed to delete students"); }
                        }
                    }} className="text-red-600 hover:text-white hover:bg-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group">
                        <FiTrash2 className="group-hover:scale-110 transition-transform" /> Delete Selected
                    </button>
                </div>
            )}

            {showModal && <AddStudentModal setShowModal={setShowModal} refreshStudents={fetchStudents} />}

            {showBulkModal && (
                <BulkUploadModal
                    type="student"
                    onUpload={async (data) => {
                        try {
                            setLoading(true);
                            const res = await adminService.bulkUploadStudents(data);
                            if (res.success) {
                                fetchStudents();
                                setShowBulkModal(false);
                            } else {
                                alert(res.message || "Bulk upload failed");
                            }
                        } catch (err) {
                            alert("Network error during bulk upload");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    onClose={() => setShowBulkModal(false)}
                />
            )}

            <StudentReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                filters={{ search, department: departmentFilter }}
                onPreview={async (columns, printOption, paperOrientation, passedFilters, reportName) => {
                    try {
                        setLoading(true);
                        const res = await adminService.getStudents({ ...passedFilters, limit: 1000 });
                        if (res.success) {
                            const displayData = res.data;
                            const reportWindow = window.open("", "_blank");
                            const reportHtml = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Student Report - ${reportName}</title>
                                    <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                                        @media print { @page { size: ${paperOrientation.toLowerCase()}; margin: 1.5cm; } }
                                        body { font-family: 'Inter', system-ui, sans-serif; padding: 100px 60px 60px 60px; color: #1a1a1a; line-height: 1.5; background: #fdfdfd; }
                                        .controls { position: fixed; top: 30px; right: 30px; display: flex; gap: 12px; z-index: 1000; }
                                        .btn { border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; alignItems: center; gap: 8px; }
                                        .btn-print { background: #800000; color: white; box-shadow: 0 4px 15px rgba(128,0,0,0.25); }
                                        .btn-close { background: white; color: #444; border: 1px solid #ddd; }
                                        
                                        .report-container { background: white; max-width: 1200px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border-radius: 8px; padding: 60px; }
                                        .header { margin-bottom: 50px; border-bottom: 1px solid #eee; padding-bottom: 25px; }
                                        .header h1 { font-size: 28px; font-weight: 800; color: #800000; margin: 0; text-transform: uppercase; }
                                        .header h2 { font-size: 14px; font-weight: 600; color: #666; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 1px; }
                                        
                                        .info-bar { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; font-weight: 600; color: #888; }
                                        
                                        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; font-size: 11px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
                                        th { background: #f9fafb; padding: 14px; border-bottom: 2.5px solid #800000; text-align: left; text-transform: uppercase; }
                                        td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; }
                                        
                                        .summary { margin-top: 30px; text-align: right; font-weight: 800; color: #800000; font-size: 16px; }
                                        .footer { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #eee; padding-top: 20px; }

                                        @media print { .controls { display: none !important; } body { padding: 0; } .report-container { box-shadow: none; padding: 0; } }
                                    </style>
                                </head>
                                <body>
                                    <div class="controls">
                                        <button class="btn btn-close" onclick="window.close()">Close</button>
                                        <button class="btn btn-print" onclick="window.print()">Print Report</button>
                                    </div>
                                    <div class="report-container">
                                        <div class="header">
                                            <h1>Central Library Management System</h1>
                                            <h2>${reportName}</h2>
                                            <div class="info-bar">
                                                <span>Date: ${new Date().toLocaleDateString()}</span>
                                                <span>Records: ${displayData.length}</span>
                                            </div>
                                        </div>
                                        <table>
                                            <thead>
                                                <tr>${columns.map(c => `<th>${c.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('')}</tr>
                                            </thead>
                                            <tbody>
                                                ${displayData.map(row => `<tr>${columns.map(c => `<td>${row[c] || "-"}</td>`).join('')}</tr>`).join('')}
                                            </tbody>
                                        </table>
                                        <div class="summary">Total Students: ${displayData.length}</div>
                                        <div class="footer">Computer Generated Student Record Extraction • Generated on ${new Date().toLocaleString()}</div>
                                    </div>
                                    <script>window.onkeydown = (e) => e.key === "Escape" && window.close(); ${printOption === "Printer" ? "setTimeout(()=>window.print(), 800);" : ""}</script>
                                </body>
                                </html>
                            `;
                            reportWindow.document.write(reportHtml);
                            reportWindow.document.close();
                            setShowReportModal(false);
                        }
                    } catch (e) { console.error(e); } finally { setLoading(false); }
                }}
            />
        </>
    );
}
