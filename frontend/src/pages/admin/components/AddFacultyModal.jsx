import { useState, useEffect } from "react";

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

            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl relative">

                {/* Close & Clear Button */}
                <button
                    type="button"
                    onClick={handleClearAndClose}
                    title="Clear & Close"
                    style={{
                        position: "absolute",
                        top: "1.1rem",
                        right: "1.1rem",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        border: "1.5px solid #e5e7eb",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#6b7280",
                        transition: "background 0.2s, color 0.2s",
                        lineHeight: 1,
                        zIndex: 10,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}
                >
                    ✕
                </button>

                <h2 className="font-heading text-2xl font-bold mb-6 text-[var(--color-primary)]">
                    Add New Faculty
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Faculty Name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <input
                        type="text"
                        placeholder="Employee ID"
                        required
                        value={formData.employeeId}
                        onChange={(e) =>
                            setFormData({ ...formData, employeeId: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <select
                        value={formData.department}
                        onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none bg-white cursor-pointer text-sm"
                    >
                        <option value="CSE">CSE</option>
                        <option value="AIDS">AIDS</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Designation (e.g. Professor, Asst. Professor)"
                        required
                        value={formData.designation}
                        onChange={(e) =>
                            setFormData({ ...formData, designation: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <div className="flex justify-end gap-4 pt-4">

                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-2 border rounded-xl hover:bg-gray-50 transition"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition font-medium"
                        >
                            Save Faculty
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
