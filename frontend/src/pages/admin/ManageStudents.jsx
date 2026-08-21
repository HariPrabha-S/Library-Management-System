import { useState, useEffect } from "react";
import {
    User, Mail, GraduationCap, X, Check, Edit2, AlertCircle,
    FileText, UploadCloud, Search, Calendar, MapPin, Phone,
    RefreshCw, Trash2, BookOpen, CircleDot, ChevronLeft, ChevronRight
} from "lucide-react";
import adminService from "./services/adminService";
import AddStudentModal from "./components/AddStudentModal";
import BulkUploadModal from "./components/BulkUploadModal";
import StudentReports from "./components/StudentReports";

// Helper to determine if holidays/sundays count
const GOVERNMENT_HOLIDAYS = [
    '01-01', // New Year's Day
    '01-26', // Republic Day
    '04-14', // Ambedkar Jayanti / Tamil New Year
    '05-01', // May Day
    '08-15', // Independence Day
    '10-02', // Gandhi Jayanti
    '12-25', // Christmas
];

const parseLocalDate = (dateInput) => {
    if (!dateInput) return new Date();
    if (typeof dateInput === 'string') {
        const parts = dateInput.split('T')[0].split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
        }
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

const getOverdueDaysCount = (dueDate, returnDate) => {
    const start = parseLocalDate(dueDate);
    const end = parseLocalDate(returnDate);

    if (end <= start) return 0;

    let count = 0;
    let current = new Date(start);
    while (current < end) {
        current.setDate(current.getDate() + 1);
        const dayOfWeek = current.getDay(); // 0 is Sunday

        if (dayOfWeek === 0) {
            continue;
        }

        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        const mm_dd = `${mm}-${dd}`;

        if (GOVERNMENT_HOLIDAYS.includes(mm_dd)) {
            continue;
        }

        count++;
    }
    return count;
};

// Helper to determine if due date is close (within 2 days)
const isCloseToDue = (returnDateStr) => {
    if (!returnDateStr) return false;
    const returnDate = new Date(returnDateStr);
    const today = new Date();
    // Strip hours for accurate day diff
    returnDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = returnDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
};

// Format Date helper
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

export default function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);

    // Search
    const [search, setSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Detail Panel States
    const [activeTab, setActiveTab] = useState("details"); // details, issues, history, fines
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [newPhotoFile, setNewPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Fetch Student data
    const fetchStudents = async () => {
        const trimmedSearch = search.trim();
        if (!trimmedSearch) {
            setStudents([]);
            setSelectedStudent(null);
            setIsEditing(false);
            return;
        }
        try {
            setLoading(true);
            const res = await adminService.getStudents({ search: trimmedSearch });
            if (res.success) {
                const fetchedData = res.data;
                setStudents(fetchedData);

                // Keep previously selected student if still present in results
                if (selectedStudent) {
                    const updated = fetchedData.find(s => s.id === selectedStudent.id);
                    if (updated) {
                        setSelectedStudent(updated);
                    } else {
                        setSelectedStudent(null);
                        setIsEditing(false);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        setCurrentPage(1);
    }, [search]);

    // Handle student row click selection
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setIsEditing(false);
        setNewPhotoFile(null);
        setPhotoPreview(null);
    };

    // Sort students list
    const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

    // Pagination logic
    const totalRecords = sortedStudents.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedStudents.slice(indexOfFirstRecord, indexOfLastRecord);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Toggle edit mode
    const handleStartEdit = () => {
        setEditForm({ ...selectedStudent, changePassword: false, newPassword: "" });
        setNewPhotoFile(null);
        setPhotoPreview(null);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm(null);
        setNewPhotoFile(null);
        setPhotoPreview(null);
    };

    // Save student details
    const handleSaveStudent = async (e) => {
        if (e) e.preventDefault();

        if (!/^[A-Za-z\s]+$/.test(editForm.name)) {
            alert("Validation Error: Name must contain letters and spaces only.");
            return;
        }
        if (!/^\d+$/.test(editForm.phoneNumber)) {
            alert("Validation Error: Phone Number must contain numbers only.");
            return;
        }

        if (editForm.changePassword && !editForm.newPassword) {
            alert("Please enter a new password or uncheck 'Change Password'");
            return;
        }

        try {
            const departmentFullMap = {
                "CSE": "Computer Science & Engineering",
                "IT": "Information Technology",
                "ECE": "Electronics & Communication Engineering",
                "EEE": "Electrical & Electronics Engineering",
                "Mech": "Mechanical Engineering",
                "Civil": "Civil Engineering",
                "AI&DS": "Artificial Intelligence & Data Science",
                "S&H": "Science & Humanities",
                "Management": "Management"
            };

            const payload = {
                ...editForm,
                departmentFull: departmentFullMap[editForm.department] || editForm.department,
                semester: parseInt(editForm.semester)
            };

            if (editForm.changePassword && editForm.newPassword) {
                payload.password = editForm.newPassword;
            } else {
                delete payload.password;
            }
            delete payload.changePassword;
            delete payload.newPassword;

            if (newPhotoFile) {
                try {
                    const formData = new FormData();
                    formData.append('identifier', selectedStudent.rollNo);
                    formData.append('photo', newPhotoFile);
                    const uploadRes = await adminService.uploadProfilePhoto(formData);
                    if (uploadRes.success && uploadRes.photoUrl) {
                        payload.photo = uploadRes.photoUrl;
                    }
                } catch (uploadError) {
                    alert("Photo upload failed: " + uploadError.message);
                    return; // Prevent saving the profile if the photo fails
                }
            }

            const res = await adminService.editStudent(selectedStudent.id, payload);
            if (res.success) {
                alert("Student profile updated successfully!");
                setIsEditing(false);
                setNewPhotoFile(null);
                setPhotoPreview(null);
                fetchStudents();
            } else {
                alert("Failed to update: " + (res.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Update student error:", error);
            alert("Network error updating student");
        }
    };

    // Deactivate / Reactivate student status
    const handleToggleStatus = async () => {
        const nextStatus = selectedStudent.status === "Active" ? "Inactive" : "Active";
        const msg = `Are you sure you want to set this student as ${nextStatus.toUpperCase()}?`;
        if (!window.confirm(msg)) return;

        try {
            const res = await adminService.editStudent(selectedStudent.id, { status: nextStatus });
            if (res.success) {
                alert(`Student marked as ${nextStatus} successfully!`);
                fetchStudents();
            }
        } catch (error) {
            console.error("Toggle status error:", error);
            alert("Failed to change student status");
        }
    };

    // Export Excel / CSV generator
    const handleExportCSV = () => {
        if (students.length === 0) {
            alert("No data available to export");
            return;
        }

        const headers = ["Register Number", "Name", "Email", "Phone Number", "Department", "Year", "Semester", "DOB", "Status"];
        const rows = students.map(s => [
            s.rollNo,
            s.name,
            s.email,
            s.phoneNumber || "",
            s.department || "",
            s.year || "",
            s.semester || "",
            s.dob || "",
            s.status
        ]);

        const csvContent = "\uFEFF" + [
            headers.join(","),
            ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `LMS_Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate aggregated stats for selected student
    const activeIssues = selectedStudent?.Issues?.filter(i => i.status !== "Returned") || [];
    const returnedIssues = selectedStudent?.Issues?.filter(i => i.status === "Returned") || [];
    const unpaidFinesList = selectedStudent?.Fines?.filter(f => f.status === "Pending") || [];
    const totalFineAmount = unpaidFinesList.reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const stats = {
        totalBooks: selectedStudent?.Issues?.filter(i => i.status !== "Returned").length || 0,
        currentlyActive: activeIssues.filter(i => i.status === "Issued").length || 0,
        needRenewal: activeIssues.filter(i => i.status === "Issued" && isCloseToDue(i.returnDate)).length || 0,
        totalFine: totalFineAmount
    };

    return (
        <div className="animate-fade-in-down">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="admin-page-heading">Manage Students</h1>
                    <p className="text-xs text-gray-500 mt-1">View, search and manage student details and their library activity.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => setShowReportModal(true)} className="btn btn-outline flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl border-gray-200">
                        <FileText size={15} /> Generate Report
                    </button>
                    <button onClick={() => setShowBulkModal(true)} className="btn btn-outline flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl border-gray-200">
                        <UploadCloud size={15} /> Upload Excel
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl">
                        + Add Student
                    </button>
                </div>
            </div>

            {/* Main Master-Detail grid split layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Panel: Filters & Student Selection List */}
                <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-4">
                    <div className="bg-white border border-[#eef0f4] p-5 rounded-2xl shadow-sm space-y-4">

                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, department or register number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-input pl-10 text-xs font-semibold py-3"
                            />
                        </div>

                        <div className="pt-2 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                            <span>Search Results</span>
                            <button
                                onClick={handleExportCSV}
                                className="text-(--color-secondary) hover:opacity-85 transition-opacity"
                            >
                                Export CSV
                            </button>
                        </div>

                        {/* Student selection table */}
                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3">Name</th>
                                        <th className="py-3 px-3">Reg No</th>
                                        <th className="py-3 px-3">Dept</th>
                                        <th className="py-3 px-3">Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && currentRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-400">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : currentRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-400">
                                                {search.trim() ? "No students found" : "Search for students to get started"}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentRecords.map(student => {
                                            const isSelected = selectedStudent?.id === student.id;
                                            const displayDept = student.department === "Computer Science Engineering" ? "CSE" :
                                                student.department === "Information Technology" ? "IT" :
                                                    student.department === "Electronics & Communication" ? "ECE" :
                                                        student.department === "Electrical & Electronics" ? "EEE" :
                                                            student.department === "Mechanical Engineering" ? "ME" :
                                                                student.department === "Civil Engineering" ? "CE" : student.department;

                                            return (
                                                <tr
                                                    key={student.id}
                                                    onClick={() => handleSelectStudent(student)}
                                                    className={`border-b last:border-none border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? "bg-red-50/40 hover:bg-red-50/60 font-semibold" : ""}`}
                                                >
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            {isSelected ? (
                                                                <CircleDot size={12} className="text-(--color-primary) flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                                                            )}
                                                            <span className="text-blue-600 hover:underline">{student.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-gray-500">{student.rollNo}</td>
                                                    <td className="py-3.5 px-3 text-gray-500">{displayDept}</td>
                                                    <td className="py-3.5 px-3 text-gray-500">
                                                        {Number(student.year) === 1 ? "I Year" :
                                                            Number(student.year) === 2 ? "II Year" :
                                                                Number(student.year) === 3 ? "III Year" :
                                                                    Number(student.year) === 4 ? "IV Year" : student.year}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Left Column Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 pt-2">
                                <span>Page {currentPage} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="p-1 border rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="p-1 border rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Student profile & borrowing details */}
                <div className="w-full lg:w-7/12 xl:w-8/12">
                    {selectedStudent ? (
                        <div className="space-y-6">
                            {/* Summary profile header card */}
                            <div className="bg-white border border-[#eef0f4] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative group flex-shrink-0">
                                        {photoPreview || selectedStudent.photo ? (
                                            <img
                                                src={photoPreview || selectedStudent.photo}
                                                alt="Profile"
                                                className="w-16 h-16 rounded-full object-cover border border-(--color-primary)/10 shadow-sm"
                                                onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-16 h-16 rounded-full font-heading text-xl font-bold bg-(--primary-light) text-(--color-primary) flex items-center justify-center border border-(--color-primary)/10 shadow-sm"
                                            style={{ display: (photoPreview || selectedStudent.photo) ? 'none' : 'flex' }}
                                        >
                                            {selectedStudent.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                        </div>

                                        {isEditing && (
                                            <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                                <UploadCloud size={16} />
                                                <span className="text-[8px] font-bold mt-0.5">Edit</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewPhotoFile(file);
                                                            setPhotoPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-800 leading-tight">{selectedStudent.name}</h2>
                                            <span className={`badge ${selectedStudent.status === "Active" ? "badge-success" : "badge-danger"}`}>
                                                {selectedStudent.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-semibold mt-1">
                                            {selectedStudent.rollNo} • {selectedStudent.departmentFull || selectedStudent.department}
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span>Email: {selectedStudent.email}</span>
                                            {selectedStudent.phoneNumber && <span>Phone: {selectedStudent.phoneNumber}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Summary widgets */}
                                <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                                    <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 text-center flex flex-col justify-center min-w-[70px]">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block leading-none mb-1">Total Books</span>
                                        <span className="text-base font-bold text-gray-800">{stats.totalBooks}</span>
                                    </div>
                                    <div className="bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/50 text-center flex flex-col justify-center min-w-[70px]">
                                        <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest block leading-none mb-1">Active</span>
                                        <span className="text-base font-bold text-emerald-600">{stats.currentlyActive}</span>
                                    </div>
                                    <div className="bg-amber-50/30 p-2.5 rounded-xl border border-amber-100/50 text-center flex flex-col justify-center min-w-[70px]">
                                        <span className="text-[9px] font-bold text-amber-600/70 uppercase tracking-widest block leading-none mb-1">Renewal</span>
                                        <span className="text-base font-bold text-amber-600">{stats.needRenewal}</span>
                                    </div>
                                    <div className="bg-red-50/30 p-2.5 rounded-xl border border-red-100/50 text-center flex flex-col justify-center min-w-[70px]">
                                        <span className="text-[9px] font-bold text-red-600/70 uppercase tracking-widest block leading-none mb-1">Total Fine</span>
                                        <span className="text-base font-bold text-red-600">₹{stats.totalFine.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Panel Tabs and Contents */}
                            <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm overflow-hidden flex flex-col">

                                {/* Tabs Selection bar */}
                                <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => { setActiveTab("details"); setIsEditing(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "details" ? "bg-white text-(--color-primary) shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                                    >
                                        Student Details
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab("issues"); setIsEditing(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "issues" ? "bg-white text-(--color-primary) shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                                    >
                                        Issued Books ({activeIssues.length})
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab("history"); setIsEditing(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "history" ? "bg-white text-(--color-primary) shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                                    >
                                        History ({returnedIssues.length})
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab("fines"); setIsEditing(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "fines" ? "bg-white text-(--color-primary) shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                                    >
                                        Fines Summary ({unpaidFinesList.length})
                                    </button>
                                </div>

                                {/* Tab Contents Panel */}
                                <div className="p-6">
                                    {/* 1. Tab Details */}
                                    {activeTab === "details" && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                                    Personal & Academic Profile
                                                </h3>
                                                {!isEditing && (
                                                    <button onClick={handleStartEdit} className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg border-gray-200">
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                )}
                                            </div>

                                            {/* Details View */}
                                            {isEditing ? (
                                                <form onSubmit={handleSaveStudent} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Register Number</label>
                                                            <input type="text" value={editForm.rollNo || ""} onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold" />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Full Name</label>
                                                            <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold" />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Department</label>
                                                            <select value={editForm.department || ""} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                <option value="CSE">Computer Science & Engineering</option>
                                                                <option value="IT">Information Technology</option>
                                                                <option value="ECE">Electronics & Communication Engineering</option>
                                                                <option value="EEE">Electrical & Electronics Engineering</option>
                                                                <option value="Mech">Mechanical Engineering</option>
                                                                <option value="Civil">Civil Engineering</option>
                                                                <option value="AI&DS">Artificial Intelligence & Data Science</option>
                                                                <option value="S&H">Science & Humanities</option>
                                                                <option value="Management">Management</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Year of Study</label>
                                                            <select value={editForm.year || ""} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                <option value="1">1st Year</option>
                                                                <option value="2">2nd Year</option>
                                                                <option value="3">3rd Year</option>
                                                                <option value="4">4th Year</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Semester</label>
                                                            <select value={editForm.semester || ""} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Email Address</label>
                                                            <input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold" />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Phone Number</label>
                                                            <input type="text" value={editForm.phoneNumber || ""} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold" />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Date of Birth</label>
                                                            <input type="date" value={editForm.dob ? new Date(editForm.dob).toISOString().split('T')[0] : ""} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold" />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Gender</label>
                                                            <select value={editForm.gender || ""} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                <option value="">Select Gender</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Category</label>
                                                            <select value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                <option value="">Select Category</option>
                                                                <option value="UG Student">UG Student</option>
                                                                <option value="PG Student">PG Student</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Status</label>
                                                            <select value={editForm.status || "Active"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold cursor-pointer">
                                                                <option value="Active">Active</option>
                                                                <option value="Inactive">Inactive</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-2 col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Password</span>
                                                                    <span className="font-bold text-gray-800 tracking-widest">••••••••</span>
                                                                </div>
                                                                <label className="flex items-center gap-2 cursor-pointer ml-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editForm.changePassword || false}
                                                                        onChange={(e) => setEditForm({ ...editForm, changePassword: e.target.checked, newPassword: "" })}
                                                                        className="w-4 h-4 text-(--color-primary) border-gray-300 rounded focus:ring-(--color-primary)"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-700">Change Password</span>
                                                                </label>
                                                            </div>
                                                            {editForm.changePassword && (
                                                                <div className="flex flex-col gap-1.5 mt-2 w-full md:w-1/2">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">New Password</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter new password"
                                                                        value={editForm.newPassword || ""}
                                                                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                                                        className="border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-(--color-primary) font-bold"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editForm.isLocked || false}
                                                                        onChange={(e) => setEditForm({ ...editForm, isLocked: e.target.checked })}
                                                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-700">Lock Student</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 mt-2 flex justify-end gap-3 border-t border-gray-100">
                                                        <button type="button" onClick={handleCancelEdit} className="btn btn-outline text-xs py-2 px-4 rounded-xl border-gray-200">Cancel</button>
                                                        <button type="submit" className="btn btn-primary text-xs py-2 px-4 rounded-xl">Save Changes</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Register Number</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.rollNo}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Full Name</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Department</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.departmentFull || selectedStudent.department}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Year of Study</span>
                                                        <span className="font-bold text-gray-800">
                                                            {Number(selectedStudent.year) === 1 ? "I Year" :
                                                                Number(selectedStudent.year) === 2 ? "II Year" :
                                                                    Number(selectedStudent.year) === 3 ? "III Year" :
                                                                        Number(selectedStudent.year) === 4 ? "IV Year" : selectedStudent.year}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Semester</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.semester || "Not Provided"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Email Address</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.email}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Phone Number</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.phoneNumber || "Not Provided"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Date of Birth</span>
                                                        <span className="font-bold text-gray-800">{formatDate(selectedStudent.dob)}</span>
                                                    </div>
                                                    {/* New: Gender field */}
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Gender</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.gender || "Not Provided"}</span>
                                                    </div>
                                                    {/* New: Category field (UG Student / PG Student) */}
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Category</span>
                                                        <span className="font-bold text-gray-800">{selectedStudent.category || "Not Provided"}</span>
                                                    </div>
                                                    {/* New: Password field — masked per existing security policy */}
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Password</span>
                                                        <span className="font-bold text-gray-800 tracking-widest">
                                                            {selectedStudent.hasPassword ? "••••••••" : "Not Provided"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Status</span>
                                                        <span className={`badge ${selectedStudent.status === "Active" ? "badge-success" : "badge-danger"} font-bold mt-0.5`}>
                                                            {selectedStudent.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Account Maintenance section removed */}
                                        </div>
                                    )}

                                    {/* 2. Tab Issued Books */}
                                    {activeTab === "issues" && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-3">
                                                Currently Borrowed Books ({activeIssues.length})
                                            </h3>

                                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                                            <th className="py-3 px-3 w-12">S.NO</th>
                                                            <th className="py-3 px-3 min-w-[120px]">Accession No</th>
                                                            <th className="py-3 px-3 min-w-[180px]">Book Title</th>
                                                            <th className="py-3 px-3 min-w-[120px]">Author</th>
                                                            <th className="py-3 px-3 min-w-[100px]">Issue Date</th>
                                                            <th className="py-3 px-3 min-w-[100px]">Renew Date</th>
                                                            <th className="py-3 px-3 min-w-[100px]">Status</th>
                                                            <th className="py-3 px-3 min-w-[100px] text-right">Fine Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {activeIssues.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={8} className="text-center py-8 text-gray-400">
                                                                    No active book issues
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            activeIssues.map((issue, idx) => {
                                                                const isOverdue = issue.status === "Overdue";
                                                                const needsRenewal = issue.status === "Issued" && isCloseToDue(issue.returnDate);

                                                                let statusText = "Active";
                                                                let statusClass = "badge-success";
                                                                if (isOverdue) {
                                                                    statusText = "Overdue";
                                                                    statusClass = "badge-danger";
                                                                } else if (needsRenewal) {
                                                                    statusText = "Need Renewal";
                                                                    statusClass = "badge-warning";
                                                                }

                                                                // Find matching unpaid fine
                                                                const fineRecord = unpaidFinesList.find(f => f.issueId === issue.id);
                                                                const fineVal = fineRecord ? parseFloat(fineRecord.amount) : 0;

                                                                return (
                                                                    <tr key={issue.id} className="border-b last:border-none border-gray-100 hover:bg-gray-50/50">
                                                                        <td className="py-3.5 px-3 font-semibold text-gray-400">{idx + 1}</td>
                                                                        <td className="py-3.5 px-3 font-bold text-gray-700">{issue.BookCopy?.accessionNo || "-"}</td>
                                                                        <td className="py-3.5 px-3 text-gray-800 font-medium">{issue.Book?.title}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{issue.Book?.author}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{formatDate(issue.issueDate)}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{formatDate(issue.returnDate)}</td>
                                                                        <td className="py-3.5 px-3">
                                                                            <span className={`badge ${statusClass}`}>
                                                                                {statusText}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3.5 px-3 text-right font-bold text-gray-700">
                                                                            ₹{fineVal.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="pt-2 text-right font-bold text-xs text-(--color-primary)">
                                                Total Fine for Issued Books: ₹{stats.totalFine.toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Tab History */}
                                    {activeTab === "history" && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-3">
                                                Borrowing History ({returnedIssues.length} records)
                                            </h3>

                                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                                            <th className="py-3 px-3">#</th>
                                                            <th className="py-3 px-3">Book Title</th>
                                                            <th className="py-3 px-3">Issue Date</th>
                                                            <th className="py-3 px-3">Return Date</th>
                                                            <th className="py-3 px-3 text-center">Renewal Count</th>
                                                            <th className="py-3 px-3 text-right">Fine Paid</th>
                                                            <th className="py-3 px-3">Activity Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {returnedIssues.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                                                    No returned borrow history
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            returnedIssues.map((issue, idx) => {
                                                                // Paid fines matching
                                                                const paidFines = selectedStudent.Fines?.filter(f => f.issueId === issue.id && f.status === "Paid") || [];
                                                                const totalPaidFine = paidFines.reduce((sum, f) => sum + parseFloat(f.amount), 0);

                                                                return (
                                                                    <tr key={issue.id} className="border-b last:border-none border-gray-100 hover:bg-gray-50/50">
                                                                        <td className="py-3.5 px-3 font-semibold text-gray-400">{idx + 1}</td>
                                                                        <td className="py-3.5 px-3 text-gray-800 font-medium">{issue.Book?.title}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{formatDate(issue.issueDate)}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{formatDate(issue.actualReturnDate)}</td>
                                                                        <td className="py-3.5 px-3 text-center text-gray-500">{issue.renewalCount || 0}</td>
                                                                        <td className="py-3.5 px-3 text-right font-semibold text-emerald-600">₹{totalPaidFine.toFixed(2)}</td>
                                                                        <td className="py-3.5 px-3">
                                                                            <span className="badge badge-success">
                                                                                Returned
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Tab Fines Summary */}
                                    {activeTab === "fines" && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-3">
                                                Outstanding Fine Breakdown ({unpaidFinesList.length})
                                            </h3>

                                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                                            <th className="py-3 px-3">#</th>
                                                            <th className="py-3 px-3">Book Title</th>
                                                            <th className="py-3 px-3">Due Date</th>
                                                            <th className="py-3 px-3">Return Date</th>
                                                            <th className="py-3 px-3 text-center">Overdue Days</th>
                                                            <th className="py-3 px-3 text-center">Fine Per Day</th>
                                                            <th className="py-3 px-3 text-right">Total Fine</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {unpaidFinesList.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                                                    No outstanding fines
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            unpaidFinesList.map((fine, idx) => {
                                                                const issue = selectedStudent.Issues?.find(i => i.id === fine.issueId);

                                                                // Calculate overdue days
                                                                let overdueDays = 0;
                                                                if (issue && issue.returnDate) {
                                                                    const due = new Date(issue.returnDate);
                                                                    const end = issue.actualReturnDate ? new Date(issue.actualReturnDate) : new Date();
                                                                    overdueDays = getOverdueDaysCount(due, end);
                                                                }

                                                                const finePerDay = overdueDays > 0 ? (parseFloat(fine.amount) / overdueDays) : parseFloat(fine.amount);

                                                                return (
                                                                    <tr key={fine.id} className="border-b last:border-none border-gray-100 hover:bg-gray-50/50">
                                                                        <td className="py-3.5 px-3 font-semibold text-gray-400">{idx + 1}</td>
                                                                        <td className="py-3.5 px-3 text-gray-800 font-medium">
                                                                            {issue?.Book?.title || fine.reason || "Late Return Fee"}
                                                                        </td>
                                                                        <td className="py-3.5 px-3 text-gray-500">{issue ? formatDate(issue.returnDate) : "-"}</td>
                                                                        <td className="py-3.5 px-3 text-gray-500">
                                                                            {issue?.actualReturnDate ? formatDate(issue.actualReturnDate) : "Not Returned"}
                                                                        </td>
                                                                        <td className="py-3.5 px-3 text-center text-gray-600 font-semibold">{overdueDays || "-"}</td>
                                                                        <td className="py-3.5 px-3 text-center text-gray-500">₹{finePerDay.toFixed(2)}</td>
                                                                        <td className="py-3.5 px-3 text-right font-bold text-red-500">₹{parseFloat(fine.amount).toFixed(2)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="pt-2 text-right font-bold text-xs text-red-500">
                                                Total Outstanding Fines: ₹{stats.totalFine.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State when no student is selected */
                        <div className="bg-white border border-[#eef0f4] rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                            <User size={48} className="text-gray-300 mb-4 animate-pulse" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">No Student Selected</h3>
                            <p className="text-xs text-gray-500 max-w-sm mt-2 leading-relaxed">
                                Select a student from the left panel to view their detailed profile, currently borrowed books, activity history, and fine details.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals rendering */}
            {showAddModal && (
                <AddStudentModal
                    setShowModal={setShowAddModal}
                    refreshStudents={fetchStudents}
                />
            )}

            {showBulkModal && (
                <BulkUploadModal
                    type="student"
                    onUpload={async (data) => {
                        try {
                            setLoading(true);
                            const res = await adminService.bulkUploadStudents(data);
                            if (res.success) {
                                alert(res.message || "Bulk upload successful");
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

            {showReportModal && (
                <StudentReports
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    filters={{ search, department: "" }}
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
            )}
        </div>
    );
}
