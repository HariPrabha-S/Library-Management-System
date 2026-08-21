import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Users, Save, CheckCircle, RefreshCcw, Search, GraduationCap, AlertCircle } from 'lucide-react';

export default function StudentsByAcademicYear() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [students, setStudents] = useState([]);
    
    // Bulk Update State
    const [newYear, setNewYear] = useState('');
    const [newSemester, setNewSemester] = useState('');
    
    // UI State
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch batches on mount
    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoadingBatches(true);
            setError(null);
            const response = await adminService.getStudentBatches();
            if (response.success && response.data) {
                setBatches(response.data);
            }
        } catch (err) {
            console.error('Error fetching batches:', err);
            setError(err.message || 'Failed to load Academic Years');
        } finally {
            setLoadingBatches(false);
        }
    };

    const fetchStudents = async (batch) => {
        if (!batch) {
            setStudents([]);
            return;
        }
        try {
            setLoadingStudents(true);
            setError(null);
            const response = await adminService.getStudents({ batch });
            if (response.success && response.data) {
                setStudents(response.data);
            } else {
                setStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleBatchChange = (e) => {
        const batch = e.target.value;
        setSelectedBatch(batch);
        setSuccessMessage(null);
        setError(null);
        // Reset update fields
        setNewYear('');
        setNewSemester('');
        
        if (batch) {
            fetchStudents(batch);
        } else {
            setStudents([]);
        }
    };

    const handleUpdate = async () => {
        if (!selectedBatch) return;
        if (!newYear && !newSemester) {
            setError('Please select either a new Year or a new Semester to update.');
            return;
        }

        const confirmMessage = `Are you sure you want to update ${students.length} student(s) from Academic Year "${selectedBatch}"?\n\nUpdates to apply:\n${newYear ? `- Year: ${newYear}\n` : ''}${newSemester ? `- Semester: ${newSemester}\n` : ''}`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setUpdating(true);
            setError(null);
            setSuccessMessage(null);
            
            const payload = {
                batch: selectedBatch,
                year: newYear || undefined,
                semester: newSemester || undefined
            };

            const response = await adminService.bulkUpdateStudentAcademic(payload);
            
            if (response.success) {
                const count = response.data?.updatedCount || students.length;
                setSuccessMessage(`Successfully updated ${count} student(s)!`);
                setNewYear('');
                setNewSemester('');
                // Refresh data
                await fetchStudents(selectedBatch);
            } else {
                setError('Failed to update students.');
            }
        } catch (err) {
            console.error('Error updating academic details:', err);
            setError(err.message || 'Failed to perform bulk update');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        Students by Academic Year
                    </h1>
                    <p className="text-gray-500 mt-1">
                        View and bulk update academic year and semester for student batches.
                    </p>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Panel: Filter & Bulk Update Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Filter Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
                            Select Batch
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Academic Year (Batch)
                                </label>
                                <select
                                    value={selectedBatch}
                                    onChange={handleBatchChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    disabled={loadingBatches || updating}
                                >
                                    <option value="">-- Select Academic Year --</option>
                                    {batches.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                {loadingBatches && <p className="text-xs text-blue-600 mt-2">Loading batches...</p>}
                            </div>
                        </div>
                    </div>

                    {/* Bulk Update Card */}
                    {selectedBatch && students.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
                                Bulk Update
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Updates will apply to all <b className="text-blue-600">{students.length}</b> students in batch <b>{selectedBatch}</b>.
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Year
                                    </label>
                                    <select
                                        value={newYear}
                                        onChange={(e) => setNewYear(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={updating}
                                    >
                                        <option value="">-- Select Year --</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Semester
                                    </label>
                                    <select
                                        value={newSemester}
                                        onChange={(e) => setNewSemester(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={updating}
                                    >
                                        <option value="">-- Select Semester --</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleUpdate}
                                    disabled={updating || (!newYear && !newSemester)}
                                    className="w-full mt-4 flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? (
                                        <>
                                            <RefreshCcw className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Update All Students
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Student Data Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-400" />
                                Student List
                            </h3>
                            {selectedBatch && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                    Total: {students.length}
                                </span>
                            )}
                        </div>

                        <div className="overflow-x-auto min-h-[400px]">
                            {loadingStudents ? (
                                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                                    <RefreshCcw className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                                    <p>Loading students...</p>
                                </div>
                            ) : !selectedBatch ? (
                                <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                                    <Search className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Select an Academic Year to view students</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex justify-center items-center h-64 text-gray-500">
                                    <p>No students found for this academic year.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-xs">
                                            <th className="py-3 px-4 w-16">S.No</th>
                                            <th className="py-3 px-4">Roll No</th>
                                            <th className="py-3 px-4">Student Name</th>
                                            <th className="py-3 px-4">Department</th>
                                            <th className="py-3 px-4 text-center">Year</th>
                                            <th className="py-3 px-4 text-center">Semester</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, idx) => (
                                            <tr key={student.id} className="border-b last:border-none border-gray-100 hover:bg-gray-50/50">
                                                <td className="py-3 px-4 text-gray-500 font-medium">{idx + 1}</td>
                                                <td className="py-3 px-4 font-semibold text-gray-700">{student.rollNo}</td>
                                                <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{student.department || '-'}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {student.year ? `Year ${student.year}` : '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                                        {student.semester ? `Sem ${student.semester}` : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
