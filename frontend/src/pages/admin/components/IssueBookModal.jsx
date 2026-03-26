import { useState } from "react";

const initialForm = {
    student: "",
    book: "",
    department: "CSE",
    issueDate: new Date().toISOString().split('T')[0],
    returnDate: ""
};

export default function IssueBookModal({ onClose, onAdd }) {

    const [form, setForm] = useState(initialForm);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleClear = () => {
        setForm(initialForm);
    };

    const handleClearAndClose = () => {
        setForm(initialForm);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.student || !form.book) return;

        onAdd(form);
        onClose();
    };

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

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
                    Issue New Book
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                        <input
                            name="student"
                            required
                            placeholder="e.g. Arun Kumar"
                            value={form.student}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                        <input
                            name="book"
                            required
                            placeholder="e.g. Data Structures"
                            value={form.book}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            name="department"
                            value={form.department}
                            onChange={handleChange}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                            <input
                                type="date"
                                name="issueDate"
                                required
                                value={form.issueDate}
                                onChange={handleChange}
                                className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                            <input
                                type="date"
                                name="returnDate"
                                required
                                value={form.returnDate}
                                onChange={handleChange}
                                className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
                            />
                        </div>
                    </div>

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
                            Issue Book
                        </button>

                    </div>
                </form>

            </div>

        </div>
    );
}
