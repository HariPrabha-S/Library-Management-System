import { useState, useEffect } from "react";

export default function AddFacultyModal({ setShowModal, setFaculties }) {

    const [formData, setFormData] = useState({
        name: "",
        employeeId: "",
        department: "CSE",
        designation: "",
        email: "",
    });

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
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [setShowModal]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] backdrop-blur-md animate-in fade-in duration-300 p-4">

            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">

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
                            onClick={() => setShowModal(false)}
                            className="px-6 py-2 border rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
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
