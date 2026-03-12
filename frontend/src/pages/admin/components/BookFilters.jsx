import { FiSearch } from "react-icons/fi";

export default function BookFilters({ filters, setFilters }) {

    const handleChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        });
    };

    return (

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">

            <h2 className="font-bold text-lg mb-4 text-[var(--color-primary)]">
                Search Books
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="relative">
                    <FiSearch className="absolute top-3 left-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Title"
                        value={filters.title}
                        onChange={(e)=>handleChange("title",e.target.value)}
                        className="w-full border pl-9 px-4 py-2 rounded-lg"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Author"
                    value={filters.author}
                    onChange={(e)=>handleChange("author",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

                <input
                    type="text"
                    placeholder="ISBN"
                    value={filters.isbn}
                    onChange={(e)=>handleChange("isbn",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

                <input
                    type="text"
                    placeholder="Department"
                    value={filters.department}
                    onChange={(e)=>handleChange("department",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

                <input
                    type="text"
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e)=>handleChange("subject",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

                <input
                    type="text"
                    placeholder="Publisher"
                    value={filters.publisher}
                    onChange={(e)=>handleChange("publisher",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

                <input
                    type="text"
                    placeholder="Language"
                    value={filters.language}
                    onChange={(e)=>handleChange("language",e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                />

            </div>

        </div>
    );
}