import { XCircle } from "lucide-react";

export default function IssueFilters({
    search,
    setSearch,
    department,
    setDepartment
}) {

    return (

        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 flex-wrap">

            <div className="relative flex-1 min-w-[300px]">
                <input
                    type="text"
                    placeholder="Search by student or book..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 pl-4 pr-10 py-2 rounded-xl focus:border-(--color-primary) focus:shadow-md transition-all duration-300 outline-none"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <XCircle size={16} title="Clear search" />
                    </button>
                )}
            </div>

            <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl focus:border-(--color-primary) focus:shadow-md transition-all duration-300 outline-none bg-white cursor-pointer text-sm"
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
