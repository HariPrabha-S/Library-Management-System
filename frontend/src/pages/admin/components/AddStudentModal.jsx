import { useState } from "react";

export default function AddStudentModal({ setShowModal, setStudents }) {

    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        department: "CSE",
        year: "1",
        email: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const newStudent = {
            ...formData,
            _id: Date.now().toString(),
        };

        setStudents((prev) => [...prev, newStudent]);
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-8 rounded-2xl w-full max-w-md">

                <h2 className="font-heading text-2xl font-bold mb-6 text-[var(--color-primary)]">
                    Add New Student
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <input
                        type="text"
                        placeholder="Roll No"
                        required
                        value={formData.rollNo}
                        onChange={(e) =>
                            setFormData({ ...formData, rollNo: e.target.value })
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
                        placeholder="Year (e.g. 1, 2, 3, 4)"
                        required
                        value={formData.year}
                        onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                        }
                        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                    />

                    <input
                        type="email"
                        placeholder="Email"
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
                            className="px-6 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 shadow-sm transition font-medium"
                        >
                            Save Student
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
