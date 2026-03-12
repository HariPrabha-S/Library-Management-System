export default function IssueFilters({
    search,
    setSearch,
    department,
    setDepartment
}) {

    return (

        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 flex-wrap">

            <input
                type="text"
                placeholder="Search by student or book..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none"
            />

            <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl focus:border-[var(--color-primary)] focus:shadow-md transition-all duration-300 outline-none bg-white cursor-pointer text-sm"
            >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIDS">AIDS</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
            </select>

        </div>
    );
}
