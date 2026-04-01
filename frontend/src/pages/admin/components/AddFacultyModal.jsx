import { useState, useEffect } from "react";
import { X, UserPlus, Mail, Hash, BookOpen, Briefcase } from "lucide-react";
import adminService from "../services/adminService";

const initialFormData = {
    name: "",
    employeeId: "",
    department: "CSE",
    designation: "",
    email: "",
};

export default function AddFacultyModal({ setShowModal, refreshFaculties }) {
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
            const res = await adminService.addFaculty(formData);
            if (res.success) {
                alert("Faculty profiles updated successfully!");
                refreshFaculties();
                setShowModal(false);
            } else {
                alert("Error: " + (res.message || "Failed to add Faculty"));
            }
        } catch (error) {
            console.error("AddFaculty error:", error);
            alert("Network error while adding Faculty");
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
                    Add New Faculty
                    <span className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wider">Faculty Details & Position</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <UserPlus size={12} /> Faculty Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Dr. Rajesh Kumar"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} /> Employee ID
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. EMP001"
                                required
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
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
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={12} /> Designation
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Professor / Associate Professor"
                            required
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="w-full border border-gray-200 px-4 py-3.5 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="faculty@college.edu"
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
                            {loading ? "Registering..." : "Complete Faculty Setup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
