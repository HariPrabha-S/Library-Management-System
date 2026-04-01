import { useState, useEffect } from "react";
import { X, UserPlus, Mail, Hash, BookOpen, GraduationCap } from "lucide-react";
import adminService from "../services/adminService";

const initialFormData = {
    name: "",
    rollNo: "",
    department: "CSE",
    year: "1",
    email: "",
};

export default function AddStudentModal({ setShowModal, refreshStudents }) {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);

    const handleClearAndClose = () => {
        setFormData(initialFormData);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            const res = await adminService.addStudent(formData);
            if (res.success) {
                alert("Student profile created successfully!");
                refreshStudents();
                setShowModal(false);
            } else {
                alert("Error: " + (res.message || "Failed to add student"));
            }
        } catch (error) {
            console.error("AddStudent error:", error);
            alert("Network error while adding student");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === "Escape") handleClearAndClose();
            if (e.key === "Enter") {
                if (e.target.tagName !== "BUTTON" && e.target.tagName !== "SELECT" && !loading) {
                    handleSubmit();
                }
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [formData, loading]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-300 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className={`bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>

                <button
                    onClick={handleClearAndClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-xl"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-8 text-(--color-primary) font-heading flex flex-col">
                    Add New Student
                    <span className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wider">Student Profile Details</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <UserPlus size={12} /> Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} /> Roll Number
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 21CS001"
                                required
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap size={12} /> Batch Year
                            </label>
                            <select
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={12} /> Department
                        </label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                        >
                            <option value="CSE">CSE</option>
                            <option value="AIDS">AIDS</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="student@college.edu"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                        />
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleClearAndClose}
                            className="flex-1 px-8 py-3.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-(--color-primary) text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-(--color-primary)/20 hover:opacity-95 items-center justify-center gap-2 flex transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Registering..." : "Save Student Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
