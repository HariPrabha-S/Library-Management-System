import { useState } from "react";
import { FiSearch, FiRefreshCw, FiCornerDownLeft, FiAlertTriangle } from "react-icons/fi";
import adminService from "./services/adminService";

export default function ManageIssues() {
    const [memberIdInput, setMemberIdInput] = useState("");
    const [loadedMember, setLoadedMember] = useState(null);
    const [memberIssues, setMemberIssues] = useState([]);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [waiveFine, setWaiveFine] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showLockPopup, setShowLockPopup] = useState(false);
    const [pendingMemberData, setPendingMemberData] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!memberIdInput.trim()) return;

        setLoading(true);
        setLoadedMember(null);
        setMemberIssues([]);
        setSelectedIssueId(null);
        setWaiveFine(false);

        try {
            // Search students
            const studentRes = await adminService.getStudents({ search: memberIdInput.trim() });
            let foundMember = null;
            let memberType = "";

            if (studentRes.success && studentRes.data.length > 0) {
                // Find exact match by rollNo
                const exactStudent = studentRes.data.find(s => s.rollNo.toLowerCase() === memberIdInput.trim().toLowerCase());
                if (exactStudent) {
                    foundMember = exactStudent;
                    memberType = "Student";
                }
            }

            if (!foundMember) {
                // Search faculties
                const facultyRes = await adminService.getFaculties({ search: memberIdInput.trim() });
                if (facultyRes.success && facultyRes.data.length > 0) {
                    // Find exact match by employeeId
                    const exactFaculty = facultyRes.data.find(f => f.employeeId.toLowerCase() === memberIdInput.trim().toLowerCase());
                    if (exactFaculty) {
                        foundMember = exactFaculty;
                        memberType = "Faculty";
                    }
                }
            }

            if (!foundMember) {
                alert("No member found with the exact Register Number or Faculty ID.");
                setLoading(false);
                return;
            }

            if (foundMember.isLocked && memberType === "Student") {
                setPendingMemberData({ foundMember, memberType, searchId: memberIdInput.trim() });
                setShowLockPopup(true);
                setLoading(false);
                return;
            }

            // Set member
            setLoadedMember({ ...foundMember, memberType });

            // Fetch issues
            await fetchIssues(memberIdInput.trim());

        } catch (error) {
            console.error("Error searching member:", error);
            alert("Error searching for member.");
        } finally {
            if (!showLockPopup) setLoading(false);
        }
    };

    const handleLockContinue = async () => {
        setShowLockPopup(false);
        setLoadedMember({ ...pendingMemberData.foundMember, memberType: pendingMemberData.memberType });
        setLoading(true);
        await fetchIssues(pendingMemberData.searchId);
        setLoading(false);
        setPendingMemberData(null);
    };

    const handleLockCancel = () => {
        setShowLockPopup(false);
        setPendingMemberData(null);
        setLoading(false);
    };

    const fetchIssues = async (searchId) => {
        try {
            const res = await adminService.getIssues({ search: searchId, status: "All" }); // 'All' fetches all, then we filter active
            if (res.success) {
                // Filter only Issued or Overdue
                const activeIssues = res.data.filter(i => i.status === 'Issued' || i.status === 'Overdue');
                setMemberIssues(activeIssues);
                
                // If the selected issue is no longer active, unselect it
                if (selectedIssueId && !activeIssues.find(i => i.id === selectedIssueId)) {
                    setSelectedIssueId(null);
                    setWaiveFine(false);
                }
            }
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    const handleRenew = async () => {
        if (!selectedIssueId) return;
        if (!window.confirm("Are you sure you want to renew this book?")) return;
        
        setActionLoading(true);
        try {
            const res = await adminService.renewBook(selectedIssueId, { waiveFine });
            if (res.success) {
                alert("Book renewed successfully.");
                await fetchIssues(memberIdInput.trim());
            } else {
                alert(res.message || "Failed to renew book.");
            }
        } catch (e) {
            alert("Network error renewing book.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!selectedIssueId) return;
        if (!window.confirm("Are you sure you want to return this book?")) return;

        setActionLoading(true);
        try {
            const res = await adminService.returnBook(selectedIssueId, { waiveFine });
            if (res.success) {
                alert("Book returned successfully.");
                await fetchIssues(memberIdInput.trim());
            } else {
                alert(res.message || "Failed to return book.");
            }
        } catch (e) {
            alert("Network error returning book.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLost = async () => {
        if (!selectedIssueId) return;
        if (!window.confirm("Are you sure you want to mark this book as LOST? This action cannot be undone easily.")) return;

        setActionLoading(true);
        try {
            const res = await adminService.markBookLost(selectedIssueId, { waiveFine });
            if (res.success) {
                alert("Book marked as lost.");
                await fetchIssues(memberIdInput.trim());
            } else {
                alert(res.message || "Failed to mark book as lost.");
            }
        } catch (e) {
            alert("Network error marking book as lost.");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    const selectedIssue = memberIssues.find(i => i.id === selectedIssueId);

    // Calculate dynamic fine approximation for display if overdue
    let currentFine = 0;
    if (selectedIssue && selectedIssue.status === 'Overdue') {
        const dueDate = new Date(selectedIssue.dueDate);
        const today = new Date();
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Approximate fine (Rs.1 per day, ignoring holidays for UI preview)
        currentFine = diffDays * 1; 
    }

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="font-heading text-3xl font-bold text-(--color-primary)">
                    Circulation / Manage Issues
                </h1>
                <p className="text-gray-500 text-sm mt-1">Search member, view details and manage issued books</p>
            </div>

            {showLockPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-2">
                                <FiAlertTriangle /> Student is Locked
                            </h2>
                            <p className="text-gray-600 text-sm font-medium mb-6">
                                This student is currently locked. Want to continue?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={handleLockCancel} className="btn btn-outline border-gray-200 py-2 px-4 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button onClick={handleLockContinue} className="btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition">
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Member Search */}
            <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-(--color-primary) uppercase tracking-wide mb-4">1. Member Search</h3>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Member ID (Register No. / Faculty ID)</label>
                        <input 
                            type="text" 
                            placeholder="Enter Register Number or Faculty ID" 
                            value={memberIdInput}
                            onChange={(e) => setMemberIdInput(e.target.value)}
                            className="border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-(--color-primary) font-bold w-full"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn bg-(--color-primary) text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                    >
                        <FiSearch /> {loading ? "Searching..." : "Search"}
                    </button>
                    
                    <div className="ml-auto bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-xs">
                        <FiAlertTriangle className="flex-shrink-0" />
                        <span>Enter Student Register Number or Faculty ID to load member details and issued books.</span>
                    </div>
                </form>
            </div>

            {loadedMember && (
                <div className="space-y-6 animate-fade-in">
                    {/* 2. Member Information */}
                    <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold text-(--color-primary) uppercase tracking-wide mb-4">2. Member Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Member ID</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.memberType === "Student" ? loadedMember.rollNo : loadedMember.employeeId}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Semester</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.memberType === "Student" ? `${loadedMember.semester || "N/A"}` : "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Designation</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.memberType === "Faculty" ? (loadedMember.designation || "N/A") : "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Member Type</span>
                                    <span className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">
                                        <span className={`badge ${loadedMember.memberType === 'Student' ? 'badge-success' : 'badge-primary'} font-bold`}>{loadedMember.memberType}</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full truncate">{loadedMember.email || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Department</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.departmentFull || loadedMember.department || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.phoneNumber || loadedMember.phone || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Year of Study</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.memberType === "Student" ? (loadedMember.year || "N/A") : "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Gender</span>
                                    <span className="font-bold text-gray-800 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50/50 block w-full">{loadedMember.gender || "N/A"}</span>
                                </div>
                            </div>
                            
                            <div className="md:col-span-1 flex flex-col items-center justify-center border-l border-gray-100 pl-6">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Status</span>
                                <span className={`badge ${loadedMember.status === "Active" ? "badge-success" : "badge-danger"} font-bold mb-6 px-5 py-1.5 text-sm`}>{loadedMember.status || "Unknown"}</span>
                                
                                <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${loadedMember.name}&backgroundColor=780f24,000000`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Issued Books */}
                    <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold text-(--color-primary) uppercase tracking-wide mb-4">3. Issued Books</h3>
                        
                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                                        <th className="py-4 px-4 w-12 text-center">S.No</th>
                                        <th className="py-4 px-4">Book Title</th>
                                        <th className="py-4 px-4">Accession No.</th>
                                        <th className="py-4 px-4">Issue Date</th>
                                        <th className="py-4 px-4">Due Date</th>
                                        <th className="py-4 px-4">Status</th>
                                        <th className="py-4 px-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberIssues.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-gray-400 text-sm font-medium">
                                                No books currently issued to this member.
                                            </td>
                                        </tr>
                                    ) : (
                                        memberIssues.map((issue, idx) => (
                                            <tr key={issue.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition ${selectedIssueId === issue.id ? 'bg-red-50/30' : ''}`}>
                                                <td className="py-3 px-4 text-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center ${selectedIssueId === issue.id ? 'border-(--color-primary)' : 'border-gray-300'}`}>
                                                        {selectedIssueId === issue.id && <div className="w-2 h-2 bg-(--color-primary) rounded-full"></div>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-gray-800">{issue.book}</td>
                                                <td className="py-3 px-4 text-gray-600">{issue.accessionNo}</td>
                                                <td className="py-3 px-4 text-gray-600">{formatDate(issue.issueDate)}</td>
                                                <td className="py-3 px-4 text-gray-600 font-bold">{formatDate(issue.dueDate)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`badge ${issue.status === 'Overdue' ? 'badge-danger' : 'badge-primary'} font-bold`}>{issue.status}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button 
                                                        onClick={() => setSelectedIssueId(issue.id)}
                                                        className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition ${selectedIssueId === issue.id ? 'bg-(--color-primary) text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 shadow-sm'}`}
                                                    >
                                                        {selectedIssueId === issue.id ? 'Selected' : 'Select'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 text-[10px] font-bold text-gray-400 tracking-wider px-1">
                            Showing {memberIssues.length} active record(s)
                        </div>
                    </div>

                    {/* 4. Selected Book Actions */}
                    <div className={`bg-white border border-[#eef0f4] rounded-2xl shadow-sm p-6 transition-all duration-300 ${selectedIssueId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                            <h3 className="text-sm font-bold text-(--color-primary) uppercase tracking-wide flex items-center gap-3">
                                4. Selected Book Actions
                                {selectedIssue && (
                                    <span className="badge badge-primary bg-red-50 text-(--color-primary) border border-red-100 font-bold normal-case text-xs px-3 py-1">
                                        Selected: <span className="font-black ml-1">{selectedIssue.book}</span> ({selectedIssue.accessionNo})
                                    </span>
                                )}
                            </h3>
                        </div>

                        {selectedIssue ? (
                            <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50/80 p-5 rounded-xl border border-gray-100">
                                
                                <div className="flex gap-4 flex-1 overflow-x-auto pb-2 md:pb-0 w-full">
                                    <div className="flex flex-col bg-white px-5 py-3 rounded-xl border border-gray-200 min-w-max shadow-sm flex-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Due Date</span>
                                        <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <span className="text-green-600">📅</span> {formatDate(selectedIssue.dueDate)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-white px-5 py-3 rounded-xl border border-gray-200 min-w-max shadow-sm flex-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</span>
                                        <div className="flex items-center h-full">
                                            <span className={`badge ${selectedIssue.status === 'Overdue' ? 'badge-danger' : 'badge-primary'} font-bold`}>{selectedIssue.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col bg-white px-5 py-3 rounded-xl border border-gray-200 min-w-max shadow-sm flex-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Fine</span>
                                        <span className={`font-bold text-base ${waiveFine ? 'text-gray-400 line-through' : 'text-red-600'}`}>
                                            ₹ {currentFine.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-center min-w-max pl-2">
                                        <label className="flex items-center gap-2.5 cursor-pointer group mb-1">
                                            <input 
                                                type="checkbox" 
                                                checked={waiveFine} 
                                                onChange={(e) => setWaiveFine(e.target.checked)} 
                                                className="w-4 h-4 text-(--color-primary) border-gray-300 rounded focus:ring-(--color-primary) cursor-pointer"
                                            />
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-black transition">No Fine</span>
                                        </label>
                                        <span className="text-[10px] text-gray-400 font-medium">Check to waive the fine<br/>for this transaction.</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                    <button onClick={handleRenew} disabled={actionLoading} className="btn bg-green-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50 shadow-sm">
                                        <FiRefreshCw /> Renew
                                    </button>
                                    <button onClick={handleReturn} disabled={actionLoading} className="btn bg-blue-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                                        <FiCornerDownLeft /> Return
                                    </button>
                                    <button onClick={handleLost} disabled={actionLoading} className="btn bg-red-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50 shadow-sm">
                                        <FiAlertTriangle /> Lost
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                Select a book from the issued books list to perform actions.
                            </div>
                        )}
                        
                        <div className="mt-5 flex items-start md:items-center gap-3 text-xs font-bold text-blue-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">i</span>
                            Fines and due dates are calculated dynamically based on system rules, holidays and weekends.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
