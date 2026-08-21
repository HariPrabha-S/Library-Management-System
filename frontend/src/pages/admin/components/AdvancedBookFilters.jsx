import { FiSearch, FiRotateCcw, FiFilter } from "react-icons/fi";

export default function AdvancedBookFilters({ filters, setFilters }) {

    const handleChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            keyword: "",
            field: "title", // Default search field fallback if needed, but we do multi-field in parent
            department: "",
            subject: "",
            issueType: "",
            availability: ""
        });
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md mb-6 flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                    type="text"
                    placeholder="Search by title, author, accession no..."
                    value={filters.keyword}
                    onChange={(e) => handleChange("keyword", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-[#790c0c] focus:bg-white focus:ring-2 focus:ring-[#790c0c]/10 outline-none transition"
                />
            </div>

            {/* Department Dropdown */}
            <select
                value={filters.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-white focus:border-[#790c0c] focus:ring-2 focus:ring-[#790c0c]/10 outline-none transition cursor-pointer min-w-[160px]"
            >
                <option value="">All Departments</option>
                <option value="Computer Science Engineering">Computer Science Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                <option value="Management">Management</option>
                <option value="General">General</option>
            </select>

            {/* Subject Dropdown */}
            <select
                value={filters.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-white focus:border-[#790c0c] focus:ring-2 focus:ring-[#790c0c]/10 outline-none transition cursor-pointer min-w-[150px]"
            >
                <option value="">All Subjects</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Business Management">Business Management</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
            </select>

            {/* Issue Type Dropdown */}
            <select
                value={filters.issueType}
                onChange={(e) => handleChange("issueType", e.target.value)}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-white focus:border-[#790c0c] focus:ring-2 focus:ring-[#790c0c]/10 outline-none transition cursor-pointer min-w-[140px]"
            >
                <option value="">All Issue Types</option>
                <option value="Issuable">Issuable</option>
                <option value="Reference">Reference</option>
                <option value="Overnight">Overnight</option>
            </select>

            {/* Status Dropdown */}
            <select
                value={filters.availability}
                onChange={(e) => handleChange("availability", e.target.value)}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-white focus:border-[#790c0c] focus:ring-2 focus:ring-[#790c0c]/10 outline-none transition cursor-pointer min-w-[130px]"
            >
                <option value="">All Status</option>
                <option value="available">Active</option>
                <option value="issued">Inactive</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => {}} // live filtering is active, button triggers nothing but provides visual cue
                    className="flex items-center justify-center gap-2 bg-[#790c0c] hover:bg-[#610a0a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 active:scale-95 cursor-pointer shadow-sm"
                >
                    <FiFilter />
                    <span>Filter</span>
                </button>
                
                <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 cursor-pointer"
                >
                    <FiRotateCcw />
                    <span>Reset</span>
                </button>
            </div>

        </div>
    );
}
