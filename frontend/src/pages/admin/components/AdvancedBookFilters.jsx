import { FiSearch, FiRotateCcw } from "react-icons/fi";

export default function AdvancedBookFilters({ filters, setFilters }) {

    const handleChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        });
    };

    const resetFilters = () => {
        setFilters({
            keyword: "",
            field: "title",
            department: "",
            subject: "",
            issueType: "",
            availability: ""
        });
    };

    return (

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">

            <h2 className="font-bold text-lg mb-4 text-[var(--color-primary)]">
                Book Search
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

                {/* Search Field & Keyword */}
                <div className="flex gap-2 col-span-1 md:col-span-2">
                    <select
                        value={filters.field}
                        onChange={(e) => handleChange("field", e.target.value)}
                        className="border px-3 py-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                    >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="isbn">ISBN</option>
                        <option value="accessionNo">Accession No</option>
                        <option value="subtitle">Subtitle</option>
                        <option value="publisher">Publisher</option>
                        <option value="callNumber">Call Number</option>
                    </select>
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter search keyword..."
                            value={filters.keyword}
                            onChange={(e) => handleChange("keyword", e.target.value)}
                            className="w-full border pl-9 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                        />
                    </div>
                </div>

                {/* Subject */}
                <input
                    type="text"
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                />

                {/* Department */}
                <select
                    value={filters.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition bg-white"
                >
                    <option value="">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="AIDS">AIDS</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MECH">MECH</option>
                </select>


                {/* Availability */}
                <select
                    value={filters.availability}
                    onChange={(e) => handleChange("availability", e.target.value)}
                    className="border px-3 py-2 rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                >
                    <option value="">All Availability</option>
                    <option value="available">Available</option>
                    <option value="issued">Issued</option>
                </select>

                {/* Reset */}
                <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 text-gray-600 font-medium transition active:scale-95"
                >
                    <FiRotateCcw />
                    Reset Search
                </button>

            </div>

        </div>
    );
}
