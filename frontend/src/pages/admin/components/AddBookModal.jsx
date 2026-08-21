import { useState, useEffect } from "react";
import adminService from "../services/adminService";

const initialFormData = {
    accessionNo: "",
    title: "",
    subtitle: "",
    author: "",
    isbn: "",
    publisher: "",
    edition: "",
    year: "",
    department: "",
    subject: "",
    language: "",
    category: "",
    callNumber: "",
    shelfLocation: "",
    issueType: "Issuable",
    totalCopies: 1,
    availableCopies: 1
};

export default function AddBookModal({ setShowModal, refreshBooks }) {

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClear = () => {
        setFormData(initialFormData);
    };

    const handleClearAndClose = () => {
        setFormData(initialFormData);
        setShowModal(false);
    };

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [setShowModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await adminService.addBook(formData);
            if (res.success) {
                alert("Book added successfully!");
                refreshBooks();
                setShowModal(false);
            } else {
                alert("Error: " + (res.message || "Failed to add book"));
            }
        } catch (error) {
            console.error(error);
            alert("Network error while adding book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") handleClearAndClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-300 backdrop-blur-md animate-in fade-in duration-300 p-4">

            <div className="bg-white p-8 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">

                <button
                    type="button"
                    onClick={handleClearAndClose}
                    title="Clear & Close"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-6 text-(--color-primary) font-heading border-b pb-4">
                    Add New Book
                </h2>

                <form onSubmit={handleSubmit} className={`grid grid-cols-2 gap-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Accession NO</label>
                        <input type="text" placeholder="Accession No." value={formData.accessionNo} onChange={(e) => handleChange("accessionNo", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/20 outline-none transition-all font-bold" required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">ISBN</label>
                        <input
                            type="text"
                            placeholder="13-digit ISBN"
                            value={formData.isbn}
                            onChange={(e) => handleChange("isbn", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                        <input type="text" placeholder="Book Title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/20 outline-none transition-all font-bold" required />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2 text-sm">
                        <label className="text-xs font-bold text-gray-500 uppercase">Author(s)</label>
                        <input
                            type="text"
                            placeholder="Full name of authors"
                            value={formData.author}
                            onChange={(e) => handleChange("author", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-100 bg-gray-50 focus:bg-white rounded-xl outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                        <input
                            type="text"
                            placeholder="e.g. CSE, ECE"
                            value={formData.department}
                            onChange={(e) => handleChange("department", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-100 bg-gray-50 focus:bg-white rounded-xl outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures"
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-100 bg-gray-50 focus:bg-white rounded-xl outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Issue Type</label>
                        <select
                            value={formData.issueType}
                            onChange={(e) => handleChange("issueType", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white cursor-pointer"
                        >
                            <option value="Issuable">Issuable</option>
                            <option value="Reference">Reference</option>
                            <option value="Overnight">Overnight</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Total Copies</label>
                        <input
                            type="number"
                            placeholder="Total stock"
                            min="1"
                            value={formData.totalCopies}
                            onChange={(e) => {
                                handleChange("totalCopies", Number(e.target.value))
                                handleChange("availableCopies", Number(e.target.value))
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--color-primary)/20 transition"
                        />
                    </div>

                    <div className="col-span-2 flex justify-end gap-3 pt-6">

                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2 bg-(--color-primary) text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {loading ? "Saving..." : "Save Book"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}