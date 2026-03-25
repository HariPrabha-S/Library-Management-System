import { useState, useEffect } from "react";

export default function AddBookModal({ setShowModal, setBooks }) {

    const [formData, setFormData] = useState({
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
    });

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
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
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [setShowModal]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] backdrop-blur-md animate-in fade-in duration-300 p-4">

            <div className="bg-white p-8 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">

                <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)] font-heading">
                    Add New Book
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                    <input
                        type="text"
                        placeholder="Accession Number"
                        onChange={(e) => handleChange("accessionNo", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="ISBN"
                        onChange={(e) => handleChange("isbn", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Book Title"
                        required
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="border px-4 py-2 rounded-lg col-span-2"
                    />

                    <input
                        type="text"
                        placeholder="Subtitle"
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                        className="border px-4 py-2 rounded-lg col-span-2"
                    />

                    <input
                        type="text"
                        placeholder="Author"
                        onChange={(e) => handleChange("author", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Publisher"
                        onChange={(e) => handleChange("publisher", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Edition"
                        onChange={(e) => handleChange("edition", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="number"
                        placeholder="Year of Publishing"
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Department"
                        onChange={(e) => handleChange("department", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Subject"
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Language"
                        onChange={(e) => handleChange("language", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Call Number"
                        onChange={(e) => handleChange("callNumber", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <input
                        type="text"
                        placeholder="Shelf Location (Rack)"
                        onChange={(e) => handleChange("shelfLocation", e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <select
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
                        onChange={(e) => {
                            handleChange("totalCopies", Number(e.target.value))
                            handleChange("availableCopies", Number(e.target.value))
                        }}
                        className="border px-4 py-2 rounded-lg"
                    />

                    <div className="col-span-2 flex justify-end gap-4 pt-4">

                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
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