import { useState, useEffect } from "react";
import { X } from "lucide-react";

const initialFormData = {
    name: "",
    employeeId: "",
    department: "CSE",
    designation: "",
    email: "",
};

export default function AddFacultyModal({ setShowModal, setFaculties }) {

    const [formData, setFormData] = useState(initialFormData);

    const handleClear = () => {
        setFormData(initialFormData);
    };

    const handleClearAndClose = () => {
        setFormData(initialFormData);
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newFaculty = {
            ...formData,
            _id: Date.now().toString(),
        };

        setFaculties((prev) => [...prev, newFaculty]);
        setShowModal(false);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") handleClearAndClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] backdrop-blur-md animate-in fade-in duration-300 p-4">

            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200">

                {/* Close & Clear Button */}
                <button
                    type="button"
                    onClick={handleClearAndClose}
                    title="Clear & Close"
                    style={{
                        position: "absolute",
                        top: "1.2rem",
                        right: "1.2rem",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#6b7280",
                        transition: "all 0.2s ease",
                        zIndex: 10,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-8 text-[var(--color-primary)] font-heading flex flex-col">
                    Add New Faculty
                    <span className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wider">Faculty Profile details</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Dr. Rajesh Kumar"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Employee ID</label>
                            <input
                                type="text"
                                placeholder="e.g. FAC001"
                                required
                                value={formData.employeeId}
                                onChange={(e) =>
                                    setFormData({ ...formData, employeeId: e.target.value })
                                }
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Designation</label>
                            <input
                                type="text"
                                placeholder="e.g. Assistant Professor"
                                required
                                value={formData.designation}
                                onChange={(e) =>
                                    setFormData({ ...formData, designation: e.target.value })
                                }
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Department</label>
                        <select
                            value={formData.department}
                            onChange={(e) =>
                                setFormData({ ...formData, department: e.target.value })
                            }
                            className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer"
                        >
                            <option value="CSE">CSE</option>
                            <option value="AIDS">AIDS</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="faculty@college.edu"
                            required
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">

                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition font-medium"
                        >
                            Clear Form
                        </button>

                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/20 transition font-bold"
                        >
                            Save Faculty
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
