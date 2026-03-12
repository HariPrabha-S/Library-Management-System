export default function FacultyFilters({
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    sortOption,
    setSortOption
}) {

    return (

        <div className="bg-white p-5 rounded-2xl shadow-sm grid md:grid-cols-4 gap-4 mb-8 border border-gray-100">

            <input
                type="text"
                placeholder="Search faculty name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
            />

            <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none bg-white cursor-pointer text-sm"
            >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIDS">AIDS</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
            </select>

            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none bg-white cursor-pointer"
            >
                <option value="name">Sort by Name</option>
                <option value="id">Sort by Employee ID</option>
            </select>

        </div>

    );
}
