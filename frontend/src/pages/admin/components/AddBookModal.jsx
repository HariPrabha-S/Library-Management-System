import { useState, useEffect } from "react";

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

export default function AddBookModal({ setShowModal, setBooks }) {

    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleClear = () => {
        setFormData(initialFormData);
    };

    const handleClearAndClose = () => {
        setFormData(initialFormData);
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newBook = {
            ...formData,
            _id: Date.now(),
            createdAt: new Date(),
            timesIssued: 0
        };

        setBooks(prev => [...prev, newBook]);
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

            <div className="bg-white p-8 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">

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

                <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)] font-heading">
                    Add New Book
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                    <input
                        type="text"
                        placeholder="Accession Number"
                        value={formData.accessionNo}
                        onChange={(e) => handleChange("accessionNo", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="ISBN"
                        value={formData.isbn}
                        onChange={(e) => handleChange("isbn", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Book Title"
                        required
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="border px-4 py-2 rounded-lg col-span-2"
                    />

                    <input
                        type="text"
                        placeholder="Subtitle"
                        value={formData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                        className="border px-4 py-2 rounded-lg col-span-2"
                    />

                    <input
                        type="text"
                        placeholder="Author"
                        value={formData.author}
                        onChange={(e) => handleChange("author", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Publisher"
                        value={formData.publisher}
                        onChange={(e) => handleChange("publisher", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Edition"
                        value={formData.edition}
                        onChange={(e) => handleChange("edition", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="number"
                        placeholder="Year of Publishing"
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Department"
                        value={formData.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Language"
                        value={formData.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Call Number"
                        value={formData.callNumber}
                        onChange={(e) => handleChange("callNumber", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Shelf Location (Rack)"
                        value={formData.shelfLocation}
                        onChange={(e) => handleChange("shelfLocation", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <select
                        value={formData.issueType}
                        onChange={(e) => handleChange("issueType", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    >
                        <option>Issuable</option>
                        <option>Reference</option>
                        <option>Overnight</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Total Copies"
                        min="1"
                        value={formData.totalCopies}
                        onChange={(e) => {
                            handleChange("totalCopies", Number(e.target.value))
                            handleChange("availableCopies", Number(e.target.value))
                        }}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <div className="col-span-2 flex justify-end gap-4 pt-4">

                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
                        >
                            Save Book
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}